
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { X, Mic, MicOff, Zap, Headphones, Sparkles, Volume2 } from 'lucide-react';

interface LiveStylistProps {
  onClose: () => void;
  userProfile: any;
}

const LiveStylist: React.FC<LiveStylistProps> = ({ onClose, userProfile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Initializing Session...');
  const [transcript, setTranscript] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      // Supported audio MIME type for Live API is audio/pcm.
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      setStatus('Connecting to Maison Stylist...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputCtx.createGain();
      outputNodeRef.current.connect(outputCtx.destination);

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        // DO add comment above each fix. Updated Gemini model to the recommended version for Live API conversation tasks.
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Voice Active');
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => prev + ' ' + message.serverContent.outputTranscription.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputCtx;
              // Track playback start time for smooth, gapless audio.
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setStatus('Connection Closed'),
          onerror: (e) => {
            console.error('Live Stylist Error:', e);
            setStatus('Error Occurred');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are Teola, a high-fashion AI stylist. Speak with elegance and professional authority. Help the user curate looks from their archive or global trends. Keep responses concise and focused on style.`,
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to start session');
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
      <button onClick={onClose} className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
        <X size={28} />
      </button>

      <div className="flex flex-col items-center gap-12 max-w-2xl w-full text-center">
        <div className="relative">
           <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-[3s] ${isActive ? 'border-blue-500 animate-[spin_10s_linear_infinite] scale-110' : 'border-neutral-800'}`}>
              <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 transition-all ${isActive ? 'shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-105' : ''}`}>
                 <Zap size={64} fill={isActive ? 'currentColor' : 'none'} className={isActive ? 'animate-pulse' : ''} />
              </div>
           </div>
           {isActive && (
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Volume2 size={20} className="text-black" />
             </div>
           )}
        </div>

        <div className="space-y-4">
           <h2 className="serif text-4xl md:text-5xl font-bold text-white tracking-tight">Maison Stylist Live</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">{status}</p>
        </div>

        <div className="w-full h-32 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 overflow-y-auto no-scrollbar">
           <p className="text-sm text-neutral-400 italic leading-relaxed">
             {transcript || 'Listening to your sartorial queries...'}
           </p>
        </div>

        <div className="flex items-center gap-8">
           <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
           >
              {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
           </button>
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mb-2">Secure Link</span>
              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-full text-[10px] font-black">
                 ENCRYPTED SESSION
              </div>
           </div>
        </div>
      </div>

      <footer className="absolute bottom-12 text-center">
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600">Teola Identity Presence • v6.3.0</p>
      </footer>
    </div>
  );
};

export default LiveStylist;
