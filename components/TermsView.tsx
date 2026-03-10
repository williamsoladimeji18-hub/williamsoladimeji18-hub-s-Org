
import React from 'react';
import { ArrowLeft, Gavel, ShieldCheck, Scale, AlertTriangle, FileText, Lock, Globe } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
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
          <div className="flex items-center gap-4 text-blue-500">
            <Gavel size={32} strokeWidth={1.5} />
            <h1 className="serif text-5xl font-bold tracking-tight dark:text-white">Terms of Service</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">Identity Protocol • Maison Protocol v6.3.0</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert space-y-12 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">1. The Maison Experience</h2>
            <p>
              Maison Teola provides a digital sartorial identity architecture powered by advanced neural processing. By accessing our atelier, you acknowledge that you are interacting with an AI-driven consultative platform designed to augment, not replace, personal fashion judgment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">2. Your Virtual Archive</h2>
            <p>
              You retain absolute ownership of all "User Content" (garment images, style descriptions). By uploading content to the archive, you grant Teola a worldwide, non-exclusive, royalty-free license to process this data via third-party AI models (including Google Gemini) solely for the purpose of delivering your personalized styling experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">3. Generative Assets & IP</h2>
            <p>
              The "Teola" trademarks, visual architecture, and specific neural output (generative lookbooks) are protected intellectual property. While you are free to share your curated looks for personal and social use, the commercial exploitation of Teola's generative textures or neural rendering engine is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
             <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                   <ShieldCheck size={18} className="text-blue-500" />
                   <h4 className="text-sm font-black uppercase text-blue-900 dark:text-blue-100">AI Accuracy Disclaimer</h4>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 italic">
                  Teola uses predictive neural modeling. Discrepancies between digital renderings and physical textile properties (color, fit, texture) may occur. Maison Teola is not liable for purchases made based on AI-generated suggestions.
                </p>
             </div>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">4. User Obligations</h2>
            <p>
              Users are prohibited from uploading content that is unlawful, offensive, or infringes on the rights of third parties. Maison Teola reserves the right to moderate the archive to ensure compliance with our aesthetic and safety standards.
            </p>
            <div className="grid gap-3 mt-4">
               {[
                 { title: 'Identity Integrity', desc: 'Maintain accurate profile data for precise silhouette modeling.', icon: Lock },
                 { title: 'Atelier Respect', desc: 'No automated scraping of the Maison generative engine.', icon: Globe }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <item.icon size={16} className="text-neutral-400 shrink-0" />
                    <div>
                       <p className="text-[10px] font-black uppercase dark:text-white">{item.title}</p>
                       <p className="text-[10px] opacity-60">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">5. Elite Access & Payments</h2>
            <p>
              Elite Status grants expanded storage and 4K neural rendering. Subscriptions are billed monthly or annually and are non-refundable. Termination of Elite Status will result in archive compression to free-tier limits (20 items) after a 14-day grace period.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Maison Teola shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service. Our cumulative liability for all claims shall not exceed the amount paid by you for Elite Access in the preceding six months.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">7. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Maison Teola is incorporated, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="serif text-2xl font-bold text-neutral-900 dark:text-white">8. Termination of Identity</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate our "Atelier Respect" policy, which includes attempts to reverse-engineer our neural protocols or upload inappropriate content to the archive.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-neutral-100 dark:border-neutral-800 text-center space-y-4">
          <Scale size={24} className="mx-auto text-neutral-300" />
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black leading-relaxed max-w-sm mx-auto">
            Questions regarding the Maison Protocol? Reach our legal node at legal@teola.ai
          </p>
          <p className="text-[9px] text-neutral-500 italic">Effective Date: May 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsView;
