
import React from 'react';
import { ArrowLeft, BookOpen, Sparkles, Shirt, Fingerprint, Star, Heart, HelpCircle, ChevronRight, Zap } from 'lucide-react';

interface HelpCentreViewProps {
  onBack: () => void;
}

const HelpCentreView: React.FC<HelpCentreViewProps> = ({ onBack }) => {
  const updates = [
    {
      version: 'v2.1',
      title: 'AI Silhouette Architect',
      desc: 'Our neural engine now understands your proportions through natural language. Just describe yourself, and Teola builds your architecture.',
      icon: Fingerprint,
      date: 'Latest'
    },
    {
      version: 'v2.0',
      title: 'Profile Customization',
      desc: 'Define your Maison Identity with unique usernames and avatars. Your style DNA is now deeply personalized.',
      icon: Heart,
      date: 'Recent'
    },
    {
      version: 'v1.8',
      title: 'Virtual Closet Curator',
      desc: 'Bulk selection and management tools allow you to curate large wardrobes with professional ease.',
      icon: Shirt,
      date: 'Active'
    }
  ];

  const guideTopics = [
    {
      title: 'Managing Your Closet',
      icon: Shirt,
      points: [
        'Use "Snap" for quick uploads via camera.',
        'Maison AI automatically tags category and color.',
        'Star items to prioritize them in lookbooks.'
      ]
    },
    {
      title: 'Converse with Teola',
      icon: Sparkles,
      points: [
        'Request looks for specific occasions (e.g., "Style me for a wedding").',
        'Ask about trends or "What goes with this black blazer?"',
        'Teola suggests missing pieces to elevate your look.'
      ]
    },
    {
      title: 'Refining Style DNA',
      icon: Zap,
      points: [
        'Keep your Aesthetic Persona updated for better advice.',
        'Describe your build naturally for silhouette analysis.',
        'Define your Wardrobe Ambition to guide AI curation.'
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto no-scrollbar transition-all duration-500">
      <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Back to Settings</span>
          </button>
          <div className="flex items-center gap-2 text-blue-500">
            <HelpCircle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Help Centre</span>
          </div>
        </div>

        <header className="space-y-4">
          <h2 className="serif text-5xl font-bold tracking-tight dark:text-white">The Maison Guide</h2>
          <p className="text-neutral-400 text-sm italic">"Mastering the art of digital self-expression."</p>
        </header>

        {/* What's New Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-white">New in the Atelier</h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Stay Updated</span>
          </div>
          
          <div className="grid gap-6">
            {updates.map((update) => (
              <div key={update.title} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <update.icon size={28} className="text-neutral-900 dark:text-white" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full">{update.version}</span>
                    <h4 className="font-bold text-lg dark:text-white serif">{update.title}</h4>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{update.desc}</p>
                </div>
                <div className="flex items-center self-end md:self-center">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                    {update.date}
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Manual Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <BookOpen size={20} className="text-purple-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest dark:text-white">Mastering the Atelier</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guideTopics.map((topic) => (
              <div key={topic.title} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                  <topic.icon size={20} className="text-neutral-400" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest dark:text-white">{topic.title}</h4>
                <ul className="space-y-3">
                  {topic.points.map((p, i) => (
                    <li key={i} className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      <span className="text-blue-500 font-bold">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Support Footer */}
        <footer className="pt-12 border-t border-neutral-100 dark:border-neutral-800 text-center space-y-4">
          <p className="text-neutral-400 text-sm italic">"Need deeper guidance?"</p>
          <button className="px-10 py-5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl">
            Contact Maison Support
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HelpCentreView;
