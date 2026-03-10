
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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 overflow-y-auto no-scrollbar">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group mb-2">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back</span>
          </button>
          <div className="flex items-center gap-2 text-blue-500">
            <Sparkles size={20} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">The Archives</span>
          </div>
          <h2 className="serif text-5xl font-bold tracking-tight dark:text-white transition-colors duration-500">Saved Vault</h2>
          <p className="text-neutral-400 text-sm italic">"Curating your definitive sartorial history."</p>
        </div>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-sm transition-colors duration-500">
          <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-200 dark:text-neutral-700">
            <LayoutGrid size={40} className="opacity-20" />
          </div>
          <div className="space-y-2">
            <h3 className="serif text-3xl font-bold text-neutral-300 dark:text-neutral-700">Vault empty</h3>
            <p className="text-neutral-400 text-sm max-w-xs mx-auto">Bookmark outfits from Teola to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredOutfits.map((outfit) => (
            <div key={outfit.id} className="group bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                {outfit.visualUrl ? (
                  <img src={outfit.visualUrl} alt={outfit.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-200 dark:text-neutral-700"><Shirt size={64} /></div>
                )}
                
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button onClick={() => onRemove(outfit.id)} className="p-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-400 hover:text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-75"><Trash2 size={18} /></button>
                  <button onClick={() => handleShare(outfit)} className="p-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-400 hover:text-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-75">{copiedId === outfit.id ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}</button>
                </div>

                <div className="absolute bottom-6 left-6 flex gap-2">
                   {(outfit.items || []).slice(0, 3).map(id => {
                     const item = wardrobe.find(i => i.id === id);
                     if (!item) return null;
                     return (
                       <div key={id} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-700 overflow-hidden shadow-lg transition-transform hover:scale-125 bg-white dark:bg-neutral-800">
                         <img src={item.image} className="w-full h-full object-cover" alt="" />
                       </div>
                     )
                   })}
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col transition-colors duration-500">
                <div className="space-y-3 flex-1">
                  <h3 className="serif text-2xl font-bold text-neutral-900 dark:text-white transition-colors">{outfit.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed italic border-l-2 border-neutral-100 dark:border-neutral-800 pl-4 py-1 line-clamp-2">
                    "{outfit.description}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOutfitsView;
