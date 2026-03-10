
import React from 'react';
import { ArrowLeft, Terminal, CheckCircle2, AlertCircle, Smartphone, Accessibility, Zap, Layers, Box } from 'lucide-react';

interface DevChecklistViewProps {
  onBack: () => void;
}

const DevChecklistView: React.FC<DevChecklistViewProps> = ({ onBack }) => {
  const sections = [
    {
      title: 'Accessibility Protocol',
      icon: Accessibility,
      color: 'text-blue-500',
      items: [
        'ARIA labels on all non-text interactive elements.',
        'Contrast ratio > 4.5:1 for standard text (7:1 for headers).',
        'Focus-visible state for keyboard navigation.',
        'ARIA-live regions for typing indicators and toasts.',
        'Screen-reader linear stack transformation for category chips.'
      ]
    },
    {
      title: 'Responsivity & Flow',
      icon: Smartphone,
      color: 'text-emerald-500',
      items: [
        'Use dvh for main container to handle mobile keyboard shifts.',
        'Two-column grid implementation for Tablet (LG breakpoint).',
        'Image sizes: 3:4 aspect ratio across all viewports.',
        'Safe-area-inset-bottom padding on fixed mobile components.',
        'Touch-target minimum size 44x44px for all controls.'
      ]
    },
    {
      title: 'Motion & Animation',
      icon: Zap,
      color: 'text-amber-500',
      items: [
        'Staggered item entries: 400ms duration, 50ms delay.',
        'Zip Pulse (Assistant Indicator): 2s ease-in-out.',
        'Neural Spin (Image Generation): 8s linear infinite.',
        'Scale micro-interactions: 0.96 scale on active button press.',
        'Blur-to-Focus transition for newly added wardrobe pieces.'
      ]
    },
    {
      title: 'Implementation Guards',
      icon: Box,
      color: 'text-purple-500',
      items: [
        'Deterministic variant assignment for A/B testing.',
        'Session persistence check (Remember Identity logic).',
        'Gemini API error boundaries for malformed JSON responses.',
        'Base64 image optimization before storage sync.',
        'Offline capability for wardrobe metadata caching.'
      ]
    }
  ];

  return (
    <div className="p-6 md:p-20 max-w-5xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
      <header className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Atelier</span>
        </button>
        <div className="space-y-2">
           <h1 className="serif text-6xl md:text-8xl font-bold tracking-tighter dark:text-white transition-colors">Implementation Protocol</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500">Maison Engineering • Quality Assurance</p>
        </div>
      </header>

      <div className="grid gap-12">
        {/* DO add comment above each fix. Fixed duplicated and malformed map code. */}
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-8 animate-in slide-in-from-right-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className={`p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 ${section.color}`}>
                <section.icon size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">{section.title}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               {section.items.map((item, i) => (
                 <div key={i} className="group flex items-start gap-4 p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl hover:border-blue-500/30 transition-all shadow-sm">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 leading-relaxed">{item}</p>
                 </div>
               ))}
            </div>
          </section>
        ))}
      </div>

      <div className="p-10 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[3rem] flex items-center gap-6">
         <Terminal size={32} className="text-blue-500" />
         <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">Automated Readiness</h4>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-300 italic">"Ensure all tests pass in Maison Studio before deploying to Global Horizon."</p>
         </div>
      </div>

      <footer className="pt-20 text-center border-t border-neutral-100 dark:border-neutral-800">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-300">Engineering Protocol • Maison Teola Authorized</p>
      </footer>
    </div>
  );
};

export default DevChecklistView;
