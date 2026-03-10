
import React, { useState, useRef, useEffect } from 'react';
import { RotationSession, ClothingItem, PlannedDay, Outfit } from '../types';
import { gemini } from '../services/geminiService';
import { ArrowLeft, Send, Sparkles, Loader2, Calendar, MoreVertical, LayoutGrid, Shirt, Zap } from 'lucide-react';

interface RotationDetailViewProps {
  rotation: RotationSession;
  wardrobe: ClothingItem[];
  onUpdateRotation: (rotation: RotationSession) => void;
  onBack: () => void;
}

const RotationDetailView: React.FC<RotationDetailViewProps> = ({ rotation, wardrobe, onUpdateRotation, onBack }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group days by date
  const days = useMemo(() => {
    return Object.keys(rotation.plan).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [rotation.plan]);

  const handleRefine = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const promptText = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await gemini.refineRotation(rotation.plan, promptText, wardrobe);
      if (response) {
        onUpdateRotation({
          ...rotation,
          plan: response
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
      <header className="px-6 py-5 border-b border-neutral-100 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-all dark:text-white">
              <ArrowLeft size={20} />
           </button>
           <div className="space-y-0.5">
              <h2 className="serif text-xl md:text-2xl font-bold dark:text-white">{rotation.name}</h2>
              <p className="text-[8px] font-black uppercase text-blue-500 tracking-[0.4em]">Rotation Refinement</p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase">Active Sequence</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar pb-40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {days.map(dateKey => {
             const day = rotation.plan[dateKey];
             const dateObj = new Date(dateKey);
             const outfit = day.outfitOptions?.[0];
             
             return (
               <div key={dateKey} className="bg-neutral-50 dark:bg-[#121212] rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-white/5 flex flex-col shadow-sm group hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                     {outfit?.visualUrl ? (
                       <img src={outfit.visualUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-neutral-300"><Shirt size={48} /></div>
                     )}
                     <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-black/40 backdrop-blur rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                     </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                     <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-neutral-400 tracking-widest">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        <h4 className="serif text-lg font-bold dark:text-white truncate">{day.event}</h4>
                     </div>
                     <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic leading-relaxed line-clamp-3">"{day.text}"</p>
                  </div>
               </div>
             );
           })}
        </div>

        {isTyping && (
          <div className="mt-8 flex items-center justify-center gap-4 text-blue-500 animate-pulse">
             <Loader2 size={16} className="animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-widest">Re-Architecting Rotation...</span>
          </div>
        )}
      </main>

      {/* Refinement Prompt - STYLIST STYLE */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#050505] via-white/95 dark:via-[#050505]/95 to-transparent z-[100]">
        <div className="max-w-3xl mx-auto">
           <form 
            onSubmit={handleRefine}
            className="flex items-center gap-3 p-2 bg-neutral-100 dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
           >
              <div className="p-3 text-blue-500"><Sparkles size={20} /></div>
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Improve sequence, shift days, or change vibes..."
                className="flex-1 bg-transparent text-sm md:text-base outline-none dark:text-white font-medium placeholder:text-neutral-400"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className={`p-3.5 rounded-full transition-all active:scale-95 ${input.trim() ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-white/5 text-neutral-400'}`}
              >
                <Send size={18} />
              </button>
           </form>
           <p className="text-center mt-3 text-[7px] font-black uppercase tracking-[0.3em] text-neutral-400">Neural Synthesis Protocol v4.2 Secure</p>
        </div>
      </div>
    </div>
  );
};

import { useMemo } from 'react';
export default RotationDetailView;
