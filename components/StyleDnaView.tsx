import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ClothingItem } from '../types';
import { gemini } from '../services/geminiService';
import { analytics } from '../services/analyticsService';
import { convertToDisplay, convertToInternal, getUnitLabel, getRegionalSize } from '../utils/conversions';
import { 
  ArrowLeft, Sparkles, Target, Save, Check, Loader2, BrainCircuit, 
  Palette, Layout, Search, Sparkle, Fingerprint, Zap, X, User, Ruler, Heart, 
  Camera, ImageIcon, CheckCircle, RefreshCw, Send, Scan, ChevronRight,
  Shirt, Star, Info, TrendingUp, Scissors, Compass, Droplets, SunMedium, Eye, Briefcase, Activity, ShieldCheck,
  CheckCircle2, XCircle, Wand2, Quote, BookOpen, AlertCircle, Coffee, Sunset, Landmark, Ghost,
  Ban, ShieldAlert, GraduationCap, Flame, Moon, Sun, Wind, ScanLine, ScanSearch, PencilLine
} from 'lucide-react';

interface StyleDnaViewProps {
  user: UserProfile | null;
  wardrobe: ClothingItem[];
  onUpdateUser: (user: UserProfile) => void;
  onBack: () => void;
}

interface ChatStep {
  role: 'architect' | 'user';
  text: string;
  visual?: string;
  json?: any;
  isProposal?: boolean;
  proposedUpdates?: Partial<UserProfile>;
  isFinalBlueprint?: boolean;
  isClarification?: boolean;
  options?: string[];
  isBiometricScan?: boolean;
  customElement?: React.ReactNode;
}

const BIOMETRIC_FIELDS = [
  { label: 'Height', key: 'height' },
  { label: 'Shoe Size', key: 'shoe_size' },
  { label: 'Chest', key: 'chest' },
  { label: 'Waist', key: 'waist' },
  { label: 'Hips', key: 'hips' },
  { label: 'Arm Length', key: 'arms' },
  { label: 'Leg Length', key: 'legs' },
  { label: 'Neck Circumference', key: 'neck' },
  { label: 'Shoulder Width', key: 'shoulders' }
];

