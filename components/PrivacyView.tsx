
import React from 'react';
import { ArrowLeft, ShieldCheck, Eye, Lock, Globe, Server, Shield, Database, Trash2 } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="h-full bg-white dark:bg-neutral-950 overflow-y-auto transition-colors duration-500">
      <div className="max-w-3xl mx-auto p-8 md:p-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Support</span>
        </button>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-emerald-500">
            <ShieldCheck size={32} strokeWidth={1.5} />
            <h1 className="serif text-5xl font-bold tracking-tight dark:text-white">Privacy DNA</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">Data Encryption &amp; Neural Security</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert space-y-12 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">The Privacy Promise</h2>
            <p>
              At Maison Teola, we treat your sartorial data as a vital extension of your digital identity. We operate on a principle of radical data minimization—collecting only what is essential for the AI to understand your style architecture.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">1. Data Archival Details</h2>
            <div className="grid gap-4">
              {[
                { title: 'Identity Metadata', desc: 'Email, username, and device identifiers used for Maison Link syncing.', icon: Lock },
                { title: 'Sartorial Inventory', desc: 'Images of your garments and associated metadata (color, brand, category).', icon: Server },
                { title: 'Biometric Archetypes', desc: 'Estimates of face shape, skin undertone, and body proportions provided by you or detected via neural scans.', icon: Eye },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
                   <item.icon size={24} className="text-emerald-500 shrink-0" />
                   <div className="space-y-1">
                      <p className="text-sm font-black dark:text-white uppercase tracking-widest">{item.title}</p>
                      <p className="text-xs leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">2. Third-Party Neural Processing</h2>
            <p>
              Teola utilizes the Google Gemini API for deep visual analysis and text generation. When you perform a "Visual DNA Scan" or "Snap Archive," your data is transmitted to Google for processing. 
            </p>
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
                <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase mb-2">Notice of Processing</p>
                <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                  Google does not use your Teola archive data to train its foundational models. Your visual data is processed in a stateless session and expunged after metadata extraction.
                </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">3. Data Retention & International Transfers</h2>
            <p>
              Your sartorial archive is retained as long as your account is active. To facilitate Global Maison Link functionality, your encrypted data may be processed on servers located outside your home country. We utilize standard contractual clauses to ensure your identity remains protected across borders.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">4. Your Data Rights (GDPR / CCPA)</h2>
            <p>
              Regardless of your jurisdiction, Maison Teola grants you the right to:
            </p>
            <ul className="list-disc pl-5 space-y-6 text-sm">
              <li>
                <strong>Portability:</strong> 
                <p className="mt-1 opacity-80">Export your entire archive as a structured JSON file at any time via the Maison Link export node.</p>
              </li>
              <li>
                <strong>Erasure:</strong> 
                <p className="mt-1 opacity-80">Trigger an "Identity Expungement" which permanently purges your DNA signatures from our active nodes within 24 hours.</p>
              </li>
              <li>
                <strong>Visibility:</strong> 
                <p className="mt-1 opacity-80">Control who can view your "Sartorial Standing" through fine-grained visibility toggles in the Intelligence Protocol menu.</p>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">5. Security Infrastructure</h2>
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center space-y-3">
                  <Database size={24} className="mx-auto text-emerald-500" />
                  <h4 className="text-[10px] font-black uppercase dark:text-white">Encrypted Vault</h4>
                  <p className="text-[10px] opacity-70">AES-256 bit encryption at rest for all clothing metadata.</p>
               </div>
               <div className="flex-1 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center space-y-3">
                  <Shield size={24} className="mx-auto text-blue-500" />
                  <h4 className="text-[10px] font-black uppercase dark:text-white">Stateless AI</h4>
                  <p className="text-[10px] opacity-70">Neural sessions are processed without persistent logs of raw imagery.</p>
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">6. Cookies & Persistent Tokens</h2>
            <p>
              We use secure, local storage tokens to handle "Remember Identity" functionality. No third-party tracking cookies are utilized for advertising within the Maison.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-neutral-100 dark:border-neutral-800 text-center space-y-4">
          <Globe size={24} className="mx-auto text-neutral-300" />
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black leading-relaxed">
            Privacy is the ultimate luxury. Maison Teola.
          </p>
          <p className="text-[9px] text-neutral-500 italic">Version 6.3.0 Rev B • May 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyView;
