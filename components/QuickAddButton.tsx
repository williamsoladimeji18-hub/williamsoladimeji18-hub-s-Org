import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Plus, X, Paperclip } from 'lucide-react';

interface QuickAddButtonProps {
  onFileSelect: (file: File) => void;
  className?: string;
  variant?: 'default' | 'inline' | 'icon';
  direction?: 'up' | 'down';
  disabled?: boolean;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ 
  onFileSelect, 
  className = "", 
  variant = "default",
  direction = "up",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setIsOpen(false);
    }
  };

  const menuPositionClass = direction === 'up' 
    ? 'bottom-full mb-4' 
    : 'top-full mt-4';

  const animationClass = direction === 'up'
    ? 'animate-in fade-in slide-in-from-bottom-4 duration-300'
    : 'animate-in fade-in slide-in-from-top-4 duration-300';

  if (variant === 'icon') {
    return (
      <div ref={containerRef} className="relative inline-block">
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 text-neutral-400 hover:text-blue-500 transition-all active:scale-90"
        >
          <Paperclip size={20} />
        </button>
        {isOpen && (
          <div className={`absolute left-0 bottom-full mb-4 w-48 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 rounded-[1.5rem] p-2 shadow-2xl z-50 ${animationClass}`}>
            <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <Camera size={16} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Take Photo</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <ImageIcon size={16} className="text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Upload File</span>
            </button>
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
        <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {isOpen && !disabled && (
        <div className={`absolute right-0 w-52 bg-[#121212] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/5 p-2.5 flex flex-col gap-1.5 z-[200] ${menuPositionClass} ${animationClass}`}>
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white hover:text-black rounded-2xl transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-black group-hover:text-white transition-all">
              <Camera size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Take Snapshot</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white hover:text-black rounded-2xl transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-black group-hover:text-white transition-all">
              <ImageIcon size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Archive Library</span>
          </button>
        </div>
      )}

      {variant === 'inline' ? (
        <button 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] transition-all active:scale-95 border border-white/5 ${
            isOpen 
              ? 'bg-blue-600 text-white border-transparent shadow-xl' 
              : 'bg-[#121212] text-white hover:bg-white hover:text-black'
          } ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
        >
          <Plus size={20} className={isOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">{isOpen ? 'Close' : 'Archive Look'}</span>
        </button>
      ) : (
        <button 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/5 ${
            isOpen 
              ? 'bg-[#121212] text-neutral-500 rotate-45 scale-95' 
              : 'bg-white text-black hover:scale-105 shadow-blue-500/10'
          } ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

export default QuickAddButton;