import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ClothingItem, WARDROBE_LIMIT_FREE, UserProfile, Outfit } from '../types';
import { 
  Plus, Trash2, Camera, Shirt, X, Check, Loader2, Sparkles, Star, 
  Search, CheckCircle2, Circle, MousePointer2, Tag, Archive, 
  ShoppingBag, Terminal, Zap, MoreVertical, Wand2, Crown, 
  AlertTriangle, MessageSquare, History, TrendingUp, Send, ImagePlus,
  Lock, Scissors, Sparkle, UploadCloud, Edit3, Filter, Menu, User, Sparkle as SparkleIcon,
  ChevronRight, Mic, Play, Brain, LayoutGrid, BookmarkPlus, Camera as CameraIcon,
  Image as ImageIcon, Upload as UploadIcon, Headphones, FolderHeart, PlusCircle
} from 'lucide-react';
import { gemini } from '../services/geminiService';

interface WardrobeViewProps {
  items: ClothingItem[];
  subscriptionTier: string;
  onAdd: (item: ClothingItem) => void;
  onUpdate: (item: ClothingItem) => void;
  onBulkUpdate: (items: ClothingItem[]) => void;
  onBulkRemove: (ids: string[]) => void;
  onRemove: (id: string) => void;
  onToggleStar: (id: string) => void;
  onStyleItems: (items: ClothingItem[]) => void;
  onQuickUpload: (file: File) => void;
  onBulkTextImport: (text: string) => void;
  onUpgrade?: () => void;
  userProfile?: UserProfile | null;
  onSendMessage?: (text: string) => void;
  onStartLive?: () => void;
  onMenuToggle?: () => void;
  onNavigateToChat?: () => void;
  savedOutfits?: Outfit[];
  onSaveOutfit?: (outfit: Outfit) => void;
}

