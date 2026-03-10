
import React, { useMemo, useState, useEffect } from 'react';
import { ClothingItem, UserProfile, Outfit } from '../types';
import { gemini } from '../services/geminiService';
import TeolaLogo from './TeolaLogo';
import { 
  BarChart3, TrendingUp, Sparkles, PieChart, DollarSign, RefreshCw, Zap, Info, ArrowUpRight, Palette, 
  Layers, Recycle, Lock, Crown, Shirt, Send, Loader2, AlertCircle, History, Menu, ArrowLeft
} from 'lucide-react';

interface AnalyticsViewProps {
  wardrobe: ClothingItem[];
  user: UserProfile | null;
  onUpgrade?: () => void;
  onSeedStyling?: (trendTitle: string) => void;
  onMenuToggle?: () => void;
  onBack?: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ wardrobe, user, onUpgrade, onSeedStyling, onMenuToggle, onBack }) => {
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [personalEdits, setPersonalEdits] = useState<Outfit[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingEdits, setIsGeneratingEdits] = useState(false);
  const [vibeInput, setVibeInput] = useState('');

  const isElite = user?.subscriptionTier === 'Pro' || user?.isElite;
  const isFreeTier = user?.subscriptionTier === 'Free';

  useEffect(() => {
    if (isElite) fetchInsights();
    if (wardrobe.length > 0) {
      loadWardrobeEdits("trending and high-fashion");
    }
  }, [wardrobe.length, isElite]);

  const fetchInsights = async () => {
    if (wardrobe.length < 5) return;
    setIsAnalyzing(true);
    try {
      const insights = await gemini.getDeepWardrobeInsights(wardrobe, user);
      setAiInsights(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadWardrobeEdits = async (vibe: string) => {
    if (wardrobe.length === 0) return;
    setIsGeneratingEdits(true);
    try {
      const prompt = `Recommend 3 distinct ${vibe} outfits using ONLY pieces from my wardrobe. Return them as a JSON object with an 'outfits' array.`;
      const response = await gemini.getStylingAdvice([], wardrobe, prompt, user, 'wardrobe');
      
      if (response.outfits) {
        const curations = response.outfits.slice(0, 3);
        const curationsWithVisuals = await Promise.all(curations.map(async (o: Outfit) => {
          const visual = await gemini.generateOutfitVisual(o.description, user);
          return { ...o, visualUrl: visual || undefined };
        }));
        setPersonalEdits(curationsWithVisuals);
      }
    } catch (e) {
      console.error("Failed to generate personal edits:", e);
    } finally {
      setIsGeneratingEdits(false);
    }
  };

  const handleCustomVibeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibeInput.trim()) return;
    if (isFreeTier) {
      alert("Custom vibe generation is a Premium feature.");
      onUpgrade?.();
      return;
    }
    loadWardrobeEdits(vibeInput);
    setVibeInput('');
  };

  const stats = useMemo(() => {
    const totalItems = wardrobe.length;
    if (totalItems === 0) return null;
    const totalInvestment = wardrobe.reduce((acc, i) => acc + (i.price || 0), 0);
    const totalWears = wardrobe.reduce((acc, i) => acc + (i.wearCount || 0), 0);
    const avgCPW = totalInvestment / Math.max(1, totalWears);
    const categories: Record<string, number> = {};
    const colors: Record<string, number> = {};
    const wornItemsCount = wardrobe.filter(i => (i.wearCount || 0) > 0).length;
    const utilizationRate = (wornItemsCount / totalItems) * 100;
    wardrobe.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
      colors[item.color] = (colors[item.color] || 0) + 1;
    });
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const sortedColors = Object.entries(colors).sort((a, b) => b[1] - a[1]);
    return { totalItems, totalInvestment, totalWears, avgCPW, sortedCategories, sortedColors, utilizationRate };
  }, [wardrobe]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-300"><BarChart3 size={40} /></div>
        <div className="space-y-2">
          <h3 className="serif text-3xl font-bold dark:text-white">Awaiting Data</h3>
          <p className="text-neutral-400 text-xs max-w-xs mx-auto">Archive garments to generate Maison Strategic Insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-[120px] md:pb-40 transition-all duration-500">
      <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 md:space-y-20 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onMenuToggle} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl dark:text-white transition-all"><Menu size={20} /></button>
            <div className="space-y-2">
              <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group mb-2">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back</span>
              </button>
              <div className="flex items-center gap-2 text-blue-500"><Zap size={16} /><span className="text-[10px] uppercase tracking-[0.3em] font-black">Performance Lab</span></div>
              <h2 className="serif text-4xl md:text-6xl font-bold tracking-tight dark:text-white">Style Insights</h2>
            </div>
          </div>
          <button onClick={fetchInsights} disabled={isAnalyzing || !isElite} className="flex items-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50">
             <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
             <span className="text-[10px] font-black uppercase tracking-widest">Re-calibrate</span>
          </button>
        </header>

        {/* Maison Archive Edit - Optimized for Mobile */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="flex flex-col gap-4">
              <div className="space-y-1">
                 <div className="flex items-center gap-3 text-amber-500"><Shirt size={18} /><h3 className="text-[9px] font-black uppercase tracking-[0.3em]">Maison Archive Edit</h3></div>
                 <h2 className="serif text-3xl font-bold dark:text-white">Runway Ready (Archive)</h2>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-3xl relative">
                 <p className="text-[10px] text-blue-900 dark:text-blue-200 italic leading-relaxed">
                   Enter a style/event, and Teola will curate your local archive for high-fashion impact.
                 </p>
              </div>
           </div>

           <form onSubmit={handleCustomVibeSubmit} className="relative max-w-md">
              <input value={vibeInput} onChange={e => setVibeInput(e.target.value)} placeholder={isFreeTier ? "Upgrade for custom vibes..." : "e.g. Minimalist Workwear..."} className={`w-full pl-5 pr-14 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-xs outline-none dark:text-white ${isFreeTier ? 'cursor-not-allowed opacity-60' : ''}`} />
              <button type="submit" disabled={isGeneratingEdits || (!isFreeTier && !vibeInput.trim())} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl active:scale-90">
                {isGeneratingEdits ? <Loader2 size={14} className="animate-spin" /> : isFreeTier ? <Lock size={14} className="text-amber-500" /> : <Send size={14} />}
              </button>
           </form>

           {isGeneratingEdits ? (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2].map(i => <div key={i} className="aspect-[3/4] bg-neutral-50 dark:bg-neutral-900 rounded-[2rem] animate-pulse border border-neutral-200 dark:border-neutral-800" />)}
             </div>
           ) : personalEdits.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {personalEdits.map((edit, idx) => (
                  <div key={idx} className="group bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                     <div className="aspect-[4/5] relative overflow-hidden">
                        {edit.visualUrl ? <img src={edit.visualUrl} alt={edit.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-200"><Shirt size={48} /></div>}
                        <div className="absolute top-4 left-4"><span className="px-2.5 py-1 bg-amber-500 text-white text-[8px] font-black uppercase rounded-full">Choice</span></div>
                     </div>
                     <div className="p-6 space-y-3">
                        <h4 className="serif text-xl font-bold dark:text-white truncate">{edit.name}</h4>
                        <button onClick={() => onSeedStyling?.(edit.name)} className="w-full py-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Seed Styling</button>
                     </div>
                  </div>
                ))}
             </div>
           ) : null}
        </section>

        {/* Hero Metrics - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Items', value: stats.totalItems, icon: Layers, color: 'text-blue-500' },
            { label: 'Value', value: `$${stats.totalInvestment.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
            { label: 'Use %', value: `${stats.utilizationRate.toFixed(0)}%`, icon: Recycle, color: 'text-purple-500' },
            { label: 'CPW', value: `$${stats.avgCPW.toFixed(1)}`, icon: TrendingUp, color: 'text-amber-500' },
          ].map((m, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-2">
               <div className={`w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center ${m.color}`}><m.icon size={16} /></div>
               <p className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">{m.label}</p>
               <h4 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter">{m.value}</h4>
            </div>
          ))}
        </div>

        {!isElite && (
          <div className="relative overflow-hidden bg-neutral-900 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 border border-white/10 shadow-2xl">
             <Crown size={40} className="text-amber-400" />
             <div className="space-y-2"><h3 className="serif text-2xl md:text-3xl text-white">Go Maison Elite</h3><p className="text-neutral-400 text-xs">Unlock deep qualitative insights and cost-per-wear mapping.</p></div>
             <button onClick={onUpgrade} className="px-10 py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95">Upgrade</button>
          </div>
        )}

        {isElite && aiInsights.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest dark:text-white">Qualitative Synapse</h3>
            <div className="grid md:grid-cols-3 gap-4">
               {aiInsights.map((insight, i) => (
                 <div key={i} className="p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                    <h4 className="serif text-lg font-bold dark:text-white">{insight.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic">{insight.description}</p>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* Categories & Palette - Responsive */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
           <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3"><PieChart size={18} className="text-blue-500" /><h3 className="text-[10px] font-black uppercase tracking-widest dark:text-white">Density</h3></div>
              <div className="space-y-4">
                 {stats.sortedCategories.slice(0, 4).map(([cat, count]) => {
                    const percentage = (count / stats.totalItems) * 100;
                    return (
                      <div key={cat} className="space-y-1.5">
                         <div className="flex justify-between text-[8px] font-black uppercase tracking-widest"><span className="dark:text-white">{cat}</span><span className="text-neutral-400">{percentage.toFixed(0)}%</span></div>
                         <div className="h-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} /></div>
                      </div>
                    );
                 })}
              </div>
           </div>

           <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3"><Palette size={18} className="text-amber-500" /><h3 className="text-[10px] font-black uppercase tracking-widest dark:text-white">Palette</h3></div>
              <div className="grid grid-cols-2 gap-3">
                 {stats.sortedColors.slice(0, 4).map(([color, count]) => (
                    <div key={color} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-inner" style={{ backgroundColor: color.toLowerCase() }} />
                       <span className="text-[8px] font-black uppercase truncate dark:text-white">{color}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <footer className="pt-12 text-center opacity-30">
           <TeolaLogo className="w-10 h-10 grayscale mx-auto mb-4" />
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400">Neural Stylometry Engine v4.2</p>
        </footer>
      </div>
    </div>
  );
};

export default AnalyticsView;
