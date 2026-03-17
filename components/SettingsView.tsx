import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, Theme, ViewState } from '../types';
import { 
  LogOut, User, ChevronRight, Camera, 
  Bell, ShieldCheck, Globe, Info, CreditCard, 
  Lock, Trash2, HelpCircle, FileText, Shield,
  Database, Smartphone, Mail, Zap, ArrowLeft,
  Check, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  user: UserProfile | null;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  a11yMode?: boolean;
  onA11yToggle: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  onOpenDna: () => void;
  onOpenHelp: () => void;
  onOpenMaisonLink: () => void;
  wardrobeCount: number;
  outfitCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  initialSubView?: string;
  onReturn?: () => void;
  onMenuToggle?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const { 
    user, theme, onThemeChange, 
    onUpdateUser, onLogout, onNavigate, onOpenHelp, 
    onMenuToggle 
  } = props;
  
  const [subView, setSubView] = useState<'main' | 'edit-profile' | 'subscription'>('main');
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setTempProfile({ ...user });
  }, [user]);

  const updateSetting = (key: keyof UserProfile, value: any) => {
    if (!tempProfile || !user) return;
    const updated = { ...tempProfile, [key]: value };
    setTempProfile(updated);
    onUpdateUser(updated);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tempProfile) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...tempProfile, avatar: reader.result as string };
        setTempProfile(updated);
        onUpdateUser(updated);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!tempProfile || !user) return null;

  const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-10">
      <h3 className="px-6 mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">
        {title}
      </h3>
      <div className="border-y border-white/[0.04]">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ 
    label, 
    value, 
    icon: Icon, 
    onClick, 
    showChevron = true,
    destructive = false
  }: { 
    label: string, 
    value?: string | React.ReactNode, 
    icon?: any, 
    onClick?: () => void,
    showChevron?: boolean,
    destructive?: boolean
  }) => (
    <motion.button 
      whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center justify-between px-6 py-[18px] text-left transition-colors border-b border-white/[0.04] last:border-none hover:bg-white/[0.01] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-5 h-5 flex items-center justify-center ${destructive ? 'text-red-500/50' : 'text-white/30'}`}>
            <Icon size={18} strokeWidth={1.2} />
          </div>
        )}
        <span className={`text-[15px] font-normal tracking-tight ${destructive ? 'text-red-500/50' : 'text-white/80'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {value && (
          <span className="text-[14px] text-white/20 font-light">
            {value}
          </span>
        )}
        {showChevron && onClick && (
          <ChevronRight size={14} className="text-white/10" />
        )}
      </div>
    </motion.button>
  );

  const SettingToggle = ({ 
    label, 
    icon: Icon, 
    enabled, 
    onToggle 
  }: { 
    label: string, 
    icon?: any, 
    enabled: boolean, 
    onToggle: () => void 
  }) => (
    <div className="w-full flex items-center justify-between px-6 py-[18px] border-b border-white/[0.04] last:border-none">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-5 h-5 flex items-center justify-center text-white/30">
            <Icon size={18} strokeWidth={1.2} />
          </div>
        )}
        <span className="text-[15px] font-normal tracking-tight text-white/80">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-all duration-300 focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-white/10'}`}
      >
        <motion.span
          animate={{ 
            x: enabled ? 20 : 2,
            scale: enabled ? 0.85 : 0.75,
          }}
          className="inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );

  const renderMain = () => (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Profile Header */}
      <div className="flex flex-col items-center py-12 px-6">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.05] shadow-sm">
            {tempProfile.avatar ? (
              <img src={tempProfile.avatar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10">
                <User size={48} strokeWidth={1} />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-white/10 text-white/80 rounded-full border border-white/10 backdrop-blur-md active:scale-90 transition-transform"
          >
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>
        <h2 className="text-xl font-medium text-white mb-1">{tempProfile.name || 'Maison Member'}</h2>
        <p className="text-white/30 text-sm mb-6 font-light">{tempProfile.email}</p>
        <button 
          onClick={() => setSubView('edit-profile')}
          className="px-6 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-full text-[12px] font-medium text-white/80 transition-all"
        >
          Edit Profile
        </button>
      </div>

      {/* ACCOUNT */}
      <SettingSection title="Account">
        <SettingItem 
          label="Subscription" 
          value={tempProfile.subscription_tier || 'Free'} 
          icon={CreditCard}
          onClick={() => setSubView('subscription')}
        />
        <SettingItem label="Connected Accounts" icon={Smartphone} onClick={() => {}} />
        <SettingItem label="Metadata / Identity" icon={Zap} onClick={() => setSubView('edit-profile')} />
        <SettingItem label="Active Sessions" icon={Smartphone} onClick={() => {}} />
      </SettingSection>

      {/* PREFERENCES */}
      <SettingSection title="Preferences">
        <SettingToggle 
          label="Dark Mode" 
          icon={Zap} 
          enabled={theme === 'dark'} 
          onToggle={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} 
        />
        <SettingItem label="Language" value="English" icon={Globe} onClick={() => {}} />
        <SettingItem label="Region" value={tempProfile.location || 'Global'} icon={Globe} onClick={() => {}} />
      </SettingSection>

      {/* NOTIFICATIONS */}
      <SettingSection title="Notifications">
        <SettingToggle 
          label="Push Notifications" 
          icon={Bell} 
          enabled={!!tempProfile.is_notifications_enabled} 
          onToggle={() => updateSetting('is_notifications_enabled', !tempProfile.is_notifications_enabled)} 
        />
        <SettingToggle 
          label="Email Notifications" 
          icon={Mail} 
          enabled={!!tempProfile.notify_email} 
          onToggle={() => updateSetting('notify_email', !tempProfile.notify_email)} 
        />
        <SettingToggle 
          label="Sync Alerts" 
          icon={Zap} 
          enabled={!!tempProfile.notify_alerts} 
          onToggle={() => updateSetting('notify_alerts', !tempProfile.notify_alerts)} 
        />
      </SettingSection>

      {/* PRIVACY & SECURITY */}
      <SettingSection title="Privacy & Security">
        <SettingItem label="Change Password" icon={Lock} onClick={() => {}} />
        <SettingToggle 
          label="Two-Factor Authentication" 
          icon={ShieldCheck} 
          enabled={false} 
          onToggle={() => {}} 
        />
        <SettingItem label="Data & Permissions" icon={Shield} onClick={() => {}} />
      </SettingSection>

      {/* DATA & STORAGE */}
      <SettingSection title="Data & Storage">
        <SettingItem label="Clear Cache" icon={Trash2} onClick={() => {}} />
        <SettingItem label="Storage Usage" value="124 MB" icon={Database} onClick={() => {}} />
        <SettingToggle 
          label="Backup & Sync" 
          icon={Zap} 
          enabled={!!tempProfile.auto_sync_outfits} 
          onToggle={() => updateSetting('auto_sync_outfits', !tempProfile.auto_sync_outfits)} 
        />
      </SettingSection>

      {/* SUPPORT */}
      <SettingSection title="Support">
        <SettingItem label="Help Center" icon={HelpCircle} onClick={onOpenHelp} />
        <SettingItem label="Contact Support" icon={Mail} onClick={() => {}} />
        <SettingItem label="Report a Bug" icon={Info} onClick={() => {}} />
        <SettingItem label="Terms of Service" icon={FileText} onClick={() => onNavigate('terms')} />
        <SettingItem label="Privacy Policy" icon={Shield} onClick={() => onNavigate('privacy')} />
      </SettingSection>

      {/* ABOUT */}
      <SettingSection title="About">
        <SettingItem label="Teola v6.3" showChevron={false} />
        <SettingItem label="Maison Member" showChevron={false} />
      </SettingSection>

      <div className="mt-12 px-6 pb-12">
        <button 
          onClick={onLogout}
          className="w-full py-4 text-red-500/40 hover:text-red-500/70 font-medium text-[16px] transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10 px-6">
        <button onClick={() => setSubView('main')} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-medium text-white">Edit Profile</h2>
      </div>

      <div className="space-y-8 px-6">
        {['name', 'username', 'nationality', 'location'].map((k) => (
          <div key={k} className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 ml-1">
              {k}
            </label>
            <input 
              type="text" 
              value={(tempProfile as any)[k] || ''} 
              onChange={(e) => updateSetting(k as any, e.target.value)} 
              className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[15px] text-white outline-none focus:border-white/20 transition-all" 
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10 px-6">
        <button onClick={() => setSubView('main')} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-medium text-white">Subscription</h2>
      </div>

      <div className="space-y-4 px-6 pb-32">
        {[
          { id: 'Free', price: '$0', features: ['Upload 20 clothes', '1-week planner', 'Wardrobe-only mode'], color: 'blue' },
          { id: 'Premium', price: '$4.99', features: ['Unlimited clothes', 'Full planner', 'Market mode'], color: 'blue', popular: true },
          { id: 'Pro', price: '$9.99', features: ['All Premium', 'Insights', 'Packing Lists'], color: 'amber' }
        ].map(plan => (
          <div 
            key={plan.id}
            className={`p-6 rounded-2xl border transition-all duration-300 ${tempProfile.subscription_tier === plan.id ? 'bg-white/[0.04] border-white/20 shadow-lg' : 'bg-white/[0.02] border-white/[0.05]'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-widest ${plan.color === 'amber' ? 'text-amber-500/80' : 'text-blue-400/80'}`}>
                  {plan.id} {plan.id === 'Pro' ? 'Elite' : 'Tier'}
                </h3>
                <p className="text-2xl font-medium text-white mt-1">
                  {plan.price} <span className="text-sm font-light text-white/30">/mo</span>
                </p>
              </div>
              {plan.popular && (
                <span className="px-3 py-1 bg-white/10 text-white/80 text-[10px] font-medium uppercase tracking-wider rounded-full">Popular</span>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-[14px] text-white/50">
                  <Check size={14} className="text-blue-500/60" /> {f}
                </li>
              ))}
            </ul>
            {tempProfile.subscription_tier !== plan.id && (
              <button 
                onClick={() => updateSetting('subscription_tier', plan.id as any)}
                className={`w-full py-3.5 rounded-xl text-[13px] font-medium uppercase tracking-widest transition-all ${plan.id === 'Pro' ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {plan.id === 'Free' ? 'Downgrade' : 'Upgrade'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#0A0A0A] transition-colors duration-500">
      <div className="pt-6 md:pt-12">
        <div className="flex items-center justify-between px-6 mb-8 md:hidden">
          <button onClick={onMenuToggle} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-medium text-white">Settings</h1>
          <div className="w-10" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={subView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {subView === 'main' && renderMain()}
            {subView === 'edit-profile' && renderEditProfile()}
            {subView === 'subscription' && renderSubscription()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsView;