const StyleDnaView: React.FC<StyleDnaViewProps> = ({ user, wardrobe, onUpdateUser, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>(user || {
    id: 'temp-' + Date.now(),
    name: 'Maison Member',
    username: 'member',
    email: '',
    subscription_tier: 'Free',
    style_preferences: [],
    gender: 'Neutral',
  } as UserProfile);

  useEffect(() => {
    if (user && formData.id.startsWith('temp-')) {
      setFormData(user);
    }
  }, [user]);
  const [activeStep, setActiveStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<Record<string, 'confirmed' | 'pending' | 'mismatch' | 'none'>>({});
  const [isScanningBody, setIsScanningBody] = useState(false);
  const [correctingField, setCorrectingField] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatStep[]>([
    { 
      role: 'architect', 
      text: "Identity Studio Active. I am your Style Architect. To unlock Maison-level suggestions, we must calibrate your DNA. Start by describing your build, or perform a Biometric Scan below.",
      options: ["Athletic & Built", "Slim & Linear", "Petite & Curvy", "Tall & Structured"]
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyScanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    analytics.track('refine_style_started', { user_id: user?.id, step: activeStep });
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isAnalyzing, isScanningBody]);

  const handleSendMessage = async (textOverride?: string) => {
    const userText = textOverride || input;
    if (!userText.trim() || isAnalyzing) return;
    
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    
    if (userText === "Compare Scan vs Manual Input" && pendingMeasurements) {
      setChatHistory(prev => [...prev, { 
        role: 'architect', 
        text: "Biometric Extraction Summary. Review the discrepancies between the AI scan and your manual input. You can choose to keep the AI's findings or manually correct them.",
        isBiometricScan: true,
        customElement: renderReviewTable(BIOMETRIC_FIELDS, pendingMeasurements)
      }]);
      setIsAnalyzing(false);
      return;
    }

    if (userText === "Use AI Measurements" && pendingMeasurements) {
      const newStatuses = { ...biometricStatus };
      const fieldsToSync = ['height', 'shoe_size', 'chest', 'waist', 'hips', 'arms', 'legs', 'neck', 'shoulders', 'body_type', 'skin_tone', 'face_shape'];
      
      fieldsToSync.forEach(f => {
        if (pendingMeasurements[f]) newStatuses[f] = 'confirmed';
      });

      setFormData(prev => prev ? ({
        ...prev,
        height: pendingMeasurements.height || prev.height,
        shoe_size: pendingMeasurements.shoe_size || prev.shoe_size,
        chest: pendingMeasurements.chest || prev.chest,
        waist: pendingMeasurements.waist || prev.waist,
        hips: pendingMeasurements.hips || prev.hips,
        arms: pendingMeasurements.arms || prev.arms,
        legs: pendingMeasurements.legs || prev.legs,
        neck: pendingMeasurements.neck || prev.neck,
        shoulders: pendingMeasurements.shoulders || prev.shoulders,
        body_type: pendingMeasurements.body_type || prev.body_type,
        skin_tone: pendingMeasurements.skin_tone || prev.skin_tone,
        face_shape: pendingMeasurements.face_shape || prev.face_shape,
        ideal_clothing_cuts: pendingMeasurements.ideal_clothing_cuts || prev.ideal_clothing_cuts,
        color_blocking_suggestions: pendingMeasurements.color_blocking_suggestions || prev.color_blocking_suggestions
      }) : null);
      
      setBiometricStatus(newStatuses);
      setPendingMeasurements(null);
      setChatHistory(prev => [...prev, { role: 'architect', text: "AI measurements synchronized. Proceeding with calibration." }]);
      setIsAnalyzing(false);
      return;
    }

    if (userText === "Keep My Manual Data") {
      const newStatuses = { ...biometricStatus };
      Object.keys(biometricStatus).forEach(k => {
        if (newStatuses[k] === 'mismatch') newStatuses[k] = 'confirmed';
      });
      
      if (pendingMeasurements) {
        setFormData(prev => prev ? ({
          ...prev,
          ideal_clothing_cuts: pendingMeasurements.ideal_clothing_cuts || prev.ideal_clothing_cuts,
          color_blocking_suggestions: pendingMeasurements.color_blocking_suggestions || prev.color_blocking_suggestions,
          body_type: pendingMeasurements.body_type || prev.body_type,
          skin_tone: pendingMeasurements.skin_tone || prev.skin_tone,
          face_shape: pendingMeasurements.face_shape || prev.face_shape
        }) : null);
      }

      setBiometricStatus(newStatuses);
      setPendingMeasurements(null);
      setChatHistory(prev => [...prev, { role: 'architect', text: "Manual data preserved. AI insights merged. Proceeding with calibration." }]);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await gemini.architectDNARefinement(activeStep, userText, formData, wardrobe);
      
      if (response.partialUpdates || response.finalSummary) {
        const summary = response.finalSummary || {};
        setFormData(prev => prev ? ({ 
          ...prev, 
          ...response.partialUpdates,
          user_preference_override: response.partialUpdates?.user_preference_override ?? prev.user_preference_override,
          override_type: response.partialUpdates?.override_type ?? prev.override_type,
          hybrid_aesthetic: summary.hybridAesthetic || prev.hybrid_aesthetic,
          hybrid_aesthetic_description: summary.hybridDescription || prev.hybrid_aesthetic_description,
          defining_archetypes: summary.archetypes || prev.defining_archetypes,
          proportion_rules: summary.proportionRules || prev.proportion_rules,
          ideal_clothing_cuts: summary.idealClothingCuts || prev.ideal_clothing_cuts,
          color_blocking_suggestions: summary.colorBlockingSuggestions || prev.color_blocking_suggestions,
          style_rules: summary.keyRules?.dos || prev.style_rules,
          lifestyle_priorities: summary.keyRules?.donts || prev.lifestyle_priorities,
          last_refined_at: new Date().toISOString()
        }) : null);
      }

      const stepOptions: Record<number, string[]> = {
        1: ["Minimalist", "Avant-Garde", "Old Money", "Dark Academia", "Cyber Noir"],
        2: ["Boardroom Executive", "Creative Studio", "Off-Duty Model", "Gala Regular"],
        3: ["Monochrome Focus", "Earth Tones", "High-Contrast", "Vibrant Accents"],
        4: ["Finalize Synthesis"]
      };

      if (response.isComplete || activeStep >= 4) {
        analytics.track('refine_style_completed', { user_id: user?.id });
        setChatHistory(prev => [...prev, { 
          role: 'architect', 
          text: (response.acknowledgment || "Sync complete.") + " I have generated your definitive Maison Identity Blueprint.",
          isFinalBlueprint: true,
          json: response.finalSummary
        }]);
        setActiveStep(5);
      } else {
        setChatHistory(prev => [...prev, { 
          role: 'architect', 
          text: response.acknowledgment || "Logic node captured. Proceeding to aesthetic character.", 
          json: response.partialUpdates,
          options: stepOptions[activeStep]
        }]);
        setActiveStep(prev => prev + 1);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'architect', text: "Maison link disrupted. Please attempt re-sync." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [pendingMeasurements, setPendingMeasurements] = useState<any>(null);

  const handleBodyPartUpload = async (file: File, partName: string, fieldKeyOverride?: string) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setChatHistory(prev => [...prev, { role: 'user', text: `Uploading specific scan for ${partName}...`, visual: base64 }]);
      
      try {
        const analysis = await gemini.analyzeSpecificBodyPart(base64, partName, formData);
        const measurement = analysis.measurement;
        const fieldKey = fieldKeyOverride || partName.toLowerCase().replace(/\s+/g, '_');
        
        const currentVal = (formData as any)[fieldKey];
        const aiNum = parseFloat(measurement.replace(/[^0-9.]/g, ''));
        const userNum = parseFloat(String(currentVal).replace(/[^0-9.]/g, ''));
        
        let status: 'confirmed' | 'mismatch' | 'pending' = 'confirmed';
        if (!currentVal || currentVal === 'Pending User Upload' || currentVal === 'Pending Upload') {
          status = 'confirmed';
        } else if (!isNaN(aiNum) && !isNaN(userNum)) {
          const diff = Math.abs(aiNum - userNum) / userNum;
          if (diff > 0.05) status = 'mismatch';
        }

        setPendingMeasurements(prev => ({ ...(prev || {}), [fieldKey]: measurement }));
        setBiometricStatus(prev => ({ ...prev, [fieldKey]: status }));
        
        setFormData(prev => prev ? ({
          ...prev,
          biometric_images: {
            ...(prev.biometric_images || {}),
            [fieldKey]: base64
          }
        }) : null);

        setChatHistory(prev => [...prev, { 
          role: 'architect', 
          text: `Specific ${partName} scan captured. I've extracted a measurement of ${measurement}. Review the calibration below.`,
          isBiometricScan: true,
          customElement: renderReviewTable([{ label: partName, key: fieldKey }], { ...pendingMeasurements, [fieldKey]: measurement })
        }]);

      } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const renderReviewTable = (fields: { label: string, key: string }[], aiData: any) => {
    const thresholdPercent = 0.05;
    const system = formData.measurement_system || 'Metric';
    const standard = formData.sizing_standard || 'EU';
    
    const rows = fields.map(field => {
      const isShoeSize = field.key === 'shoe_size';
      const aiValRaw = aiData[field.key];
      const userValRaw = (formData as any)[field.key];
      
      const aiVal = convertToDisplay(aiValRaw, system, isShoeSize, standard);
      const userVal = convertToDisplay(userValRaw, system, isShoeSize, standard);
      const unit = getUnitLabel(system, isShoeSize, standard);
      
      const regionalSize = (field.key === 'chest' || field.key === 'waist' || field.key === 'hips') 
        ? getRegionalSize(aiValRaw, field.key as any, standard)
        : null;
      
      const aiNum = parseFloat(String(aiValRaw).replace(/[^0-9.]/g, ''));
      const userNum = parseFloat(String(userValRaw).replace(/[^0-9.]/g, ''));
      
      const diffPercent = !isNaN(aiNum) && !isNaN(userNum) ? Math.abs(aiNum - userNum) / userNum : 0;
      const isDifferent = diffPercent > thresholdPercent;
      const isMinorDiff = diffPercent > 0 && diffPercent <= thresholdPercent;
      const isPending = !userValRaw || userValRaw === 'Pending User Upload' || userValRaw === 'Pending Upload';
      
      let statusText = "Confirmed";
      let statusColor = "text-emerald-500";
      if (isPending) {
        statusText = "Pending Upload";
        statusColor = "text-amber-500";
      } else if (isDifferent) {
        statusText = "Mismatch";
        statusColor = "text-red-500";
      } else if (isMinorDiff) {
        statusText = "Conversion Diff";
        statusColor = "text-blue-500";
      }

      return (
        <tr key={field.key} className="border-b border-neutral-100 dark:border-neutral-800">
          <td className="py-3 text-[8px] font-bold uppercase text-neutral-500">
            {field.label}
            {regionalSize && (
              <span className="ml-2 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[6px] text-neutral-400">
                {standard}: {regionalSize}
              </span>
            )}
          </td>
          <td className={`py-3 text-[10px] font-mono ${isDifferent ? 'text-red-500 font-bold' : 'text-neutral-900 dark:text-white'}`}>
            <div className="flex flex-col">
              <span>{aiValRaw} <span className="text-[7px] opacity-50">{isShoeSize ? 'EU' : 'cm'}</span></span>
              {(isShoeSize ? standard !== 'EU' : system === 'Imperial') && (
                <span className="text-[8px] text-blue-500">{aiVal} <span className="text-[6px] opacity-50">{isShoeSize ? standard : unit}</span></span>
              )}
            </div>
          </td>
          <td className="py-3 text-[10px] font-mono text-neutral-900 dark:text-white">
            <div className="flex flex-col">
              <span>{userValRaw} <span className="text-[7px] opacity-50">{isShoeSize ? 'EU' : 'cm'}</span></span>
              {(isShoeSize ? standard !== 'EU' : system === 'Imperial') && (
                <span className="text-[8px] text-blue-500">{userVal} <span className="text-[6px] opacity-50">{isShoeSize ? standard : unit}</span></span>
              )}
            </div>
          </td>
          <td className="py-3">
            <div className="flex flex-col">
              <span className={`text-[8px] font-black uppercase tracking-widest ${statusColor}`}>{statusText}</span>
              {isDifferent && (
                <span className="text-[6px] text-red-400 font-mono">Δ {(diffPercent * 100).toFixed(1)}%</span>
              )}
              {isMinorDiff && (
                <span className="text-[6px] text-blue-400 font-mono">Δ {(diffPercent * 100).toFixed(1)}%</span>
              )}
            </div>
          </td>
          <td className="py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button 
                onClick={() => {
                  updateFormDataField(field.key as any, aiValRaw);
                  setBiometricStatus(prev => ({ ...prev, [field.key]: 'confirmed' }));
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded text-[7px] font-black uppercase tracking-tighter"
              >
                Accept
              </button>
              <button 
                onClick={() => setCorrectingField(field.key)}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[7px] font-black uppercase tracking-tighter"
              >
                Correct
              </button>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleBodyPartUpload(file, field.label);
                  };
                  input.click();
                }}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[7px] font-black uppercase tracking-tighter"
              >
                Upload
              </button>
            </div>
          </td>
        </tr>
      );
    });

    return (
      <div className="mt-4 overflow-x-auto bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="py-2 text-[6px] font-black uppercase tracking-widest text-neutral-400">Measurement</th>
              <th className="py-2 text-[6px] font-black uppercase tracking-widest text-neutral-400">AI Value</th>
              <th className="py-2 text-[6px] font-black uppercase tracking-widest text-neutral-400">User Value</th>
              <th className="py-2 text-[6px] font-black uppercase tracking-widest text-neutral-400">Status</th>
              <th className="py-2 text-right text-[6px] font-black uppercase tracking-widest text-neutral-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => handleSendMessage("Use AI Measurements")}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Accept All AI Values
          </button>
          <button 
            onClick={() => handleSendMessage("Keep My Manual Data")}
            className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
          >
            Keep My Manual Data
          </button>
        </div>
      </div>
    );
  };

  const handleBodyScan = async (file: File) => {
    setIsScanningBody(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setChatHistory(prev => [...prev, { role: 'user', text: "Initiating Biometric Silhouette Analysis...", visual: base64 }]);
      try {
        const analysis = await gemini.analyzeBodyMetrics(base64, formData);
        
        const thresholdPercent = 0.05; // 5% threshold
        const differences: string[] = [];
        const missingFields: string[] = [];
        
        const newStatuses: Record<string, 'confirmed' | 'pending' | 'mismatch' | 'none'> = { ...biometricStatus };

        BIOMETRIC_FIELDS.forEach(field => {
          const aiVal = analysis[field.key];
          const userVal = (formData as any)[field.key];
          
          if (!aiVal || aiVal === "N/A" || aiVal === "unknown") {
            missingFields.push(field.label);
            newStatuses[field.key] = 'pending';
          } else if (!userVal || userVal === 'Pending User Upload' || userVal === 'Pending Upload') {
            // New data found, mark as pending for user approval
            newStatuses[field.key] = 'pending';
          } else {
            const aiNum = parseFloat(aiVal.replace(/[^0-9.]/g, ''));
            const userNum = parseFloat(String(userVal).replace(/[^0-9.]/g, ''));
            
            if (!isNaN(aiNum) && !isNaN(userNum)) {
              const diff = Math.abs(aiNum - userNum) / userNum;
              if (diff > thresholdPercent) {
                differences.push(`${field.label}: AI says ${aiVal}, you said ${userVal}`);
                newStatuses[field.key] = 'mismatch';
              } else {
                newStatuses[field.key] = 'confirmed';
              }
            } else {
              newStatuses[field.key] = 'confirmed';
            }
          }
        });

        setBiometricStatus(newStatuses);
        setPendingMeasurements(analysis);

        let responseText = `Biometric extraction complete. Silhouette calibrated: ${analysis.summary || 'Metrics Extracted.'}`;
        
        if (differences.length > 0) {
          responseText += `\n\nI noticed some discrepancies (>5%) with your manual inputs:\n${differences.join('\n')}\n\nWould you like to use the AI measurements or keep your manual ones?`;
        }

        if (missingFields.length > 0) {
          responseText += `\n\nI couldn't accurately extract these metrics from this angle: ${missingFields.join(', ')}. Please provide dedicated scans for these parts.`;
        }

        setChatHistory(prev => [...prev, { 
          role: 'architect', 
          text: responseText,
          json: analysis,
          isBiometricScan: true,
          customElement: renderReviewTable(BIOMETRIC_FIELDS, analysis),
          options: differences.length > 0 ? ["Use AI Measurements", "Keep My Manual Data"] : undefined
        }]);

      } catch (e) { console.error(e); } finally { setIsScanningBody(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleVisualScan = async (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setChatHistory(prev => [...prev, { role: 'user', text: "Initiating Visual DNA Extraction...", visual: base64 }]);
      try {
        const analysis = await gemini.analyzeVisualDNA(base64, formData);
        setChatHistory(prev => [...prev, { 
          role: 'architect', 
          text: `Visual scan complete. Predominant Signature: ${analysis.aesthetic || 'Extracted.'}`,
          json: analysis,
          isProposal: true,
          proposedUpdates: analysis.proposedUpdates
        }]);
      } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (formData) {
      onUpdateUser(formData);
      onBack();
    }
  };

  const updateFormDataField = (key: keyof UserProfile, val: any) => {
    setFormData(prev => prev ? ({ ...prev, [key]: val }) : null);
    setBiometricStatus(prev => ({ ...prev, [key]: 'confirmed' }));
  };

  const calculateCalibrationScore = () => {
    if (!formData) return 0;
    const fields = ['height', 'shoe_size', 'chest', 'waist', 'hips', 'arms', 'legs', 'neck', 'shoulders', 'body_type', 'skin_tone', 'face_shape'];
    const filledCount = fields.filter(f => {
      const val = (formData as any)[f];
      return !!val && val !== 'Pending User Upload' && val !== 'Pending Upload';
    }).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const calibrationScore = calculateCalibrationScore();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-y-auto lg:overflow-hidden">
      <header className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
        <div className="space-y-1">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group mb-1">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Exit Atelier</span>
          </button>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-500 rounded-xl text-white shadow-lg ring-4 ring-blue-500/5">
               <Fingerprint size={22} className="animate-pulse" />
             </div>
             <div>
                <h2 className="serif text-2xl font-bold tracking-tight dark:text-white text-neutral-900">Style DNA</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-500">Maison Identity Studio</p>
             </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Calibration Sync: {calibrationScore}%</span>
              <div className="w-32 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${calibrationScore}%` }} />
              </div>
           </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
        <main className="flex-1 flex flex-col border-r border-neutral-100 dark:border-neutral-800 relative min-h-[500px] lg:min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
             {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                 <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-black border-black dark:bg-white text-white dark:text-black' : 'bg-blue-50 dark:bg-neutral-900 border-blue-100 dark:border-neutral-800 text-blue-500'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Zap size={14} fill="currentColor" />}
                    </div>
                    <div className="space-y-4">
                       <div className={`p-6 rounded-[1.8rem] text-sm leading-relaxed shadow-sm ${
                         msg.role === 'user' 
                           ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-tr-none' 
                           : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-100 dark:border-neutral-800 rounded-tl-none font-medium italic'
                       }`}>
                         {msg.visual && <img src={msg.visual} className="w-40 aspect-square object-cover rounded-2xl mb-4 border border-white/10 shadow-lg" />}
                         {msg.text}
                       </div>

                       {msg.customElement && (
                         <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                           {msg.customElement}
                         </div>
                       )}

                       {msg.isBiometricScan && (
                         <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 space-y-4 animate-in zoom-in-95">
                            <div className="flex items-center gap-2 text-blue-500 mb-2">
                               <ScanLine size={16} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Biometric Extraction Summary</span>
                            </div>
                             <div className="grid grid-cols-2 gap-3">
                               {[
                                 { label: 'Height', key: 'height', icon: Ruler },
                                 { label: 'Shoe Size', key: 'shoe_size', icon: Footprints },
                                 { label: 'Chest', key: 'chest', icon: Activity },
                                 { label: 'Waist', key: 'waist', icon: Target },
                                 { label: 'Hips', key: 'hips', icon: UserCircle },
                                 { label: 'Arms', key: 'arms', icon: Scissors },
                                 { label: 'Legs', key: 'legs', icon: Ruler },
                                 { label: 'Neck', key: 'neck', icon: Activity },
                                 { label: 'Shoulders', key: 'shoulders', icon: Layout },
                                 { label: 'Body Type', key: 'body_type', icon: UserCircle },
                                 { label: 'Skin Tone', key: 'skin_tone', icon: Palette }
                               ].map(field => (
                                 <div key={field.key} className="space-y-1">
                                    <label className="text-[7px] font-black uppercase text-neutral-400 ml-2">{field.label}</label>
                                    <div className="relative">
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[6px] font-black uppercase text-neutral-400">
                                        {getUnitLabel(formData.measurement_system || 'Metric', field.key === 'shoe_size', formData.sizing_standard || 'EU')}
                                      </div>
                                      <input 
                                        type="text" 
                                        value={convertToDisplay((formData as any)[field.key], formData.measurement_system || 'Metric', field.key === 'shoe_size', formData.sizing_standard || 'EU')}
                                        onChange={(e) => {
                                          const internalVal = convertToInternal(e.target.value, formData.measurement_system || 'Metric', field.key === 'shoe_size', formData.sizing_standard || 'EU');
                                          updateFormDataField(field.key as any, internalVal);
                                        }}
                                        className="w-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl px-4 py-2 text-[10px] font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 pr-10"
                                      />
                                    </div>
                                 </div>
                               ))}
                            </div>
                            <div className="pt-2">
                               <button 
                                onClick={() => handleSendMessage("Confirmed biometric metrics.")}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
                               >
                                 <Check size={14} /> Finalize Calibration
                               </button>
                            </div>
                         </div>
                       )}

                       {msg.options && (
                         <div className="flex flex-wrap gap-2">
                            {msg.options.map(opt => (
                              <button key={opt} onClick={() => handleSendMessage(opt)} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-[9px] font-black uppercase tracking-widest hover:border-blue-500 transition-all active:scale-95">
                                {opt}
                              </button>
                            ))}
                         </div>
                       )}

                       {msg.isFinalBlueprint && (
                         <div className="bg-neutral-900 text-white p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-[4s]">
                              <Fingerprint size={200} />
                           </div>
                           <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Blueprint Active</span>
                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-full text-[7px] font-black uppercase">Identity Calibrated</div>
                              </div>
                              <h3 className="serif text-3xl font-bold">{formData.hybrid_aesthetic || "Identity Synthesis"}</h3>
                              <p className="text-xs text-neutral-300 italic border-l-2 border-blue-500 pl-4 py-1">
                                {formData.hybrid_aesthetic_description || "Your Maison profile is now synchronized with global aesthetic horizons."}
                              </p>
                           </div>
                         </div>
                       )}
                    </div>
                 </div>
               </div>
             ))}
             
             {/* Biometric Start Prompt */}
             {chatHistory.length < 3 && !isScanningBody && (
                <div className="p-8 bg-neutral-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
                   <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                      <ScanSearch size={32} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="serif text-xl font-bold dark:text-white">Biometric Persona Scan</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">Upload a full-body photo to automatically extract silhouette proportions for silhouette calibration.</p>
                   </div>
                   <button 
                    onClick={() => bodyScanRef.current?.click()}
                    className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                   >
                     <Camera size={16} /> Initiate Scanner
                   </button>
                   <input type="file" ref={bodyScanRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBodyScan(e.target.files[0])} />
                </div>
             )}

             {(isAnalyzing || isScanningBody) && (
                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl relative overflow-hidden">
                     <div className="flex gap-1.5 z-10 relative">
                       <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                       <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100" />
                       <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200" />
                     </div>
                     <div className="absolute inset-0 bg-blue-500/10 animate-scan" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 animate-pulse">
                     {isScanningBody ? 'Extracting Physical DNA...' : 'Architecting Aesthetic...'}
                  </span>
                </div>
             )}
          </div>

          <div className="p-6 md:p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl shrink-0">
             <div className="max-w-2xl mx-auto flex gap-3">
                <div className="relative flex-1 group">
                   <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Refine your vision..."
                    className="w-full pl-6 pr-14 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-full text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                   />
                   <button onClick={() => handleSendMessage()} disabled={!input.trim() || isAnalyzing || isScanningBody} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg active:scale-90 transition-all">
                      <Send size={14} />
                   </button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all">
                   <Scan size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleVisualScan(e.target.files[0])} />
             </div>
          </div>
        </main>

        <aside className="w-full lg:w-[380px] bg-neutral-50 dark:bg-[#080808] p-8 flex flex-col gap-6 overflow-y-auto border-l border-neutral-100 dark:border-neutral-800 shrink-0 lg:shrink">
           <div className="flex items-center gap-3 text-blue-500 mb-2">
             <Target size={18} />
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Current Calibrations</h3>
           </div>

           {/* Silhouette Insights Section */}
           {(formData?.ideal_clothing_cuts || formData?.color_blocking_suggestions) && (
             <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-4">
               <div className="flex items-center gap-2 text-blue-500">
                 <Sparkles size={14} />
                 <span className="text-[8px] font-black uppercase tracking-widest">Silhouette Insights</span>
               </div>
               
               {formData?.ideal_clothing_cuts && formData.ideal_clothing_cuts.length > 0 && (
                 <div className="space-y-2">
                   <p className="text-[7px] font-black uppercase text-neutral-400">Ideal Clothing Cuts</p>
                   <div className="flex flex-wrap gap-1">
                     {formData.ideal_clothing_cuts.map((cut, idx) => (
                       <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded text-[8px] font-bold">
                         {cut}
                       </span>
                     ))}
                   </div>
                 </div>
               )}

               {formData?.color_blocking_suggestions && formData.color_blocking_suggestions.length > 0 && (
                 <div className="space-y-2">
                   <p className="text-[7px] font-black uppercase text-neutral-400">Color-Blocking Strategy</p>
                   <div className="flex flex-wrap gap-1">
                     {formData.color_blocking_suggestions.map((suggestion, idx) => (
                       <span key={idx} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-bold">
                         {suggestion}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
             </section>
           )}

           <div className="space-y-4">
              {/* Manual Metric Review Section */}
               <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-500"><PencilLine size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Biometric Data</span></div>
                    <button 
                      onClick={() => {
                        if (pendingMeasurements) {
                          handleSendMessage("Compare Scan vs Manual Input");
                        } else {
                          setChatHistory(prev => [...prev, { role: 'architect', text: "No active scan data to compare. Please initiate a Biometric Silhouette Scan first." }]);
                        }
                      }}
                      className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[6px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Compare Scan vs Manual
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Height', key: 'height' },
                      { label: 'Shoe Size', key: 'shoe_size' },
                      { label: 'Chest', key: 'chest' },
                      { label: 'Waist', key: 'waist' },
                      { label: 'Hips', key: 'hips' },
                      { label: 'Arms', key: 'arms' },
                      { label: 'Legs', key: 'legs' },
                      { label: 'Neck', key: 'neck' },
                      { label: 'Shoulders', key: 'shoulders' }
                    ].map(field => {
                      const status = biometricStatus[field.key] || 'none';
                      const statusColors = {
                        confirmed: 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
                        pending: 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
                        mismatch: 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
                        none: 'border-transparent'
                      };

                      return (
                        <div key={field.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[7px] font-black uppercase text-neutral-400">
                              {field.label}
                              {pendingMeasurements?.[field.key] && (
                                <span className="ml-2 text-blue-500/60 lowercase italic font-normal">
                                  (AI: {pendingMeasurements[field.key]})
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1">
                              {status === 'pending' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                              {status === 'mismatch' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                              {status === 'confirmed' && <Check size={8} className="text-blue-500" />}
                            </div>
                          </div>
                          <div className="relative group">
                            <input 
                             type="text" 
                             value={(formData as any)[field.key] || ''} 
                             onFocus={() => {
                               if (correctingField === field.key) setCorrectingField(null);
                             }}
                             onChange={e => {
                               const newVal = e.target.value;
                               updateFormDataField(field.key as any, newVal);
                               // If it differs from AI, mark as mismatch to prompt review
                               if (pendingMeasurements?.[field.key] && newVal !== pendingMeasurements[field.key]) {
                                 setBiometricStatus(prev => ({ ...prev, [field.key]: 'mismatch' }));
                               }
                               if (correctingField === field.key) setCorrectingField(null);
                             }}
                             placeholder={status === 'pending' ? 'Pending User Upload' : 'e.g. 90cm'} 
                             className={`w-full bg-neutral-50 dark:bg-neutral-800 pl-3 pr-10 py-2 rounded-lg text-[10px] font-bold outline-none dark:text-white border transition-all ${statusColors[status]} ${correctingField === field.key ? 'ring-2 ring-blue-500 border-blue-500 animate-pulse' : ''}`} 
                            />
                            {status === 'mismatch' && (
                              <button 
                                onClick={() => setBiometricStatus(prev => ({ ...prev, [field.key]: 'confirmed' }))}
                                className="absolute -right-6 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                title="Confirm Manual Input"
                              >
                                <CheckCircle2 size={12} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleBodyPartUpload(file, field.label);
                                };
                                input.click();
                              }}
                              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${['arms', 'legs', 'neck', 'shoulders'].includes(field.key) ? 'text-blue-500 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100'}`}
                              title={`Upload ${field.label} Scan`}
                            >
                              <Camera size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </section>

              {/* Detail Scans Section */}
              <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-500"><Camera size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Detail Scans</span></div>
                    <Info size={12} className="text-neutral-300" />
                 </div>
                 <p className="text-[10px] text-neutral-500 italic">Upload specific images for body parts AI might struggle to analyze.</p>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Neck Circumference', key: 'neck', short: 'Neck' },
                      { label: 'Arm Length', key: 'arms', short: 'Arms' },
                      { label: 'Leg Length', key: 'legs', short: 'Legs' },
                      { label: 'Shoulder Width', key: 'shoulders', short: 'Shoulders' }
                    ].map(part => (
                      <button 
                        key={part.key}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleBodyPartUpload(file, part.label, part.key);
                          };
                          input.click();
                        }}
                        className="flex flex-col items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-emerald-500 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          {formData.biometric_images?.[part.key] ? <Check size={14} /> : <ImageIcon size={14} />}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">{part.short}</span>
                      </button>
                    ))}
                 </div>
              </section>

              {/* Persona Section */}
              <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-500"><User size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Character Archetype</span></div>
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                 </div>
                 <p className="serif text-lg font-bold dark:text-white">{formData.hybrid_aesthetic || 'Calibration Pending...'}</p>
                 <div className="flex flex-wrap gap-1">
                    {formData.defining_archetypes?.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-[7px] font-bold uppercase rounded-md border border-neutral-100 dark:border-neutral-700 text-neutral-500">{a}</span>
                    ))}
                 </div>
              </section>

              {/* Palette Preview */}
              <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                 <div className="flex items-center gap-2 text-amber-500"><Palette size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Palette Logic</span></div>
                 <div className="flex gap-2">
                    {formData.favorite_colors?.length ? formData.favorite_colors.slice(0, 5).map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm" style={{ backgroundColor: c.toLowerCase() }} />
                    )) : [1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />)}
                 </div>
              </section>

              {/* Commandments */}
              <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                 <div className="flex items-center gap-2 text-blue-500"><ShieldCheck size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Style Commandments</span></div>
                 <div className="space-y-3">
                    <div className="space-y-1.5">
                       <p className="text-[7px] font-black uppercase text-emerald-500 ml-1">Archive Dos</p>
                       <div className="space-y-1">
                          {formData.style_rules?.slice(0, 3).map((r, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                               <CheckCircle2 size={10} className="text-emerald-500" />
                               <span className="text-[9px] font-bold dark:text-emerald-200 truncate">{r}</span>
                            </div>
                          )) || <p className="text-[8px] text-neutral-400 italic ml-1">Calibrating...</p>}
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[7px] font-black uppercase text-rose-500 ml-1">Archive Don'ts</p>
                       <div className="space-y-1">
                          {formData.lifestyle_priorities?.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-rose-50/30 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/10">
                               <XCircle size={10} className="text-rose-500" />
                               <span className="text-[9px] font-bold dark:text-rose-200 truncate">{r}</span>
                            </div>
                          )) || <p className="text-[8px] text-neutral-400 italic ml-1">Calibrating...</p>}
                       </div>
                    </div>
                 </div>
              </section>

              {/* Occasion Mapping */}
              <section className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500"><Briefcase size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Presence Map</span></div>
                 <div className="space-y-2">
                    {[
                      { l: 'Studio/Work', i: Coffee, p: 70 },
                      { l: 'Evening/Noir', i: Sunset, p: 45 },
                      { l: 'Gala/Formal', i: Landmark, p: 20 }
                    ].map(o => (
                      <div key={o.l} className="space-y-1">
                         <div className="flex justify-between items-center text-[7px] font-black uppercase">
                            <div className="flex items-center gap-1.5 text-neutral-500"><o.i size={10} /><span>{o.l}</span></div>
                            <span className="dark:text-white">{o.p}%</span>
                         </div>
                         <div className="h-1 bg-neutral-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${o.p}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3 shrink-0">
              <button onClick={handleSaveProfile} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Synchronize DNA
              </button>
              <button onClick={() => window.location.reload()} className="w-full py-3 text-neutral-400 text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">Reset Calibrations</button>
           </div>
        </aside>
      </div>
    </div>
  );
};

const Footprints = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v-2.38C4 11.5 5.88 9 8 9a4 4 0 0 1 4 4"/><path d="M20 16v-2.38C20 11.5 18.12 9 16 9a4 4 0 0 0-4 4"/><path d="M12 13v4"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>
);

const UserCircle = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
);

export default StyleDnaView;