const IMAGINE_RECOMMENDATIONS = {
  Female: [
    { id: '1', title: 'Elegant Evening Gown', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me in a luxurious floor-length silk evening gown.' },
    { id: '2', title: 'High-Fashion Bikini', image: 'https://images.unsplash.com/photo-1542491509-3001e5075bc7?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me in a chic designer resort bikini.' },
    { id: '3', title: 'Avant-Garde Bob Cut', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me with a sharp, geometric high-fashion haircut.' }
  ],
  Male: [
    { id: '4', title: 'Bespoke Tuxedo', image: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68e?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me in a custom-tailored midnight blue tuxedo.' },
    { id: '5', title: 'Streetwear Tech-Set', image: 'https://images.unsplash.com/photo-1552066344-2464c9732609?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me in premium oversized techwear layers.' },
    { id: '6', title: 'Faded Texture Hair', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me with a clean high-fade and textured volume on top.' }
  ],
  'Non-binary': [
    { id: '7', title: 'Gender-Fluid Tailoring', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400', prompt: 'Imagine me in sculptural, androgynous oversized tailoring.' }
  ]
};

const WardrobeView: React.FC<WardrobeViewProps> = ({ 
  items = [], subscriptionTier, onAdd, onUpdate, onBulkUpdate, onBulkRemove, onRemove, 
  onToggleStar, onStyleItems, onQuickUpload, onBulkTextImport, onUpgrade, userProfile, onSendMessage, onStartLive, onMenuToggle, onNavigateToChat,
  savedOutfits = [], onSaveOutfit
}) => {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [wardrobePrompt, setWardrobePrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendedOutfits, setRecommendedOutfits] = useState<Outfit[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [visualizingId, setVisualizingId] = useState<string | null>(null);

  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [synthesisName, setSynthesisName] = useState('');
  const [hasGeneratedResponse, setHasGeneratedResponse] = useState(false);

  const [showImagineModal, setShowImagineModal] = useState<any>(null);
  
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const itemCameraInputRef = useRef<HTMLInputElement>(null);
  const userPhotoFileRef = useRef<HTMLInputElement>(null);
  const userPhotoCameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items.length >= 1 && recommendedOutfits.length === 0) {
      loadOutfitRecommendations();
    }
  }, [items.length]);

  const loadOutfitRecommendations = async () => {
    setIsGeneratingRecs(true);
    try {
      const prompt = `Based on my wardrobe, recommend 3 stylish outfits. Return JSON with 'outfits' array.`;
      const res = await gemini.getStylingAdvice([], items, prompt, userProfile);
      if (res.outfits) {
        const withVisuals = await Promise.all(res.outfits.slice(0, 3).map(async (o: any) => {
          const visual = await gemini.generateOutfitVisual(o.description, userProfile);
          return { ...o, visual_url: visual || undefined };
        }));
        setRecommendedOutfits(withVisuals);
      }
    } catch (e) {
      console.error("Error loading recommendations", e);
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...(items || [])];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => 
        i.category?.toLowerCase().includes(term) || 
        i.color?.toLowerCase().includes(term) ||
        i.brand?.toLowerCase().includes(term) ||
        (i.tags && i.tags.some(t => t?.toLowerCase().includes(term)))
      );
    }
    if (filterType !== 'All') result = result.filter(i => i.category === filterType);
    return result;
  }, [items, filterType, searchTerm]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSynthesize = async () => {
    if (selectedIds.size < 1) return;
    setIsProcessing(true);
    try {
      const selectedItems = items.filter(i => selectedIds.has(i.id));
      const description = `Look composed of: ${selectedItems.map(i => `${i.color} ${i.category}`).join(', ')}`;
      const visual_url = await gemini.generateOutfitVisual(description, userProfile);
      const newOutfit: Outfit = {
        id: Math.random().toString(36).substr(2, 9),
        name: synthesisName || `Custom Set ${savedOutfits.length + 1}`,
        description,
        items: Array.from(selectedIds),
        occasion: 'Custom Curation',
        visual_url: visual_url || undefined,
        saved_at: new Date().toISOString()
      };
      if (onSaveOutfit) onSaveOutfit(newOutfit);
      setIsSelectingMode(false);
      setSelectedIds(new Set());
      setSynthesisName('');
      setShowSynthesisModal(false);
    } catch (e) {} finally { setIsProcessing(false); }
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!wardrobePrompt.trim() || !onSendMessage) return;
    onSendMessage(wardrobePrompt);
    setHasGeneratedResponse(true);
    setWardrobePrompt('');
  };

  const handleImagineProcess = async (file: File) => {
    if (!showImagineModal) return;
    setVisualizingId(showImagineModal.id);
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (onSendMessage) onSendMessage(`Imagine me in: ${showImagineModal.prompt}. (Reference attached)`);
      setVisualizingId(null);
      setIsProcessing(false);
      setShowImagineModal(null);
    };
    reader.readAsDataURL(file);
  };

  const genderRecs = IMAGINE_RECOMMENDATIONS[userProfile?.gender as keyof typeof IMAGINE_RECOMMENDATIONS] || IMAGINE_RECOMMENDATIONS.Female;

  return (
    <div className="h-full bg-white dark:bg-neutral-950 flex flex-col overflow-hidden relative">
      {/* Hidden Inputs */}
      <input type="file" ref={itemFileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onQuickUpload(e.target.files[0])} />
      <input type="file" ref={itemCameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && onQuickUpload(e.target.files[0])} />
      <input type="file" ref={userPhotoFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImagineProcess(e.target.files[0])} />
      <input type="file" ref={userPhotoCameraRef} className="hidden" accept="image/*" capture="user" onChange={(e) => e.target.files?.[0] && handleImagineProcess(e.target.files[0])} />

      <header className="px-6 py-5 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-950 z-40">
        <div className="flex items-center gap-4">

           <button onClick={onNavigateToChat} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all" title="Stylist"><MessageSquare size={20} /></button>
           <h2 className="serif text-xl font-bold dark:text-white">MAISON CLOSET</h2>
        </div>
        <button onClick={onUpgrade} className="px-4 py-2 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Upgrade Elite</button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        {/* LEVEL 1: RECOMMENDED OUTFITS */}
        <section className="p-6 md:p-10 space-y-6">
          <div className="flex items-center gap-3 text-blue-500">
              <Sparkles size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Try out these outfits</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 min-h-[140px]">
              {items.length === 0 ? (
                <div className="flex items-center gap-4 p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-neutral-200 dark:border-neutral-800 w-full">
                  <Zap size={20} className="text-neutral-300" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Archive pieces below to unlock AI curation</p>
                </div>
              ) : isGeneratingRecs ? (
                [1,2,3].map(i => <div key={i} className="min-w-[180px] aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />)
              ) : recommendedOutfits.length > 0 ? (
                recommendedOutfits.map((o, idx) => (
                  <div key={idx} className="min-w-[180px] aspect-[3/4] bg-neutral-50 dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm group cursor-pointer relative">
                    {o.visual_url ? <img src={o.visual_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Shirt size={32} /></div>}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest truncate">{o.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="flex items-center gap-4 p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-neutral-200 dark:border-neutral-800 w-full">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Synthesizing looks from your archive...</p>
                </div>
              )}
          </div>
        </section>

        {/* LEVEL 2: IMAGINE YOURSELF */}
        <section className="px-6 md:px-10 pb-10 space-y-6">
           <div className="flex items-center gap-3 text-purple-500">
              <Brain size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Imagine yourself in these</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {genderRecs.map(rec => (
                <button 
                  key={rec.id} 
                  onClick={() => setShowImagineModal(rec)}
                  className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-white/5 rounded-2xl hover:scale-[1.02] transition-all text-left group"
                >
                   <div className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-100 dark:border-white/10 shrink-0">
                      <img src={rec.image} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="flex-1">
                      <h4 className="serif text-xs font-bold dark:text-white truncate">{rec.title}</h4>
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">Try It <ChevronRight size={10} /></p>
                   </div>
                   {visualizingId === rec.id && <Loader2 size={12} className="animate-spin text-blue-500" />}
                </button>
              ))}
           </div>
        </section>

        {/* LEVEL 3: THE VAULT */}
        <div className="px-6 md:px-10 space-y-8">
           <div className="flex items-center justify-between border-t border-neutral-100 dark:border-white/5 pt-10">
              <div className="space-y-1">
                 <h3 className="serif text-5xl font-bold tracking-tighter dark:text-white uppercase">THE VAULT</h3>
                 <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.4em]">{items.length} ARCHIVED PIECES</p>
              </div>
              {items.length > 0 && (
                <button 
                  onClick={() => { setIsSelectingMode(!isSelectingMode); setSelectedIds(new Set()); }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelectingMode ? 'bg-red-500 text-white shadow-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'}`}
                >
                  {isSelectingMode ? 'Cancel Selection' : 'Batch Select'}
                </button>
              )}
           </div>

           {items.length === 0 ? (
             /* Empty State for the Vault */
             <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-neutral-50/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-900 shadow-xl flex items-center justify-center text-neutral-200 mb-2 border border-neutral-100 dark:border-neutral-800">
                   <FolderHeart size={48} strokeWidth={1} className="opacity-20" />
                </div>
                <div className="space-y-2">
                   <h4 className="serif text-2xl font-bold dark:text-white">Your Vault is Empty</h4>
                   <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">Teola needs to see your pieces to architect your unique sartorial presence.</p>
                </div>
                <button 
                  onClick={() => itemFileInputRef.current?.click()}
                  className="px-12 py-6 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <PlusCircle size={20} /> Add Clothes
                </button>
             </div>
           ) : (
             /* Populated State for the Vault */
             <div className="space-y-6">
                {/* Search & Add Tools */}
                <div className="flex items-center gap-3">
                   <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                     <input 
                       type="text" 
                       placeholder="Search shirt, shoe, watch..." 
                       value={searchTerm} 
                       onChange={(e) => setSearchTerm(e.target.value)} 
                       className="w-full pl-12 pr-6 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl text-xs outline-none dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                     />
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => itemCameraInputRef.current?.click()} className="p-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-500 rounded-2xl active:scale-90 transition-all shadow-sm"><CameraIcon size={20} /></button>
                      <button onClick={() => itemFileInputRef.current?.click()} className="p-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-amber-500 rounded-2xl active:scale-90 transition-all shadow-sm"><ImageIcon size={20} /></button>
                   </div>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
                   {filteredItems.map((item) => {
                     const isSelected = selectedIds.has(item.id);
                     return (
                       <div 
                         key={item.id} 
                         onClick={() => isSelectingMode ? toggleSelect(item.id) : null}
                         className={`group bg-neutral-50 dark:bg-neutral-900 rounded-[2rem] overflow-hidden border transition-all duration-500 relative cursor-pointer ${isSelectingMode && isSelected ? 'border-blue-500 ring-4 ring-blue-500/10 scale-95' : 'border-neutral-100 dark:border-white/5 hover:shadow-xl'}`}
                       >
                          <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                             <img src={item.image} className={`w-full h-full object-cover transition-transform duration-1000 ${isSelectingMode && !isSelected ? 'opacity-40 grayscale' : 'group-hover:scale-110'}`} alt="" />
                             {isSelectingMode && (
                                <div className="absolute top-4 right-4">
                                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-black/20 border-white'}`}>
                                      {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                                   </div>
                                </div>
                             )}
                             <div className="absolute top-4 left-4"><span className="px-2 py-1 bg-black/40 backdrop-blur rounded-full text-[7px] font-black text-white uppercase tracking-widest">{item.category}</span></div>
                          </div>
                          <div className="p-4 space-y-1">
                             <p className="text-[7px] font-black uppercase text-neutral-400 tracking-widest">{item.color} {item.brand}</p>
                             <h4 className="serif text-sm font-bold dark:text-white truncate">{item.tags?.[0] || item.category}</h4>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Synthesis Naming Modal */}
      {showSynthesisModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-white/5 shadow-2xl">
              <header className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="serif text-2xl font-bold dark:text-white">Synthesize Outfit</h3>
                    <p className="text-[8px] font-black uppercase text-blue-500 tracking-widest">Final Archival Step</p>
                 </div>
                 <button onClick={() => setShowSynthesisModal(false)} className="p-2 text-neutral-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
              </header>
              <div className="p-8 space-y-8">
                 <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {items.filter(i => selectedIds.has(i.id)).map(item => (
                      <div key={item.id} className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shrink-0">
                         <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Outfit Identity</label>
                    <input 
                      type="text" 
                      value={synthesisName}
                      onChange={e => setSynthesisName(e.target.value)}
                      placeholder="e.g. Modern Monochrome Look"
                      className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-xs font-bold outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    />
                 </div>
              </div>
              <footer className="p-8 bg-neutral-50/50 dark:bg-white/5 border-t border-neutral-100 dark:border-neutral-800">
                 <button 
                  onClick={handleSynthesize}
                  disabled={isProcessing}
                  className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 active:scale-95 transition-all"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <BookmarkPlus size={18} />}
                   {isProcessing ? 'Architecting...' : 'Archive to Vault'}
                 </button>
              </footer>
           </div>
        </div>
      )}

      {/* Bottom Prompt Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white dark:from-neutral-950 via-white/95 dark:via-neutral-950/95 to-transparent pointer-events-none z-[450]">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form 
            onSubmit={handlePromptSubmit} 
            className="flex flex-col gap-2 p-1.5 bg-neutral-100 dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl transition-all focus-within:ring-4 focus-within:ring-blue-500/5"
          >
            <div className="flex items-end gap-2 px-2">
              <div className="flex items-center pb-2.5 gap-1.5">
                 <button type="button" onClick={() => itemCameraInputRef.current?.click()} className="p-3 text-neutral-400 hover:text-blue-500 transition-all active:scale-90"><Camera size={20} /></button>
                 <button type="button" onClick={() => itemFileInputRef.current?.click()} className="p-3 text-neutral-400 hover:text-amber-500 transition-all active:scale-90"><ImageIcon size={20} /></button>
                 <button type="button" onClick={onStartLive} className="p-3 text-neutral-400 hover:text-emerald-500 transition-all active:scale-90"><Mic size={20} /></button>
              </div>
              
              <textarea 
                rows={1}
                value={wardrobePrompt}
                onChange={e => setWardrobePrompt(e.target.value)}
                placeholder={hasGeneratedResponse ? "Improve outfit now..." : "Describe outfit you want..."} 
                className="flex-1 bg-transparent text-black dark:text-white text-sm md:text-base outline-none py-3.5 px-2 resize-none no-scrollbar min-h-[44px] leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600" 
              />

              <div className="flex items-center pb-1.5">
                <button 
                  type="submit" 
                  disabled={!wardrobePrompt.trim()}
                  className={`p-3 rounded-full transition-all shadow-xl active:scale-95 ${wardrobePrompt.trim() ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-white/5 text-neutral-400'}`}
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          </form>
          <p className="text-center mt-3 text-[7px] font-black uppercase tracking-[0.3em] text-neutral-400">Neural Wardrobe Protocol v8.2 Secure</p>
        </div>
      </div>
    </div>
  );
};

export default WardrobeView;