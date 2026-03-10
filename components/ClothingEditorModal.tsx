
import React, { useState, useEffect, useRef } from 'react';
import { ClothingItem } from '../types';
import { 
  X, Check, Loader2, Scissors, Highlighter, Watch, User, Sparkle, 
  Eraser, Scan, Shirt, DollarSign, Box, Maximize2, Move3d, 
  RotateCcw, Zap, Layers, Compass, ImagePlus, RefreshCcw, Wand2
} from 'lucide-react';
import { gemini } from '../services/geminiService';

interface ClothingEditorModalProps {
  item: ClothingItem;
  isAnalyzing: boolean;
  onUpdate: (item: ClothingItem) => void;
  onSave: (item: ClothingItem) => void;
  onCancel: () => void;
}

const ClothingEditorModal: React.FC<ClothingEditorModalProps> = ({ item, isAnalyzing, onUpdate, onSave, onCancel }) => {
  const [showCropAnimation, setShowCropAnimation] = useState(true);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Dresses', 'Outerwear', 'Activewear', 'Native', 'Caps', 'Bags', 'Glasses', 'Watches'];

  useEffect(() => {
    if (!isAnalyzing) {
      const timer = setTimeout(() => setShowCropAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  const handleSynthesizeVisual = async () => {
    setIsSynthesizing(true);
    try {
      const desc = `A single ${item.color} ${item.category} garment piece, professional fashion photography, flat lay, clean grey background, detailed fabric texture.`;
      const url = await gemini.generateOutfitVisual(desc, null, [], false);
      if (url) {
        onUpdate({ ...item, image: url, isPlaceholder: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const isMissingImage = item.image.includes('placeholder') || !item.image || item.image.length < 50;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-900 rounded-[40px] shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row border border-white/10">
        
        <div className="w-full md:w-3/5 bg-neutral-100 dark:bg-black/50 relative overflow-hidden flex items-center justify-center p-12">
          {isMissingImage && !isSynthesizing ? (
            <button 
              onClick={handleSynthesizeVisual}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all z-30"
            >
              <Wand2 size={18} /> Synthesize Garment Visual
            </button>
          ) : (
            <img 
              src={item.image} 
              alt="Preview" 
              className={`max-w-full max-h-full object-contain transition-all duration-1000 ${showCropAnimation ? 'scale-75 blur-sm grayscale' : 'scale-100 blur-0 grayscale-0 shadow-2xl'}`} 
            />
          )}
          
          {(isAnalyzing || isSynthesizing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
               <Loader2 size={48} className="text-blue-500 animate-spin" />
               <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] animate-pulse">
                  {isSynthesizing ? 'Synthesizing Texture...' : 'Neural Analysis...'}
               </span>
            </div>
          )}
        </div>

        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-between bg-white dark:bg-neutral-900 overflow-y-auto no-scrollbar">
          <div className="space-y-10">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="serif text-3xl font-bold dark:text-white uppercase tracking-tighter">Archive Node</h3>
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-500">Neural Metadata Calibration</p>
              </div>
              <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-full dark:text-white"><X size={24} /></button>
            </header>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-400 ml-1">Identity Class</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => onUpdate({...item, category: cat})}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${item.category === cat ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-400 ml-1">Palette Signature</label>
                <input 
                  type="text" 
                  value={item.color} 
                  onChange={(e) => onUpdate({...item, color: e.target.value})} 
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 rounded-2xl px-5 py-4 text-xs font-bold dark:text-white outline-none" 
                  placeholder="e.g. Chrome Obsidian" 
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3">
            <button onClick={() => onSave(item)} disabled={isAnalyzing || isSynthesizing} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-30"><Check size={18} /> Archive DNA</button>
            <button onClick={onCancel} className="w-full py-4 border border-neutral-200 text-neutral-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-50">Discard</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingEditorModal;
