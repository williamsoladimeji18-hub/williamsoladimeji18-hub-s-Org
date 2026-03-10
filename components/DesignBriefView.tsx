
import React from 'react';
import { ArrowLeft, Target, Award, Sparkles, Layout, Palette, ShieldCheck, Zap, Globe, Briefcase } from 'lucide-react';

interface DesignBriefViewProps {
  onBack: () => void;
}

const DesignBriefView: React.FC<DesignBriefViewProps> = ({ onBack }) => {
  return (
    <div className="p-6 md:p-20 max-w-5xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
      <header className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Atelier</span>
        </button>
        <div className="space-y-2">
           <h1 className="serif text-6xl md:text-8xl font-bold tracking-tighter dark:text-white transition-colors">Design Brief</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500">Maison Protocol v1.0 • Aesthetic Strategy</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-16">
        <section className="col-span-2 space-y-12">
          <div className="space-y-6">
            <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">
              <Target size={16} className="text-blue-500" /> Core Purpose
            </h3>
            <p className="serif text-3xl font-bold dark:text-white leading-tight">
              To architect the definitive digital ensemble through neural aesthetic logic, bridging the gap between archive and presence.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm italic">
              "Teola isn't just a closet manager; it's a strategic identity consultant that understands the silhouette, the scene, and the sentiment."
            </p>
          </div>

          <div className="space-y-8">
            <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">
              <Award size={16} className="text-blue-500" /> The Persona: The Discriminating Curator
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Demographic', value: 'High-Fashion Enthusiasts (25-45)' },
                 { label: 'Pain Point', value: 'Decision fatigue amidst vast archives' },
                 { label: 'Motivation', value: 'Effortless sartorial unmistakability' },
                 { label: 'Success Metric', value: 'Reduced morning friction' },
               ].map(item => (
                 <div key={item.label} className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] font-black uppercase text-neutral-400 mb-1">{item.label}</p>
                    <p className="text-xs font-bold dark:text-white">{item.value}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-8">
             <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">
               <Palette size={16} className="text-blue-500" /> Visual References
             </h3>
             <div className="grid gap-8">
                {[
                  { title: 'Minimalist Brutalism', desc: 'Inspired by 90s Prada. Clean lines, negative space, and monochromatic weight.', icon: Layout },
                  { title: 'High-Tech Noir', desc: 'Blade Runner meets Paris Runway. Deep contrast, ethereal glows, and neon accents.', icon: Globe },
                  { title: 'Editorial Elegance', desc: 'Vogue Archive. Serif typography, grid-heavy layouts, and texture-driven imagery.', icon: Briefcase }
                ].map(ref => (
                  <div key={ref.title} className="flex gap-6 p-8 border-l-2 border-neutral-100 dark:border-neutral-800 hover:border-blue-500 transition-colors group">
                     <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-blue-500 transition-colors">
                        <ref.icon size={24} />
                     </div>
                     <div className="space-y-2">
                        <h4 className="serif text-xl font-bold dark:text-white">{ref.title}</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{ref.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <aside className="space-y-12">
          <div className="bg-neutral-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Constraints</h3>
             <ul className="space-y-6">
                {[
                  'Mobile-First (Touch-Optimal)',
                  'Ultra-Dark Theme Native',
                  'High-Contrast Accessibility',
                  'Low-Latency Neural Feedback',
                  'Offline-Resilient Archive'
                ].map(c => (
                  <li key={c} className="flex gap-4 items-start">
                     <ShieldCheck size={14} className="text-blue-500 mt-0.5" />
                     <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{c}</span>
                  </li>
                ))}
             </ul>
          </div>

          <div className="p-10 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Deliverables</h3>
             <div className="space-y-4">
                {[
                  'Fidelity Figma Protocol',
                  'Custom SVG Icon Archive',
                  'Tailion Design Tokens',
                  'Aesthetic Motion Curve Suite'
                ].map(d => (
                  <div key={d} className="flex items-center justify-between group cursor-default">
                     <span className="text-xs font-bold dark:text-neutral-300 group-hover:text-blue-500 transition-colors">{d}</span>
                     <Zap size={10} className="text-neutral-200 group-hover:text-blue-500" />
                  </div>
                ))}
             </div>
          </div>
        </aside>
      </div>

      <footer className="pt-20 text-center border-t border-neutral-100 dark:border-neutral-800">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-300">Design Document • Maison Teola Confidential</p>
      </footer>
    </div>
  );
};

export default DesignBriefView;
