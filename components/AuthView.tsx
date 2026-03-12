import React, { useState, useEffect } from 'react';
import TeolaLogo from './TeolaLogo';
import { Mail, Apple, Chrome, ArrowRight, Loader2, KeyRound, UserPlus, Lock, Eye, EyeOff, Phone, Check, ShieldCheck, Zap, ArrowLeft, XCircle, CheckCircle, Smartphone, Globe, AlertTriangle, RefreshCw, Shield, Info } from 'lucide-react';

import { supabase } from '../services/supabaseClient';

interface AuthViewProps {
  onNavigate: (view: 'terms' | 'privacy') => void;
  onDemoMode: () => void;
  onRetry?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onDemoMode, onRetry }) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasActiveSession(!!session);
    });
  }, []);

  const handleRetry = () => {
    setIsConnecting('profile');
    setConnectionStatus('Retrying profile connection...');
    onRetry?.();
  };
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  const runDiagnostic = async () => {
    const url = (import.meta as any).env.VITE_SUPABASE_URL;
    if (!url) {
      setDiagnosticInfo("Error: VITE_SUPABASE_URL is missing.");
      return;
    }

    try {
      const start = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: { 'apikey': (import.meta as any).env.VITE_SUPABASE_ANON_KEY },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      
      if (response.ok || response.status === 401) {
        setDiagnosticInfo(`Success: Supabase reached in ${duration}ms. (Status: ${response.status})`);
      } else {
        setDiagnosticInfo(`Error: Received status ${response.status} from Supabase.`);
      }
    } catch (e: any) {
      setDiagnosticInfo(`Error: Could not reach Supabase. ${e.message}`);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnecting) {
      setLoadingTimeout(false);
      setDiagnosticInfo(null);
      timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000); // 15 seconds timeout
    }
    return () => clearTimeout(timer);
  }, [isConnecting]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{ provider: string; message: string } | null>(null);
  const [consentProvider, setConsentProvider] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showManual, setShowManual] = useState<'email' | 'phone' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Assistant Logic
  const [showAssistantMsg, setShowAssistantMsg] = useState(false);

  const isSupabaseConfigured = !!supabase.auth; // Simple check if client was initialized with real values
  // Actually, supabaseClient.ts initializes it with placeholders if missing.
  // Better to check the env variables directly or a flag.
  const isMissingConfig = !(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    const timer = setTimeout(() => setShowAssistantMsg(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleProviderClick = (provider: string) => {
    setAuthError(null);
    setConsentProvider(provider);
  };

  const confirmConsentAndAuthorize = async () => {
    if (!consentProvider) return;
    
    const provider = consentProvider;
    setConsentProvider(null);
    setIsConnecting(provider);
    setConnectionStatus(`Connecting to ${provider}...`);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase() as any,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setIsConnecting(null);
      let message = error.message;
      if (message.includes('provider is not enabled')) {
        message = `The ${provider} login provider is not enabled in your Supabase project. Please go to your Supabase Dashboard > Authentication > Providers and enable ${provider}.`;
      }
      setAuthError({ provider, message });
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!identifier) {
      setError(`Please enter your ${showManual === 'email' ? 'email' : 'phone number'}.`);
      return;
    }

    const actionName = authMode === 'login' ? 'Logging you in...' : 'Creating your account...';
    setIsConnecting(actionName);
    setConnectionStatus('Setting up your session...');
    
    let result;
    if (authMode === 'signup') {
      result = await supabase.auth.signUp({
        email: identifier,
        password: password,
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });
    }

    if (result.error) {
      setIsConnecting(null);
      let message = result.error.message;
      if (message.includes('provider is not enabled')) {
        message = "Email login is not enabled in your Supabase project. Please go to your Supabase Dashboard > Authentication > Providers and enable 'Email'.";
      }
      setError(message);
    } else {
      setSuccessMsg(authMode === 'signup' ? 'Account created! Please check your email for verification.' : 'Success! You are now logged in.');
      // The onAuthStateChange in App.tsx will handle the rest
    }
  };

  const providers = [
    { name: 'Google', icon: Chrome, color: 'hover:border-blue-500/50 hover:bg-blue-50/5' },
    { name: 'Apple', icon: Apple, color: 'hover:border-neutral-500/50 hover:bg-neutral-500/5' },
    { name: 'Microsoft', icon: Smartphone, color: 'hover:border-blue-400/50 hover:bg-blue-400/5' },
  ];

  const handleCancelConnection = () => {
    setIsConnecting(null);
    setConnectionStatus('');
    setConsentProvider(null);
  };

  const switchToManual = () => {
    setAuthError(null);
    setConsentProvider(null);
    setShowManual('email');
    setAuthMode('login');
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-950 px-6 py-12 overflow-y-auto no-scrollbar">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-100 dark:bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-100 dark:bg-purple-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center space-y-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 my-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl ring-1 ring-black/5">
             <TeolaLogo className="w-12 h-12 md:w-16 md:h-16 text-black dark:text-white" />
          </div>
          <div className="space-y-1 text-center">
            <h1 className="serif text-4xl md:text-5xl font-bold tracking-tight dark:text-white">Teola</h1>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-400">Account Assistant</p>
          </div>
        </div>

        {/* AI Assistant Message Bubble - Initial State */}
        {showAssistantMsg && !showManual && !isConnecting && !successMsg && !authError && !consentProvider && (
          <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 p-6 rounded-[2rem] rounded-tl-none animate-in fade-in slide-in-from-left-4 duration-700 relative shadow-sm">
             <div className="absolute -top-3 -left-3 p-2 bg-blue-600 text-white rounded-full shadow-lg">
                <Zap size={14} fill="currentColor" />
             </div>
             <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium italic">
               Welcome! I am Teola’s assistant. I can help you set up your account.
               <br /><br />
               You can use your email and password, or use a social login.
               Social login is <span className="font-bold">fast, safe, and secure</span>. 
               <br /><br />
               How would you like to start?
             </p>
          </div>
        )}

        {/* Security & Permission AI Message */}
        {consentProvider && (
          <div className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 p-6 rounded-[2rem] rounded-tl-none animate-in fade-in slide-in-from-left-4 duration-500 relative shadow-sm">
             <div className="absolute -top-3 -left-3 p-2 bg-emerald-600 text-white rounded-full shadow-lg">
                <Shield size={14} fill="currentColor" />
             </div>
             <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-bold italic">
               We only use your name and email to create your account. Your data is safe.
             </p>
          </div>
        )}

        <div className="w-full space-y-6">
          {isMissingConfig && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Configuration Required</p>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Supabase keys are missing. Please set <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in the Settings menu.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onDemoMode}
                className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Zap size={14} className="text-amber-500" /> Continue in Demo Mode
              </button>
            </div>
          )}

          {successMsg ? (
            <div className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-500 text-center space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                  <TeolaLogo className="w-32 h-32" />
               </div>
               <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-500/20">
                  <CheckCircle size={28} />
               </div>
               <div className="space-y-4">
                  <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed font-bold italic">
                    {successMsg}
                  </p>
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <Loader2 className="animate-spin text-emerald-500" size={16} />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Loading Atelier...</span>
                  </div>
               </div>
            </div>
          ) : isConnecting ? (
            <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-12 rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500 shadow-xl">
               <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500/30 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" strokeWidth={2} />
                  </div>
               </div>
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse">
                    {loadingTimeout ? 'Connection taking longer than usual...' : connectionStatus}
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                    {loadingTimeout ? 'Check your internet or Supabase status' : 'Secure Protocol Active'}
                  </p>
                  {diagnosticInfo && (
                    <p className={`text-[8px] font-medium px-4 py-1 rounded-full ${diagnosticInfo.startsWith('Success') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {diagnosticInfo}
                    </p>
                  )}
               </div>
               
               <div className="flex flex-col gap-3 w-full">
                 {loadingTimeout && !diagnosticInfo && (
                   <button 
                    onClick={runDiagnostic}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                   >
                      <RefreshCw size={14} /> Run Connection Diagnostic
                   </button>
                 )}

                 <button 
                  onClick={handleCancelConnection}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-neutral-400 hover:text-red-500 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest"
                 >
                    <XCircle size={14} /> {loadingTimeout ? 'Reset Connection' : 'Cancel'}
                 </button>
                 
                 {loadingTimeout && (
                   <button 
                    onClick={onDemoMode}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg"
                   >
                      <Zap size={14} /> Use Demo Mode Instead
                   </button>
                 )}
               </div>
            </div>
          ) : consentProvider ? (
            <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-[2.5rem] animate-in zoom-in-95 duration-500 space-y-8 shadow-xl">
               <div className="flex items-center justify-between">
                 <button onClick={() => setConsentProvider(null)} className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                 </button>
                 <div className="flex items-center gap-2 text-emerald-500">
                    <ShieldCheck size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Safety Check</span>
                 </div>
               </div>
               
               <div className="space-y-4">
                  <h3 className="serif text-xl font-bold dark:text-white">Is this okay?</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Check, text: 'Your basic name' },
                      { icon: Check, text: 'Your email address' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <p.icon size={12} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-medium">{p.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed italic border-t border-neutral-50 dark:border-neutral-800 pt-4">
                    Teola uses this info only to set up your account. We never share your private data.
                  </p>
               </div>

               <button 
                onClick={confirmConsentAndAuthorize}
                className="w-full flex items-center justify-center gap-4 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Yes, I agree <ArrowRight size={16} />
               </button>
            </div>
          ) : authError ? (
            <div className="w-full bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/30 p-8 rounded-[2.5rem] animate-in zoom-in-95 duration-500 space-y-6 shadow-xl text-center">
               <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <AlertTriangle size={24} />
               </div>
               <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-bold italic">
                 {authError.message}
               </p>
               <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => handleProviderClick(authError.provider)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all active:scale-95"
                  >
                    <RefreshCw size={14} /> Try Again
                  </button>
                  <button 
                    onClick={switchToManual}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all"
                  >
                    <Mail size={14} /> Use Email and Password
                  </button>
               </div>
            </div>
          ) : !showManual ? (
            <div className="space-y-6">
              {hasActiveSession && !isConnecting && (
                <div className="w-full bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 text-blue-500">
                    <Info size={18} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Session Active</p>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
                    You are authenticated, but we couldn't load your profile. This usually happens if the database is waking up.
                  </p>
                  <button 
                    onClick={handleRetry}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Retry Profile Connection
                  </button>
                </div>
              )}

              <div className="grid gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    disabled={!!isConnecting}
                    onClick={() => handleProviderClick(provider.name)}
                    className={`w-full group flex items-center justify-between py-4 px-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.97] shadow-sm hover:shadow-lg dark:text-neutral-300 ${provider.color} disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-4">
                      <provider.icon size={16} />
                      <span>Log in with {provider.name}</span>
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">or</span>
                <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => { setShowManual('email'); setIdentifier(''); setPassword(''); setError(''); setAuthMode('login'); }}
                  className="flex flex-col items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl transition-all hover:border-blue-500/30 group"
                 >
                    <Mail size={18} className="text-neutral-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Email Login</span>
                 </button>
                 <button 
                  onClick={() => { setShowManual('phone'); setIdentifier(''); setPassword(''); setError(''); setAuthMode('login'); }}
                  className="flex flex-col items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl transition-all hover:border-blue-500/30 group"
                 >
                    <Phone size={18} className="text-neutral-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Phone Login</span>
                 </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualAuth} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between px-2 mb-2">
                  <button 
                    type="button" 
                    onClick={() => setShowManual(null)} 
                    className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-all group"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Go Back</span>
                  </button>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">
                    {showManual === 'email' ? 'Email Access' : 'Phone Access'}
                  </h3>
               </div>

               {/* Auth Mode Toggle */}
               <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white' : 'text-neutral-400'}`}
                  >
                    Login
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'signup' ? 'bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white' : 'text-neutral-400'}`}
                  >
                    Sign Up
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-400 ml-4">{showManual === 'email' ? 'Email Address' : 'Phone Number'}</label>
                    <div className="relative">
                      {showManual === 'email' ? (
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                      ) : (
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                      )}
                      <input 
                        autoFocus
                        type={showManual === 'email' ? 'email' : 'tel'} 
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder={showManual === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                        className="w-full pl-14 pr-6 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-neutral-400 ml-4">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {error && <p className="text-[8px] font-bold uppercase tracking-widest text-red-500 ml-4 mt-1">{error}</p>}
                  </div>
               </div>

               <button
                 type="submit"
                 disabled={!!isConnecting || password.length < 8}
                 className="w-full flex items-center justify-center gap-4 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
               >
                 {authMode === 'login' ? (
                    <><KeyRound size={16} /> Log In</>
                  ) : (
                    <><UserPlus size={16} /> Create Account</>
                  )}
                  <ArrowRight size={16} />
               </button>
            </form>
          )}

          {!isConnecting && !successMsg && !authError && !consentProvider && (
            <div className="flex items-center justify-between px-2 pt-2">
              <button 
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-3 group transition-all"
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-neutral-200 dark:border-neutral-700'}`}>
                  {rememberMe && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Remember Me</span>
              </button>
              <ShieldCheck size={16} className="text-emerald-500 opacity-50" />
            </div>
          )}
        </div>

        <div className="space-y-4 text-center">
          <p className="text-[9px] text-neutral-400 px-6 leading-relaxed uppercase tracking-widest font-medium">
            By continuing, you agree to our <button onClick={() => onNavigate('terms')} className="underline hover:text-black dark:hover:text-white transition-colors">Terms</button> and <button onClick={() => onNavigate('privacy')} className="underline hover:text-black dark:hover:text-white transition-colors">Privacy</button>.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-neutral-50 dark:border-neutral-900">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-400">Maison Server Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;