
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlannedDay, ClothingItem, UserProfile, Outfit, RotationSession } from '../types';
import { gemini } from '../services/geminiService';
import { 
  Plus, X, ChevronLeft, ChevronRight, Search, 
  Lock, Zap, Loader2, Sparkles, Clock, Check, Shirt, CalendarDays, LockKeyhole,
  ShoppingBag, Archive, Menu, ArrowRight, BookmarkPlus, Layers, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { analytics } from '../services/analyticsService';

interface WeeklyPlanViewProps {
  user: UserProfile | null;
  wardrobe: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
  onQuickUpload: (file: File) => void;
  onUpdateUser: (user: UserProfile) => void;
  onUpgrade?: () => void;
  onMenuToggle?: () => void;
  onNavigateToWardrobe?: () => void;
  savedRotations?: RotationSession[];
  onSaveRotation?: (rotation: RotationSession) => void;
  onOpenRotation?: (id: string) => void;
}

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ 
  user, wardrobe, onSaveOutfit, onQuickUpload, onUpdateUser, onUpgrade, onMenuToggle, onNavigateToWardrobe, 
  savedRotations = [], onSaveRotation, onOpenRotation 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<Record<string, PlannedDay>>(() => {
    const saved = localStorage.getItem('teola_planned_days');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [isArchitecting, setIsArchitecting] = useState(false);
  
  const [isBatchPlanning, setIsBatchPlanning] = useState(false);
  const [batchMode, setBatchMode] = useState<'wardrobe' | 'market'>('wardrobe');
  const [selectedBatchItemIds, setSelectedBatchItemIds] = useState<Set<string>>(new Set());
  const [planDuration, setPlanDuration] = useState(1);
  const [batchMoodDesc, setBatchMoodDesc] = useState('');
  const [rotationName, setRotationName] = useState('');
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]);

  const [dayEvent, setDayEvent] = useState('');
  const [dayStyle, setDayStyle] = useState('');
  const [singleDayName, setSingleDayName] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [showRotations, setShowRotations] = useState(false);

  const isFreeTier = user?.subscription_tier === 'Free';

  const calendarDays = useMemo(() => {
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const offset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = [];
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = offset - 1; i >= 0; i--) days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i) });
    for (let i = 1; i <= totalDays; i++) days.push({ day: i, currentMonth: true, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });
    return days;
  }, [currentDate]);

  const toggleItemSelection = (id: string) => {
    const next = new Set(selectedBatchItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBatchItemIds(next);
  };

  const handlePlanSingleDay = async () => {
    if (!activeDate || !dayEvent.trim()) return;
    setIsArchitecting(true);
    try {
      const result = await gemini.planSingleDay(activeDate.toDateString(), dayEvent, dayStyle, wardrobe, user, 'wardrobe');
      const newPlans = { ...plans };
      const dateStr = activeDate.toDateString();
      const outfit = result.outfits?.[0];
      if (outfit && singleDayName) outfit.name = singleDayName;

      const visual_url = outfit ? await gemini.generateOutfitVisual(outfit.description, user) : undefined;
      if (outfit && visual_url) outfit.visual_url = visual_url;

      newPlans[dateStr] = {
        date: dateStr,
        eventDescription: dayEvent,
        selectedOutfitId: outfit?.id || null,
        outfitOptions: result.outfits || [],
        reminderSet: true,
        structuredDescription: result.text
      };
      setPlans(newPlans);
      localStorage.setItem('teola_planned_days', JSON.stringify(newPlans));
      setDayEvent('');
      setDayStyle('');
      setSingleDayName('');
      setActiveDate(null);
    } catch (e) { console.error(e); } finally { setIsArchitecting(false); }
  };

  const handleBatchPlan = async () => {
    if (!batchMoodDesc.trim()) return;
    setIsArchitecting(true);
    try {
      const selectedItems = wardrobe.filter(i => selectedBatchItemIds.has(i.id));
      const startD = new Date(startDateStr);
      const rotationResult = await gemini.architectBatchRotation(startD, planDuration, selectedItems.length > 0 ? selectedItems : wardrobe, user, batchMoodDesc, false, batchMode);
      
      const session: RotationSession = {
        id: Math.random().toString(36).substr(2, 9),
        name: rotationName || `Rotation ${savedRotations.length + 1}`,
        start_date: startD.toDateString(),
        duration_weeks: planDuration,
        plan: rotationResult.plan || {},
        created_at: new Date().toISOString()
      };

      if (onSaveRotation) onSaveRotation(session);
      setIsBatchPlanning(false);
      setBatchMoodDesc('');
      setRotationName('');
      setSelectedBatchItemIds(new Set());
    } catch (e) { console.error(e); } finally { setIsArchitecting(false); }
  };

  const handleRefineDay = async () => {
    if (!activeDate || !refinementInput.trim()) return;
    const dateStr = activeDate.toDateString();
    const existingPlan = plans[dateStr];
    if (!existingPlan) return;

    setIsArchitecting(true);
    try {
      const result = await gemini.refineRotation({ [dateStr]: existingPlan }, refinementInput, wardrobe);
      if (result[dateStr]) {
        const newPlans = { ...plans, [dateStr]: result[dateStr] };
        setPlans(newPlans);
        localStorage.setItem('teola_planned_days', JSON.stringify(newPlans));
        setRefinementInput('');
      }
    } catch (e) { console.error(e); } finally { setIsArchitecting(false); }
  };

  return (
    <div className="flex h-full bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-hidden">
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-32 no-scrollbar relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in fade-in duration-700">
          <div className="flex items-center gap-4">
            <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all" title="Menu"><Menu size={20} /></button>
            <button onClick={onNavigateToWardrobe} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all" title="Closet"><Shirt size={20} /></button>
            <div className="space-y-2">
              <h2 className="serif text-4xl md:text-7xl font-bold tracking-tighter dark:text-white text-neutral-900">Weekly Planner</h2>
              <p className="text-neutral-400 dark:text-neutral-500 text-[10px] md:text-sm italic max-w-xl uppercase tracking-widest">Aesthetic Strategic Rotation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowRotations(!showRotations)}
              className="px-6 py-4 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Archive size={16} /> Saved Rotations {showRotations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button 
              onClick={() => setIsBatchPlanning(true)}
              className="px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <CalendarDays size={18} className="text-blue-500" /> Deploy Rotation
            </button>
          </div>
        </header>

        {/* Saved Rotations List - Toggleable */}
        {showRotations && (
          <section className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 px-2">
                <Layers size={20} className="text-blue-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">Active Rotations</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-4">
                {savedRotations.length === 0 ? (
                  <div className="w-full py-8 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] opacity-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">No rotations deployed yet</p>
                  </div>
                ) : (
                  savedRotations.map(rot => (
                    <button 
                      key={rot.id} 
                      onClick={() => onOpenRotation?.(rot.id)}
                      className="min-w-[200px] p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] text-left group hover:border-blue-500 transition-all shadow-sm"
                    >
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{rot.duration_weeks} Weeks</p>
                      <h4 className="serif text-xl font-bold dark:text-white mb-4 truncate">{rot.name}</h4>
                      <div className="flex items-center justify-between">
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">{Object.keys(rot.plan).length} Days Planned</span>
                          <ArrowRight size={14} className="text-neutral-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                      </div>
                    </button>
                  ))
                )}
            </div>
          </section>
        )}

        {/* Calendar Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <BookmarkPlus size={20} className="text-emerald-500" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white">Daily Ledger</h3>
              </div>
              <div className="flex items-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-1 min-w-[140px] md:min-w-[240px]">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-neutral-400"><ChevronLeft size={14} /></button>
                <span className="flex-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest dark:text-white text-center truncate">
                  {currentDate.toLocaleString('default', { month: 'short' })} '{currentDate.getFullYear().toString().slice(2)}
                </span>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-neutral-400"><ChevronRight size={14} /></button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-[1px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl">
            {calendarDays.map((cd, i) => {
              const dateStr = cd.date.toDateString();
              const plan = plans[dateStr];
              const isToday = dateStr === new Date().toDateString();
              
              return (
                <div key={i} 
                  onClick={() => cd.currentMonth && setActiveDate(cd.date)} 
                  className={`min-h-[100px] md:min-h-[220px] p-4 md:p-6 bg-white dark:bg-neutral-900 transition-all cursor-pointer group relative ${!cd.currentMonth ? 'opacity-20 pointer-events-none' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] md:text-sm font-bold ${isToday ? 'bg-black text-white w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full' : 'text-neutral-900 dark:text-white'}`}>{cd.day}</span>
                    {plan && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                  </div>
                  
                  {plan ? (
                    <div className="mt-2 space-y-1">
                      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hidden md:block">
                        {plan.outfitOptions?.[0]?.visual_url && <img src={plan.outfitOptions[0].visual_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <p className="text-[6px] md:text-[8px] font-black uppercase text-neutral-800 dark:text-neutral-200 truncate">{plan.eventDescription}</p>
                    </div>
                  ) : cd.currentMonth && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-blue-500/5 backdrop-blur-[1px]">
                       <Plus size={14} className="text-blue-500" />
                    </div>
                  )}
                </div>
              );
            })}
           </div>
        </div>
      </div>

      {/* Deploy Rotation Modal */}
      {isBatchPlanning && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/10">
             
             {/* Settings Panel */}
             <div className="w-full md:w-2/5 p-6 md:p-10 space-y-8 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                <header className="flex items-center justify-between">
                   <h3 className="serif text-3xl font-bold dark:text-white">Batch Architect</h3>
                   <button onClick={() => setIsBatchPlanning(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full dark:text-white"><X size={24} /></button>
                </header>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Rotation Identity</label>
                      <input 
                        type="text" 
                        value={rotationName} 
                        onChange={e => setRotationName(e.target.value)} 
                        placeholder="e.g. Summer London Prep" 
                        className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-xs font-bold outline-none dark:text-white" 
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Start Date</label>
                         <input 
                          type="date" 
                          value={startDateStr}
                          onChange={e => setStartDateStr(e.target.value)}
                          className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-xs font-bold outline-none dark:text-white"
                         />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Span (Weeks 1-4)</label>
                        <input 
                          type="number"
                          min={1}
                          max={4}
                          value={planDuration} 
                          onChange={e => setPlanDuration(Math.min(4, Math.max(1, Number(e.target.value))))}
                          className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-xs font-bold dark:text-white outline-none border border-neutral-100 dark:border-neutral-800"
                        />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Deployment Instructions</label>
                      <textarea 
                        value={batchMoodDesc} 
                        onChange={e => setBatchMoodDesc(e.target.value)} 
                        placeholder="e.g. Arrange all corporate clothes into all working days..." 
                        className="w-full h-32 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl p-6 text-xs font-medium outline-none dark:text-white italic resize-none" 
                      />
                   </div>

                   <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Source Material</label>
                    <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                        <button onClick={() => setBatchMode('wardrobe')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg ${batchMode === 'wardrobe' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white' : 'text-neutral-400'}`}>My Closet</button>
                        <button onClick={() => setBatchMode('market')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg ${batchMode === 'market' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}>New Market</button>
                    </div>
                   </div>
                </div>

                <button 
                  onClick={handleBatchPlan} 
                  disabled={isArchitecting || !batchMoodDesc.trim()} 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 active:scale-95 disabled:opacity-30 transition-all"
                >
                  {isArchitecting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Generate Rotation
                </button>
             </div>

             {/* Wardrobe Selection Panel */}
             <div className="flex-1 p-6 md:p-10 bg-white dark:bg-neutral-950 flex flex-col space-y-6 overflow-hidden">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest dark:text-white">Archive Selection</h4>
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-neutral-400 uppercase">Select items or let AI choose</span>
                      <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">{selectedBatchItemIds.size || 'Auto'} Selected</span>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-10">
                   {wardrobe.map(item => {
                     const isSelected = selectedBatchItemIds.has(item.id);
                     return (
                       <div 
                        key={item.id} 
                        onClick={() => toggleItemSelection(item.id)}
                        className={`aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group relative ${isSelected ? 'border-blue-500 scale-[0.98] shadow-lg' : 'border-transparent grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
                       >
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                          {isSelected && <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1"><Check size={10} strokeWidth={4} /></div>}
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Single Day Planning Modal */}
      {activeDate && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-white/5 shadow-2xl">
              <header className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                 <div>
                    <h3 className="serif text-2xl font-bold dark:text-white">{activeDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                    <p className="text-[8px] font-black uppercase text-blue-500 tracking-widest">Plan & Refine</p>
                 </div>
                 <button onClick={() => { setActiveDate(null); setRefinementInput(''); }} className="p-2 text-neutral-400"><X size={24} /></button>
              </header>
              
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                 {plans[activeDate.toDateString()] ? (
                    <div className="space-y-6">
                       <div className="flex gap-4 items-start p-4 bg-neutral-50 dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700">
                          <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0">
                             {plans[activeDate.toDateString()].outfitOptions?.[0]?.visualUrl && (
                                <img src={plans[activeDate.toDateString()].outfitOptions[0].visualUrl} className="w-full h-full object-cover" />
                             )}
                          </div>
                          <div className="space-y-1">
                             <h4 className="serif text-lg font-bold dark:text-white">{plans[activeDate.toDateString()].outfitOptions?.[0]?.name || 'Look Archived'}</h4>
                             <p className="text-[10px] text-neutral-500 italic leading-relaxed">"{plans[activeDate.toDateString()].eventDescription}"</p>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Refine this Look</label>
                          <div className="relative">
                             <textarea 
                                value={refinementInput} 
                                onChange={e => setRefinementInput(e.target.value)} 
                                placeholder="e.g. Shift this to Tuesday or improve the corporate vibe..." 
                                className="w-full h-24 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 text-xs italic outline-none dark:text-white resize-none" 
                             />
                             <button 
                                onClick={handleRefineDay}
                                disabled={!refinementInput.trim() || isArchitecting}
                                className="absolute bottom-3 right-3 p-2.5 bg-blue-600 text-white rounded-xl active:scale-90 transition-all shadow-lg"
                             >
                                <Send size={14} />
                             </button>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Event Name</label>
                          <input type="text" value={dayEvent} onChange={e => setDayEvent(e.target.value)} placeholder="e.g. Gallery Opening Night" className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Outfit Identity (Name)</label>
                          <input type="text" value={singleDayName} onChange={e => setSingleDayName(e.target.value)} placeholder="e.g. Midnight Monochrome" className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Style Note</label>
                          <textarea value={dayStyle} onChange={e => setDayStyle(e.target.value)} placeholder="e.g. Sharp, tailored, focus on accessories..." className="w-full h-24 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 text-xs italic outline-none dark:text-white resize-none" />
                       </div>
                    </div>
                 )}
              </div>

              {!plans[activeDate.toDateString()] && (
                 <footer className="p-8 border-t border-neutral-100 dark:border-neutral-800">
                    <button 
                       onClick={handlePlanSingleDay}
                       disabled={isArchitecting || !dayEvent.trim()}
                       className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 transition-all active:scale-95"
                    >
                       {isArchitecting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Secure Plan
                    </button>
                 </footer>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanView;
