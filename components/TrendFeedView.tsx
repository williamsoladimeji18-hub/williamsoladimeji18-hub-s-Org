import React, { useState, useEffect } from 'react';
import { TrendReport, UserProfile, ClothingItem } from '../types';
import { gemini } from '../services/geminiService';
import TeolaLogo from './TeolaLogo';
import { 
  Sparkles, Zap, Globe, TrendingUp, RefreshCw, Layers, Compass, Menu, Shirt
} from 'lucide-react';

interface TrendFeedViewProps {
  user: UserProfile | null;
  wardrobe: ClothingItem[];
  onSeedStyling: (trendTitle: string) => void;
  onUpgrade?: () => void;
  onMenuToggle?: () => void;
  onNavigateToWardrobe?: () => void;
}

const TrendFeedView: React.FC<TrendFeedViewProps> = ({ user, wardrobe, onSeedStyling, onUpgrade, onMenuToggle, onNavigateToWardrobe }) => {
  const [trends, setTrends] = useState<TrendReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const data = await gemini.fetchTrendingRunwayLooks(user);
      setTrends(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 md:space-y-20 pb-40">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">

            <button onClick={onNavigateToWardrobe} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all" title="Closet"><Shirt size={20} /></button>
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3 text-blue-500">
                 <Globe size={20} className="animate-spin-slow" />
                 <span className="text-[10px] uppercase tracking-[0.4em] font-black">Global Runway Intelligence</span>
              </div>
              <h1 className="serif text-5xl md:text-8xl font-bold tracking-tighter dark:text-white text-neutral-900">The Runway</h1>
            </div>
          </div>
          
          <button onClick={loadTrends} disabled={isLoading} className="flex items-center justify-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 active:scale-95 transition-all shadow-sm">
             <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
             <span className="text-[9px] font-black uppercase tracking-widest">Rescan Trends</span>
          </button>
        </header>

        {/* Runway Tip Bubble */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
           <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-5 md:p-6 rounded-[2.5rem] rounded-tl-none relative max-w-2xl">
              <div className="absolute -top-3 -left-3 p-2 bg-blue-600 text-white rounded-full shadow-lg"><Sparkles size={12} fill="currentColor" /></div>
              <p className="text-[10px] md:text-xs text-blue-900 dark:text-blue-200 leading-relaxed italic">
                <span className="font-black">Runway Tip:</span> Head over to the <span className="underline decoration-blue-500 underline-offset-4">Stylist</span> and describe exactly what kind of outfit you want recommended. Teola will architect it using your archive.
              </p>
           </div>
        </section>

        {/* Global Trend Feed - Responsive Grid */}
        <section className="space-y-10">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-blue-500"><TrendingUp size={18} /><h3 className="text-[9px] font-black uppercase tracking-[0.3em]">Neural Synthesis</h3></div>
             <h2 className="serif text-3xl md:text-4xl font-bold dark:text-white">Aesthetic Horizon</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => <div key={i} className="aspect-[4/5] bg-neutral-50 dark:bg-neutral-900 rounded-[2.5rem] animate-pulse border border-neutral-200 dark:border-neutral-800" />)}
            </div>
          ) : trends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {trends.map((trend, idx) => (
                <div key={trend.id || idx} className="group relative bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-neutral-800 transition-all duration-700 hover:shadow-2xl">
                  <div className="aspect-[4/5] relative overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a]">
                     {trend.visualUrl ? <img src={trend.visualUrl} alt={trend.title} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-neutral-200"><Layers size={48} /></div>}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/10 to-transparent opacity-80" />
                     <div className="absolute bottom-6 left-6 right-6 space-y-3">
                        <div className="space-y-0.5"><p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">{trend.aesthetic}</p><h2 className="serif text-2xl md:text-4xl font-bold text-white leading-tight">{trend.title}</h2></div>
                        <div className="flex flex-wrap gap-1.5">
                           {(trend.keyPieces || []).slice(0, 3).map(piece => <span key={piece} className="px-2 py-1 bg-white/10 backdrop-blur rounded-lg text-[7px] font-bold text-white uppercase tracking-tighter border border-white/10">{piece}</span>)}
                        </div>
                     </div>
                  </div>
                  <div className="p-6 md:p-10 space-y-6">
                     <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic border-l border-blue-500/30 pl-4">"{trend.description}"</p>
                     <button onClick={() => onSeedStyling(trend.title)} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">
                       <Zap size={14} fill="currentColor" className="text-blue-500" /> Seed Styling
                     </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6 bg-neutral-50 dark:bg-neutral-900/30 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
               <Compass size={40} className="mx-auto text-neutral-200" />
               <h3 className="serif text-2xl dark:text-white">Trend Radar Offline</h3>
               <button onClick={loadTrends} className="px-8 py-4 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Rescan</button>
            </div>
          )}
        </section>

        <footer className="pt-12 text-center opacity-30">
           <TeolaLogo className="w-12 h-12 grayscale mx-auto mb-4" />
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-400 pb-10">Maison Protocol v4.8</p>
        </footer>
      </div>
    </div>
  );
};

export default TrendFeedView;