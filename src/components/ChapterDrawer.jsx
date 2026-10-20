import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2 } from 'lucide-react';

export default function ChapterDrawer({
  isOpen,
  onClose,
  title,
  chapters,
  currentChapterIndex,
  readChapters,
  onSelectChapter
}) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm h-[100dvh] bg-[#0d0f17] border-l border-white/10 flex flex-col p-4 pt-[max(env(safe-area-inset-top),1rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-2 shrink-0">
          <div>
            <h3 className="font-bold text-base text-white">{title}</h3>
            <p className="text-xs text-slate-400">{chapters?.length} Chapters available</p>
          </div>
          <button 
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-1.5 pr-1 py-2 min-h-0 [webkit-overflow-scrolling:touch]">
          {chapters?.map((ch, idx) => {
            const isCurrent = idx === currentChapterIndex;
            const hasRead = readChapters?.includes(ch.number);
            return (
              <div 
                key={ch.number} 
                className={`min-h-12 px-3.5 rounded-xl flex items-center justify-between cursor-pointer border transition-all active:scale-98 touch-manipulation shrink-0 ${
                  isCurrent 
                    ? 'bg-rose-500/20 border-rose-500/60 text-white font-bold' 
                    : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'
                }`}
                onClick={() => onSelectChapter(idx, ch.number)}
              >
                <div className="flex items-center gap-2">
                  <span>Chapter {ch.number}</span>
                  {hasRead && <CheckCircle2 size={15} className="text-emerald-400" />}
                </div>
                <span className="text-xs text-slate-500 font-medium">{ch.imageCount} pages</span>
              </div>
            );
          })}
          {/* iOS Bottom Navigation / Home Bar clearance spacer */}
          <div className="w-full shrink-0 h-[max(env(safe-area-inset-bottom),2rem)]"></div>
        </div>
      </div>
    </div>,
    document.body
  );
}
