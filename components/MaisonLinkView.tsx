
import React, { useState } from 'react';
import { maisonLink } from '../services/supabaseClient';
import { ArrowLeft, Smartphone, RefreshCw, Copy, Check, Link, Globe, ShieldCheck } from 'lucide-react';

interface MaisonLinkViewProps {
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const MaisonLinkView: React.FC<MaisonLinkViewProps> = ({ userId, onBack, onSuccess }) => {
  const [syncCode, setSyncCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    const code = await maisonLink.exportState(userId);
    setSyncCode(code);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!syncCode.trim()) return;
    setIsImporting(true);
    setError('');
    
    const success = await maisonLink.importState(userId, syncCode);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid Maison Link code. Please check and try again.');
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-6 md:p-20 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Back to Profile</span>
        </button>

        <header className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shadow-xl border border-blue-100 dark:border-blue-900/30">
              <Smartphone size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h1 className="serif text-5xl font-bold tracking-tight dark:text-white">Maison Link</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">Cross-Device Synchronization</p>
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
            Synchronize your virtual wardrobe, style DNA, and saved looks across all your devices securely. Use a Link Code to bridge your Maison presence.
          </p>
        </header>

        <div className="grid gap-12 pt-8 border-t border-neutral-100 dark:border-neutral-800">
          {/* Section: Generate Code */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-white">Link This Device</h3>
              <p className="text-xs text-neutral-500">Generate a unique code to import your data into another device.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleExport}
                className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
              >
                {copied ? <Check size={16} /> : <RefreshCw size={16} />}
                {copied ? 'Code Copied' : 'Generate Link Code'}
              </button>
            </div>
          </section>

          {/* Section: Import Code */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-white">Import from Device</h3>
              <p className="text-xs text-neutral-500">Paste a code from your other device to synchronize your Maison profile.</p>
            </div>
            <div className="space-y-4">
              <textarea 
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value)}
                placeholder="Paste Maison Link code here..."
                className="w-full h-32 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] px-8 py-6 text-xs font-mono break-all focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
              {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-4">{error}</p>
              )}
              <button 
                onClick={handleImport}
                disabled={isImporting || !syncCode.trim()}
                className="w-full py-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {isImporting ? <RefreshCw className="animate-spin" size={16} /> : <Link size={16} />}
                {isImporting ? 'Linking...' : 'Connect and Merge Data'}
              </button>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-start gap-4 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-[2rem]">
            <Globe className="text-blue-500 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Global Sync</p>
              <p className="text-[10px] text-neutral-500 leading-relaxed">Identity linked across mobile, tablet, and desktop ateliers.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-[2rem]">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Encrypted DNA</p>
              <p className="text-[10px] text-neutral-500 leading-relaxed">Maison Link codes are end-to-end encrypted locally.</p>
            </div>
          </div>
        </div>

        <footer className="pt-10 text-center">
          <p className="text-[9px] text-neutral-300 dark:text-neutral-700 uppercase tracking-[0.5em] font-bold">Maison Link Protocol • Secure Curation</p>
        </footer>
      </div>
    </div>
  );
};

export default MaisonLinkView;
