import React, { useState, useRef, useEffect } from 'react';
import { Message, Outfit, ClothingItem, SuggestedItem, MarketSuggestion, UserProfile } from '../types';
import QuickAddButton from './QuickAddButton';
import { analytics } from '../services/analyticsService';
import { 
  Send, User, Sparkles, ArrowUpRight, Bookmark, Briefcase, 
  Heart, Shirt, ShoppingBag, Calendar, Globe, Store, Zap, 
  ThumbsUp, ThumbsDown, RefreshCw, Settings, ChevronDown, 
  Search, Archive, Plus, ExternalLink, Play, Loader2, Crown, Star,
  Activity, Snowflake, PartyPopper, Coins, Banknote, Brain, Leaf, 
  ShieldCheck, Gem, Sparkle, Film, Maximize, Monitor, Wand2, ImagePlus,
  Menu, Mic, Paperclip, Camera, Headphones, X, Ghost, ZapOff
} from 'lucide-react';
import { gemini } from '../services/geminiService';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, mode: 'wardrobe' | 'market', context?: any) => void;
  onRefineOutfit: (outfit: Outfit, feedback: string) => void;
  isTyping: boolean;
  wardrobe: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
  savedOutfits: Outfit[];
  onAddSuggestedItem: (item: SuggestedItem) => Promise<ClothingItem>;
  onSendToPlanner: (outfit: Outfit) => void;
  onQuickUpload: (file: File) => void;
  onOutfitFeedback?: (outfitId: string, feedback: 'like' | 'dislike') => void;
  userProfile?: UserProfile | null;
  onUpdateUserProfile?: (updated: UserProfile) => void;
  onUpgrade?: () => void;
  onStartLive?: () => void;
  onMenuToggle?: () => void;
  a11yMode?: boolean;
  isTemporaryChat?: boolean;
  onToggleTemporary?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, onSendMessage, onRefineOutfit, isTyping, wardrobe, 
  onSaveOutfit, savedOutfits, onAddSuggestedItem, onSendToPlanner, 
  onQuickUpload, onOutfitFeedback, userProfile, onUpdateUserProfile, onUpgrade, onStartLive, onMenuToggle, a11yMode,
  isTemporaryChat, onToggleTemporary
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    // We pass wardrobe as default, AI detects market from context
    onSendMessage(input, 'wardrobe');
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#050505] overflow-hidden relative transition-colors duration-500`} role="main">
      {/* Redesigned Header per PDF instructions */}
      <header className="px-4 py-3 md:px-8 md:py-5 flex items-center justify-between bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl z-40 border-b border-neutral-100 dark:border-white/5 shadow-sm shrink-0">
         <div className="flex items-center gap-3">
            <button 
              onClick={onMenuToggle}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-all dark:text-white"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Star size={10} fill="currentColor" /> Upgrade
            </button>
         </div>
         
         <div className="flex flex-col items-center">
            <h1 className="serif text-lg md:text-xl text-black dark:text-white font-bold tracking-[0.2em]">TEOLA</h1>
            <p className="text-[7px] font-black uppercase text-neutral-400 tracking-[0.4em]">Strategic Stylist</p>
         </div>

         <div className="flex items-center justify-end">
            <button 
              onClick={onToggleTemporary}
              title="Temporary Chat"
              className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${isTemporaryChat ? 'bg-blue-600 text-white' : 'bg-neutral-50 dark:bg-white/5 text-neutral-400'}`}
            >
              <Ghost size={18} />
              <span className="text-[6px] font-black uppercase tracking-tighter">Temp</span>
            </button>
         </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-24 space-y-8 no-scrollbar pb-40" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse max-w-[85%]' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 dark:bg-[#121212] text-blue-500 border-neutral-100 dark:border-white/5'}`}>
                {msg.role === 'user' ? <User size={12} /> : <Zap size={12} fill="currentColor" />}
              </div>
              <div className="space-y-4 flex-1">
                <div className={`p-4 md:p-5 rounded-2xl md:rounded-[1.8rem] text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-neutral-100 dark:bg-white text-black dark:text-black rounded-tr-none font-medium' : 'bg-neutral-50 dark:bg-[#121212] text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-white/5 rounded-tl-none italic whitespace-pre-wrap'}`}>
                  {msg.content}
                </div>
                {msg.outfit && (
                  <OutfitCard 
                    outfit={msg.outfit} 
                    isGenerating={msg.isGeneratingImage} 
                    onSave={() => onSaveOutfit(msg.outfit!)} 
                    isSaved={!!savedOutfits.find(o => o.id === msg.outfit?.id)} 
                    onSendToPlanner={() => onSendToPlanner(msg.outfit!)} 
                    userProfile={userProfile} 
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-[#121212] rounded-full border border-neutral-100 dark:border-white/5 animate-pulse"><div className="w-1 h-1 bg-blue-500 rounded-full" /><div className="w-1 h-1 bg-blue-500 rounded-full delay-75" /><div className="w-1 h-1 bg-blue-500 rounded-full delay-150" /></div>}
      </div>

      {/* Redesigned Compact Prompt Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white dark:from-[#050505] via-white/80 dark:via-[#050505]/80 to-transparent pointer-events-none z-[300]">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col gap-2 p-1.5 bg-neutral-50 dark:bg-[#121212]/95 border border-neutral-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl transition-all focus-within:ring-4 focus-within:ring-blue-500/5"
          >
            <div className="flex items-end gap-2 px-2">
              <div className="flex items-center pb-2.5">
                 <QuickAddButton onFileSelect={onQuickUpload} variant="icon" />
              </div>
              
              <textarea 
                ref={textareaRef}
                rows={1}
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Describe your look or event..." 
                className="flex-1 bg-transparent text-black dark:text-white text-sm md:text-base outline-none py-3.5 px-2 resize-none no-scrollbar min-h-[44px] max-h-32 leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600" 
              />

              <div className="flex items-center gap-1.5 pb-1.5">
                <button 
                  type="button" 
                  onClick={onStartLive}
                  className="p-3 text-neutral-400 hover:text-blue-500 transition-all active:scale-90"
                >
                  <Mic size={20} />
                </button>
                <button 
                  type="submit" 
                  disabled={!input.trim()} 
                  className={`p-3 rounded-full transition-all shadow-xl active:scale-95 ${input.trim() ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-white/5 text-neutral-400'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>
          <p className="text-center mt-3 text-[7px] font-black uppercase tracking-[0.3em] text-neutral-400">Teola Studio Protocol v6.3 Secure</p>
        </div>
      </div>
    </div>
  );
};

const OutfitCard = ({ outfit, isGenerating, onSave, isSaved, onSendToPlanner, userProfile }: any) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunway = async () => {
    setIsProcessing(true);
    try {
      const url = await gemini.generateRunwayVideo(outfit.description);
      setVideoUrl(url);
    } catch (e) {} finally { setIsProcessing(false); }
  };

  return (
    <div className="bg-neutral-50 dark:bg-[#121212] rounded-[2rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-xl space-y-4 w-full max-w-[280px] animate-in zoom-in-95">
      <div className="aspect-[3/4] relative bg-neutral-200 dark:bg-neutral-900 group">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             <p className="text-[7px] font-black uppercase tracking-widest text-blue-500">Curating Textiles...</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
        ) : outfit.visualUrl ? (
          <img src={outfit.visualUrl} alt={outfit.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400"><Shirt size={48} /></div>
        )}
        
        {!isGenerating && !videoUrl && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleRunway} className="flex-1 py-2 bg-black/60 backdrop-blur text-white rounded-xl text-[7px] font-black uppercase tracking-widest border border-white/10 hover:bg-black/80">
              {isProcessing ? <RefreshCw className="animate-spin m-auto" size={12} /> : 'View Runway'}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <h4 className="serif text-lg font-bold text-black dark:text-white">{outfit.name}</h4>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic leading-relaxed line-clamp-2">"{outfit.description}"</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onSave} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border transition-all ${isSaved ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-transparent border-neutral-200 dark:border-white/10 text-neutral-400'}`}><Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} /></button>
          <button onClick={onSendToPlanner} className="flex-1 flex items-center justify-center py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl"><Calendar size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;