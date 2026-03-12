
import React, { useState, useEffect } from 'react';
import { Message, ClothingItem, ViewState, Outfit, Theme, UserProfile, WARDROBE_LIMIT_FREE, Toast, RotationSession } from './types';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { analytics } from './services/analyticsService';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import TrendFeedView from './components/TrendFeedView';
import WardrobeView from './components/WardrobeView';
import SavedOutfitsView from './components/SavedOutfitsView';
import SettingsView from './components/SettingsView';
import StyleDnaView from './components/StyleDnaView';
import HelpCentreView from './components/HelpCentreView';
import WeeklyPlanView from './components/WeeklyPlanView';
import AnalyticsView from './components/AnalyticsView';
import AuthView from './components/AuthView';
import OnboardingView from './components/OnboardingView';
import MaisonLinkView from './components/MaisonLinkView';
import RotationDetailView from './components/RotationDetailView';
import ClothingEditorModal from './components/ClothingEditorModal';
import LiveStylist from './components/LiveStylist';
import { MessageSquare, Settings as SettingsIcon, Calendar, Shirt, PlayCircle, BarChart3, Bookmark, MoreHorizontal, X, LayoutGrid, Fingerprint, HelpCircle, Menu, Zap } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  isArchived?: boolean;
}

const GREETINGS = [
  "Welcome to the Maison. I’m Teola — your strategic stylist.",
  "The atelier is open. I’m Teola. How shall we architect your presence today?"
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [previousView, setPreviousView] = useState<ViewState | null>(null);
  const [settingsSubView, setSettingsSubView] = useState<string>('main');
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [rotations, setRotations] = useState<RotationSession[]>([]);
  const [activeRotationId, setActiveRotationId] = useState<string | null>(null);
  
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  
  const [theme, setTheme] = useState<Theme>('dark'); 
  const [a11yMode, setA11yMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('a11y-mode', a11yMode);
  }, [theme, a11yMode]);

  useEffect(() => {
    if (isDemoMode) {
      const demoUser: UserProfile = {
        id: 'demo-user',
        name: 'Demo Stylist',
        username: 'demo',
        email: 'demo@maison.teola',
        subscription_tier: 'Pro',
        style_preferences: ['Minimalist', 'Strategic'],
        gender: 'Neutral',
      };
      setUser(demoUser);
      loadWardrobe();
      loadOutfits();
      loadChats('demo-user');
      return;
    }
  }, [isDemoMode]);

  const [isRetryingProfile, setIsRetryingProfile] = useState(false);

  const fetchProfile = async (session: any) => {
    if (!session?.user) return;
    
    // Use a regular query to avoid PGRST116 error entirely
    const profilePromise = supabase.from('profiles').select('*').eq('id', session.user.id);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 20000)
    );
    
    try {
      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (result && 'error' in result && result.error) {
        throw result.error;
      }

      const profile = result?.data && result.data.length > 0 ? result.data[0] : null;

      if (profile) {
        const tierProfile = { ...profile, subscriptionTier: profile.subscriptionTier || 'Free' };
        setUser(tierProfile);
        analytics.setUser(profile.id, tierProfile.subscriptionTier !== 'Free');
        setCurrentView(prev => (prev === 'auth' || prev === 'onboarding') ? 'chat' : prev);
        loadWardrobe();
        loadOutfits();
        loadChats(session.user.id);
        loadRotations();
      } else {
        console.log("No profile found, redirecting to onboarding");
        setCurrentView('onboarding');
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      const isTimeout = err.message === 'Profile fetch timeout';
      addToast(
        isTimeout 
          ? "Connection timed out. Please check if your Supabase project is active/resumed." 
          : `Database error: ${err.message || 'Unknown error'}`, 
        "error"
      );
      setCurrentView('auth');
    } finally {
      setIsRetryingProfile(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfile(session);
      } else {
        setCurrentView('auth');
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        fetchProfile(session);
      } else {
        setUser(null);
        setCurrentView('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadWardrobe = async () => {
    if (isDemoMode) {
      const stored = localStorage.getItem('teola_wardrobe');
      if (stored) setWardrobe(JSON.parse(stored));
      return;
    }
    const { data } = await supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false });
    if (data) setWardrobe(data);
  };

  const loadOutfits = async () => {
    if (isDemoMode) {
      const stored = localStorage.getItem('teola_outfits');
      if (stored) setSavedOutfits(JSON.parse(stored));
      return;
    }
    const { data } = await supabase.from('saved_outfits').select('*').order('saved_at', { ascending: false });
    if (data) setSavedOutfits(data);
  };

  const loadRotations = async () => {
    const { data } = await supabase.from('rotation_sessions').select('*').order('created_at', { ascending: false });
    if (data) setRotations(data);
  };

  const loadChats = async (userId?: string) => {
    if (isDemoMode) {
      const stored = localStorage.getItem('teola_chats');
      if (stored) {
        const data = JSON.parse(stored);
        setChats(data);
        if (data.length > 0) setActiveChatId(data[0].id);
      } else {
        createNewChat(userId);
      }
      return;
    }
    const { data } = await supabase.from('chats').select('*').order('updated_at', { ascending: false });
    if (data && data.length > 0) {
      setChats(data);
      setActiveChatId(data[0].id);
    } else {
      createNewChat(userId);
    }
  };

  const createNewChat = async (userId?: string) => {
    const newChat = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Session',
      messages: [{ role: 'assistant', content: GREETINGS[Math.floor(Math.random() * GREETINGS.length)] }],
      user_id: userId || user?.id,
      updated_at: new Date().toISOString()
    };
    
    if (isDemoMode) {
      setChats(prev => {
        const next = [newChat, ...prev];
        localStorage.setItem('teola_chats', JSON.stringify(next));
        return next;
      });
      setActiveChatId(newChat.id);
      setIsSidebarOpen(false);
      setCurrentView('chat');
      setIsTemporaryChat(false);
      return;
    }

    const { data, error } = await supabase.from('chats').insert([newChat]).select();
    
    if (data && data.length > 0) {
      const chatData = data[0];
      setChats(prev => [chatData, ...prev]);
      setActiveChatId(chatData.id);
      setIsSidebarOpen(false);
      setCurrentView('chat');
      setIsTemporaryChat(false);
    }
  };

  const deleteChat = async (id: string) => {
    const { error } = await supabase.from('chats').delete().eq('id', id);
    if (!error) {
      const updated = chats.filter(c => c.id !== id);
      setChats(updated);
      if (activeChatId === id) {
        if (updated.length > 0) setActiveChatId(updated[0].id);
        else createNewChat();
      }
    }
  };

  const renameChat = async (id: string, newTitle: string) => {
    const { error } = await supabase.from('chats').update({ title: newTitle }).eq('id', id);
    if (!error) {
      setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    }
  };

  const archiveChat = async (id: string) => {
    const { error } = await supabase.from('chats').update({ is_archived: true }).eq('id', id);
    if (!error) {
      setChats(prev => prev.map(c => c.id === id ? { ...c, isArchived: true } : c));
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleSendMessage = async (text: string, mode: 'wardrobe' | 'market' = 'wardrobe', context?: any) => {
    const userMsg: Message = { role: 'user', content: text, mode };
    const updatedMessages = [...(activeChat?.messages || []), userMsg];
    
    if (!isTemporaryChat) {
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: updatedMessages } : c));
    } else {
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: updatedMessages } : c));
    }
    
    setIsTyping(true);

    try {
      const response = await gemini.getStylingAdvice(activeChat?.messages || [], wardrobe, text, user, mode, context);
      const assistantMsg: Message = { role: 'assistant', content: response.text || "Architecting your look...", mode, grounding: response.grounding };
      
      let finalMessages = [...updatedMessages, assistantMsg];

      let newTitle = activeChat?.title;
      if (activeChat?.messages.length <= 2 && !isTemporaryChat) {
         try {
            const titleRes = await gemini.getStylingAdvice([], [], `Generate a 3-word stylish title for this chat: "${text}"`, null);
            newTitle = titleRes.text.replace(/"/g, '').trim();
         } catch(e) {}
      }

      setChats(prev => {
        const next = prev.map(c => c.id === activeChatId ? { ...c, messages: finalMessages, title: newTitle, updated_at: new Date().toISOString() } : c);
        if (isDemoMode) {
          localStorage.setItem('teola_chats', JSON.stringify(next));
        } else if (!isTemporaryChat) {
          supabase.from('chats').update({ messages: finalMessages, title: newTitle, updated_at: new Date().toISOString() }).eq('id', activeChatId);
        }
        return next;
      });

      if (mode === 'wardrobe' && response.outfits?.[0]) {
        const outfitWithId = { id: Math.random().toString(36).substr(2, 9), ...response.outfits[0], saved_at: new Date().toISOString() };
        const visualUrl = await gemini.generateOutfitVisual(outfitWithId.description, user);
        
        setChats(prev => {
          const next = prev.map(c => c.id === activeChatId ? { 
            ...c, 
            messages: c.messages.map(m => m.content === assistantMsg.content ? { ...m, outfit: { ...outfitWithId, visualUrl: visualUrl || undefined } } : m)
          } : c);
          if (isDemoMode) {
            localStorage.setItem('teola_chats', JSON.stringify(next));
          } else if (!isTemporaryChat) {
              const updatedMessages = next.find(c => c.id === activeChatId)?.messages;
              if (updatedMessages) {
                supabase.from('chats').update({ messages: updatedMessages, updated_at: new Date().toISOString() }).eq('id', activeChatId);
              }
          }
          return next;
        });
      }
    } catch (error) { addToast("Connection interrupted.", "error"); } finally { setIsTyping(false); }
  };

  const handleQuickUpload = async (file: File) => {
    if (!file) return;
    if (user?.subscriptionTier === 'Free' && wardrobe.length >= WARDROBE_LIMIT_FREE) {
      handleUpgradeNavigation();
      addToast("Wardrobe limit reached (20). Upgrade to archive more.", "error");
      return;
    }
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const analysis = await gemini.analyzeClothingImage(base64);
        setEditingItem({ id: Math.random().toString(36).substr(2, 9), image: base64, category: analysis.category || 'Tops', color: analysis.color || 'Unspecified', tags: analysis.type ? [analysis.type] : [], usageCategories: analysis.styleTags || ['Casual'], createdAt: Date.now(), wearCount: 0, brand: analysis.brand });
      } catch (e) {
        setEditingItem({ id: Math.random().toString(36).substr(2, 9), image: base64, category: 'Tops', color: '', tags: [], usageCategories: ['Casual'], createdAt: Date.now(), wearCount: 0 });
      } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (item: ClothingItem) => {
    if (isDemoMode) {
      setWardrobe(prev => {
        const next = [item, ...prev];
        localStorage.setItem('teola_wardrobe', JSON.stringify(next));
        return next;
      });
      setEditingItem(null);
      addToast("Archived to Maison closet.", "success");
      return;
    }
    const { data } = await supabase.from('wardrobe_items').insert([item]).select();
    if (data && data.length > 0) { setWardrobe(prev => [data[0], ...prev]); setEditingItem(null); addToast("Archived to Maison closet.", "success"); }
  };

  const handleSaveOutfit = async (outfit: Outfit) => {
    if (isDemoMode) {
      setSavedOutfits(prev => {
        const next = [outfit, ...prev];
        localStorage.setItem('teola_outfits', JSON.stringify(next));
        return next;
      });
      addToast("Outfit saved to your vault.", "success");
      return;
    }
    const { data } = await supabase.from('saved_outfits').insert([outfit]).select();
    if (data && data.length > 0) {
      setSavedOutfits(prev => [data[0], ...prev]);
      addToast("Outfit saved to your vault.", "success");
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    const { error } = await supabase.from('profiles').update(updated).eq('id', updated.id);
    if (!error) { setUser(updated); }
  };

  const handleUpgradeNavigation = () => {
    setPreviousView(currentView);
    setCurrentView('settings');
    setSettingsSubView('subscription');
    setIsSidebarOpen(false);
  };

  const handleReturnFromSettings = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else {
      setSettingsSubView('main');
    }
  };

  const handleSaveRotation = async (rotation: RotationSession) => {
    const { data, error } = await supabase.from('rotation_sessions').upsert([{ ...rotation, user_id: user?.id }]).select();
    if (data && data.length > 0) {
      const rotationData = data[0];
      const next = [rotationData, ...rotations.filter(r => r.id !== rotationData.id)];
      setRotations(next);
      addToast("Rotation deployed successfully.", "success");
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat': return <ChatView a11yMode={a11yMode} messages={activeChat?.messages || []} onSendMessage={handleSendMessage} onRefineOutfit={() => {}} isTyping={isTyping} wardrobe={wardrobe} onSaveOutfit={handleSaveOutfit} savedOutfits={savedOutfits} onAddSuggestedItem={async () => ({} as any)} onSendToPlanner={(o) => { setCurrentView('planner'); }} onQuickUpload={handleQuickUpload} onOutfitFeedback={() => {}} userProfile={user} onUpdateUserProfile={handleUpdateUser} onUpgrade={handleUpgradeNavigation} onStartLive={() => setIsLiveActive(true)} onMenuToggle={() => setIsSidebarOpen(true)} onNavigateToWardrobe={() => setCurrentView('wardrobe')} isTemporaryChat={isTemporaryChat} onToggleTemporary={() => setIsTemporaryChat(!isTemporaryChat)} />;
      case 'runway': return <TrendFeedView user={user} wardrobe={wardrobe} onSeedStyling={(t) => { handleSendMessage(`Style me based on '${t}' vibe using my archive.`); setCurrentView('chat'); }} onUpgrade={handleUpgradeNavigation} onMenuToggle={() => setIsSidebarOpen(true)} onNavigateToWardrobe={() => setCurrentView('wardrobe')} />;
      case 'wardrobe': return <WardrobeView items={wardrobe} subscriptionTier={user?.subscriptionTier || 'Free'} onAdd={handleSaveItem} onUpdate={() => {}} onBulkUpdate={() => {}} onBulkRemove={() => {}} onRemove={() => {}} onToggleStar={() => {}} onStyleItems={() => {}} onQuickUpload={handleQuickUpload} onBulkTextImport={() => {}} onUpgrade={handleUpgradeNavigation} userProfile={user} onSendMessage={handleSendMessage} onStartLive={() => setIsLiveActive(true)} onMenuToggle={() => setIsSidebarOpen(true)} onNavigateToChat={() => setCurrentView('chat')} savedOutfits={savedOutfits} onSaveOutfit={handleSaveOutfit} />;
      case 'outfits': return <SavedOutfitsView outfits={savedOutfits} wardrobe={wardrobe} onRemove={() => {}} onBack={() => setCurrentView('chat')} />;
      case 'analytics': return <AnalyticsView wardrobe={wardrobe} user={user} onUpgrade={handleUpgradeNavigation} onSeedStyling={(t) => { handleSendMessage(`Style me based on '${t}' vibe using my archive.`); setCurrentView('chat'); }} onMenuToggle={() => setIsSidebarOpen(true)} onBack={() => setCurrentView('chat')} />;
      case 'settings': return <SettingsView user={user} theme={theme} onThemeChange={setTheme} a11yMode={a11yMode} onA11yToggle={() => setA11yMode(!a11yMode)} onUpdateUser={handleUpdateUser} onLogout={() => supabase.auth.signOut()} onNavigate={(v) => { setPreviousView(null); setCurrentView(v); }} onOpenDna={() => { setPreviousView(null); setCurrentView('style-dna'); }} onOpenHelp={() => { setPreviousView(null); setCurrentView('help-centre'); }} onOpenMaisonLink={() => { setPreviousView(null); setCurrentView('maison-link'); }} wardrobeCount={wardrobe.length} outfitCount={savedOutfits.length} isSyncing={false} onTriggerSync={() => {}} initialSubView={settingsSubView as any} onReturn={handleReturnFromSettings} onMenuToggle={() => setIsSidebarOpen(true)} />;
      case 'style-dna': return <StyleDnaView user={user} wardrobe={wardrobe} onUpdateUser={handleUpdateUser} onBack={() => setCurrentView('settings')} />;
      case 'help-centre': return <HelpCentreView onBack={() => setCurrentView('settings')} />;
      case 'maison-link': return <MaisonLinkView userId={user?.id || ''} onBack={() => setCurrentView('settings')} onSuccess={() => { addToast("Data synchronized successfully.", "success"); setCurrentView('chat'); }} />;
      case 'planner': return <WeeklyPlanView user={user} wardrobe={wardrobe} onSaveOutfit={handleSaveOutfit} onQuickUpload={handleQuickUpload} onUpdateUser={handleUpdateUser} onUpgrade={handleUpgradeNavigation} onMenuToggle={() => setIsSidebarOpen(true)} onNavigateToWardrobe={() => setCurrentView('wardrobe')} savedRotations={rotations} onSaveRotation={handleSaveRotation} onOpenRotation={(id) => { setActiveRotationId(id); setCurrentView('rotation-detail'); }} />;
      case 'rotation-detail': {
        const activeRotation = rotations.find(r => r.id === activeRotationId);
        return activeRotation ? <RotationDetailView rotation={activeRotation} wardrobe={wardrobe} onUpdateRotation={handleSaveRotation} onBack={() => setCurrentView('planner')} /> : null;
      }
      case 'onboarding': return <OnboardingView onComplete={async (u, g, n, l, s) => { 
        try {
          if (isDemoMode) {
            const profile: UserProfile = { ...user!, username: u, gender: g, nationality: n, location: l, state_or_city: s };
            setUser(profile);
            setCurrentView('chat');
            addToast("Welcome to the Maison!", "success");
            return;
          }
          const { data: { user: authUser } } = await supabase.auth.getUser(); 
          if (!authUser) throw new Error("No authenticated user found");

          const profile: UserProfile = { 
            id: authUser.id, 
            name: 'Maison Member', 
            username: u, 
            gender: g, 
            nationality: n, 
            location: l, 
            state_or_city: s, 
            email: authUser.email || '', 
            style_preferences: ['Minimalist'], 
            subscription_tier: 'Free' 
          }; 
          
          const { error } = await supabase.from('profiles').insert([profile]); 
          if (error) throw error;

          setUser(profile); 
          setCurrentView('chat'); 
          addToast("Welcome to the Maison!", "success");
        } catch (err: any) {
          addToast(err.message || "Failed to create profile", "error");
        }
      }} />;
      case 'auth': return <AuthView onNavigate={setCurrentView} onDemoMode={() => setIsDemoMode(true)} onRetry={() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) fetchProfile(session);
        });
      }} />;
      default: return null;
    }
  };

  const isAuthView = ['auth', 'onboarding'].includes(currentView);

  return (
    <div className={`flex h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden ${a11yMode ? 'a11y-mode' : ''}`}>
      {!isAuthView && (
        <Sidebar 
          currentView={currentView} 
          setView={(v) => { setPreviousView(null); setCurrentView(v); setIsSidebarOpen(false); }} 
          onThemeChange={setTheme} 
          theme={theme}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={(id) => { setActiveChatId(id); setCurrentView('chat'); setIsSidebarOpen(false); }}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onArchiveChat={archiveChat}
        />
      )}
      
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {renderView()}
      </main>

      {editingItem && <ClothingEditorModal item={editingItem} isAnalyzing={isAnalyzing} onUpdate={setEditingItem} onSave={handleSaveItem} onCancel={() => setEditingItem(null)} />}
      {isLiveActive && <LiveStylist userProfile={user} onClose={() => setIsLiveActive(false)} />}
      
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4 duration-500 flex items-center gap-3 ${t.type === 'error' ? 'bg-red-500 text-white' : t.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
             {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
