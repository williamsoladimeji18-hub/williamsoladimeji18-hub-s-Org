
import React, { useState } from 'react';
import { Outfit, ClothingItem } from '../types';
import { Trash2, Calendar, Shirt, Sparkles, LayoutGrid, ArrowUpRight, Share2, Check, ArrowLeft } from 'lucide-react';

interface SavedOutfitsViewProps {
  outfits: Outfit[];
  wardrobe: ClothingItem[];
  onRemove: (id: string) => void;
  onBack?: () => void;
}

const SavedOutfitsView: React.FC<SavedOutfitsViewProps> = ({ outfits = [], wardrobe = [], onRemove, onBack }) => {
  const [filter, setFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterOptions = ['All', 'Work', 'Casual', 'Church', 'Formal', 'Party'];

  const filteredOutfits = filter === 'All' 
    ? (outfits || []) 
    : (outfits || []).filter(o => o.occasion?.toLowerCase().includes(filter.toLowerCase()) || o.name?.toLowerCase().includes(filter.toLowerCase()));

  const handleShare = async (outfit: Outfit) => {
    const matchedItems = (outfit.items || []).map(id => wardrobe.find(item => item.id === id)).filter(Boolean);
    const itemNames = matchedItems.map(i => `${i?.color} ${i?.category}`).join(', ');
    
    const shareData = {
      title: `Teola Lookbook: ${outfit.name}`,
      text: `Check out this ${outfit.occasion} outfit Teola curated for me: "${outfit.name}"\n\nPieces: ${itemNames}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      const shareText = `${shareData.title}\n\n${shareData.text}`;
      navigator.clipboard.writeText(shareText);
      setCopiedId(outfit.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20 space-y-16 animate-in fade-in duration-1000 pb-40">
        
        <header className="space-y-8">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-3 text-neutral-400 hover:text-black dark:hover:text-white transition-all group">
              <div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Atelier</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex items-center gap-2 text-blue-500">
                <Sparkles size={16} />
                <span className="text-[10px] uppercase tracking-[0.4em] font-black">The Archives</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <h2 className="serif text-6xl md:text-8xl font-bold tracking-tighter dark:text-white leading-[0.9]">Saved Vault</h2>
            <p className="text-neutral-400 text-lg md:text-xl italic font-light">"Curating your definitive sartorial history."</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            {filterOptions.map(opt => (
              <button 
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === opt ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'bg-white dark:bg-neutral-900 text-neutral-400 border border-neutral-100 dark:border-neutral-800'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </header>

        {filteredOutfits.length === 0 ? (
          <div className="w-full aspect-[21/9] min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 bg-white dark:bg-neutral-900 rounded-[4rem] border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all duration-700 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 gap-4 p-8">
                  {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className="aspect-square border border-black dark:border-white rounded-2xl" />
                  ))}
               </div>
            </div>
            
            <div className="w-32 h-32 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-200 dark:text-neutral-700 relative z-10">
              <LayoutGrid size={48} className="opacity-20 group-hover:scale-110 transition-transform duration-700" />
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="serif text-4xl font-bold text-neutral-300 dark:text-neutral-700">Vault empty</h3>
              <p className="text-neutral-400 text-sm max-w-sm mx-auto font-medium">Bookmark outfits from Teola to see them here. Your curated history begins with a single selection.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredOutfits.map((outfit) => (
              <div key={outfit.id} className="group bg-white dark:bg-neutral-900 rounded-[3rem] overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-3xl transition-all duration-700 flex flex-col h-full">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                  {outfit.visualUrl ? (
                    <img src={outfit.visualUrl} alt={outfit.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-200 dark:text-neutral-700"><Shirt size={80} strokeWidth={1} /></div>
                  )}
                  
                  <div className="absolute top-8 right-8 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <button onClick={() => onRemove(outfit.id)} className="p-4 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-red-500 rounded-2xl shadow-2xl transition-all active:scale-75"><Trash2 size={20} /></button>
                    <button onClick={() => handleShare(outfit)} className="p-4 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-blue-500 rounded-2xl shadow-2xl transition-all active:scale-75">{copiedId === outfit.id ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}</button>
                  </div>

                  <div className="absolute bottom-8 left-8 flex -space-x-4">
                     {(outfit.items || []).slice(0, 4).map((id, idx) => {
                       const item = wardrobe.find(i => i.id === id);
                       if (!item) return null;
                       return (
                         <div key={id} className="w-14 h-14 rounded-2xl border-4 border-white dark:border-neutral-900 overflow-hidden shadow-2xl transition-all hover:scale-110 hover:z-10 bg-white dark:bg-neutral-800" style={{ transitionDelay: `${idx * 50}ms` }}>
                           <img src={item.image} className="w-full h-full object-cover" alt="" />
                         </div>
                       )
                     })}
                  </div>
                </div>

                <div className="p-10 space-y-6 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full">{outfit.occasion || 'General'}</span>
                      <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                    <h3 className="serif text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{outfit.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed italic font-light">
                      "{outfit.description}"
                    </p>
                  </div>
                  
                  <button className="w-full py-4 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                    View Assembly
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedOutfitsView;
