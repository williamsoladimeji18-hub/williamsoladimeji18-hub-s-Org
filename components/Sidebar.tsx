import React, { useState } from 'react';
import { ViewState, Theme, Message } from '../types';
import TeolaLogo from './TeolaLogo';
import { 
  Settings as SettingsIcon, Moon, Sun, Monitor, Calendar, 
  Shirt, BarChart3, Bookmark, LucideIcon, PlayCircle, Sparkles, Fingerprint, HelpCircle,
  Plus, MessageSquare, Trash2, Edit2, Archive, X, ChevronRight, Zap, LayoutGrid
} from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  isArchived?: boolean;
}

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState, source?: string) => void;
  onThemeChange: (theme: Theme) => void;
  theme: Theme;
  isOpen?: boolean;
  onClose?: () => void;
  chats?: ChatHistory[];
  activeChatId?: string | null;
  onChatSelect?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteChat?: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onArchiveChat?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, onThemeChange, theme, isOpen, onClose,
  chats = [], activeChatId, onChatSelect, onNewChat, onDeleteChat, onRenameChat, onArchiveChat
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const coreNavItems = [
    { id: 'chat' as ViewState, icon: MessageSquare, label: 'Stylist' },
    { id: 'runway' as ViewState, icon: PlayCircle, label: 'Runway' },
    { id: 'wardrobe' as ViewState, icon: Shirt, label: 'Closet' },
    { id: 'planner' as ViewState, icon: Calendar, label: 'Planner' },
  ];

  const insightNavItems = [
    { id: 'outfits' as ViewState, icon: Bookmark, label: 'Vault' },
    { id: 'analytics' as ViewState, icon: BarChart3, label: 'Insights' },
    { id: 'style-dna' as ViewState, icon: Fingerprint, label: 'Style DNA' },
  ];

  const handleEditStart = (chat: ChatHistory) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = (id: string) => {
    if (onRenameChat) onRenameChat(id, editTitle);
    setEditingId(null);
  };

  const SidebarContent = (
    <div className="h-full flex flex-col p-6 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 relative transition-colors duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <TeolaLogo className="w-8 h-8 text-black dark:text-white" />
          </div>
          <div>
            <h1 className="serif text-lg font-bold tracking-tight dark:text-white leading-tight">Teola</h1>
            <p className="text-[7px] uppercase tracking-[0.3em] text-neutral-400 font-black">Maison Atelier</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full dark:text-white">
          <X size={20} />
        </button>
      </div>

      <button 
        onClick={onNewChat}
        className="w-full mb-8 flex items-center justify-center gap-3 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Plus size={16} /> New Session
      </button>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
        {/* Chat History Section */}
        <div className="space-y-3">
          <p className="px-2 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-400">Past Exchanges</p>
          <div className="space-y-1">
            {chats.filter(c => !c.isArchived).map(chat => (
              <div key={chat.id} className="group relative">
                {editingId === chat.id ? (
                  <div className="flex items-center gap-2 p-2">
                    <input 
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(chat.id)}
                      onKeyDown={e => e.key === 'Enter' && handleEditSave(chat.id)}
                      className="flex-1 bg-neutral-50 dark:bg-neutral-800 border-none outline-none text-[10px] font-bold p-1 rounded dark:text-white"
                    />
                  </div>
                ) : (
                  <div 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeChatId === chat.id && currentView === 'chat' ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <button 
                      onClick={() => onChatSelect?.(chat.id)}
                      className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                    >
                      <MessageSquare size={14} className={activeChatId === chat.id && currentView === 'chat' ? 'text-blue-500' : 'text-neutral-400'} />
                      <span className="text-[10px] font-bold truncate uppercase tracking-wider">{chat.title}</span>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEditStart(chat); }} className="p-1 hover:text-blue-500"><Edit2 size={10} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat?.(chat.id); }} className="p-1 hover:text-red-500"><Trash2 size={10} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core Navigation Section */}
        <div className="space-y-1 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <p className="px-2 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-400">Atelier Core</p>
          {coreNavItems.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all ${currentView === item.id ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
              <item.icon size={16} />
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Insights & Archival */}
        <div className="space-y-1 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <p className="px-2 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-400">Intelligence</p>
          {insightNavItems.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all ${currentView === item.id ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
              <item.icon size={16} />
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
               <Zap size={14} fill="currentColor" />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-neutral-400">Secure Identity Link</span>
         </div>
         <button onClick={() => setView('settings')} className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors active:scale-90">
            <SettingsIcon size={18} />
         </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 h-full">
        {SidebarContent}
      </aside>
      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-[600] pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={onClose}
        />
        <div className={`absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {SidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;