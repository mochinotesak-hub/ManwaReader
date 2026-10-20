import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ChapterDrawer from './ChapterDrawer';

export default function ReaderView({
  selectedManhwa,
  manhwaDetails,
  currentChapter,
  currentChapterIndex,
  readingWidth,
  isChapterListOpen,
  setIsChapterListOpen,
  goToPrevChapter,
  goToNextChapter,
  onSelectChapter,
  onToggleFavorite
}) {
  const [isChapterLoading, setIsChapterLoading] = useState(true);

  // Trigger loading spinner whenever the chapter number changes
  useEffect(() => {
    setIsChapterLoading(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentChapter?.number]);

  // Background prefetch next 2 chapters
  useEffect(() => {
    if (!manhwaDetails?.chapters || isChapterLoading) return;

    // Prefetch next 2 chapters after current chapter is ready
    const timer = setTimeout(() => {
      const nextChapters = [
        manhwaDetails.chapters[currentChapterIndex + 1],
        manhwaDetails.chapters[currentChapterIndex + 2]
      ].filter(Boolean);

      nextChapters.forEach(chapter => {
        chapter.images?.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentChapterIndex, manhwaDetails, isChapterLoading]);

  const handleFirstImageLoaded = () => {
    setIsChapterLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center w-full pb-20">
      {/* Chapter Drawer */}
      <ChapterDrawer
        isOpen={isChapterListOpen}
        onClose={() => setIsChapterListOpen(false)}
        title={selectedManhwa.title}
        chapters={manhwaDetails?.chapters}
        currentChapterIndex={currentChapterIndex}
        readChapters={manhwaDetails?.meta?.readChapters}
        onSelectChapter={onSelectChapter}
      />

      {/* Continuous Webtoon Scroll Stream */}
      <div 
        className="w-full flex flex-col mx-auto max-w-full sm:[max-width:var(--reader-max-w)]"
        style={{ '--reader-max-w': `${readingWidth}px` }}
      >
        {/* Chapter Top Title Banner */}
        <div className="mx-3 sm:mx-0 my-3 p-4 sm:p-5 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-white">{selectedManhwa.title}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
              <span className="text-rose-500">Chapter {currentChapter?.number}</span>
              <span>•</span>
              <span>{currentChapter?.imageCount} Pages</span>
            </div>
          </div>
          <button 
            className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${
              selectedManhwa.isFavorite
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            onClick={(e) => onToggleFavorite(e, selectedManhwa)}
          >
            <Heart size={18} className={selectedManhwa.isFavorite ? "fill-rose-500 text-rose-500" : ""} />
            <span>{selectedManhwa.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Edge-to-edge Images or Clean Spinner */}
        <div className="relative w-full flex flex-col bg-black shadow-2xl min-h-[60vh] rounded-xl overflow-hidden">
          {isChapterLoading && (
            <div className="w-full flex flex-col items-center justify-center gap-4 py-44 bg-[#090a0f]">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <Loader2 size={28} className="text-rose-500 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold tracking-wider text-slate-200">
                  Loading Chapter {currentChapter?.number}
                </p>
                <p className="text-xs text-slate-500">
                  Fetching {currentChapter?.imageCount || '...'} pages
                </p>
              </div>
            </div>
          )}

          <div className={isChapterLoading ? "hidden" : "w-full flex flex-col"}>
            {currentChapter?.images?.map((imgUrl, i) => (
              <img 
                key={`${currentChapter?.number}-${i}`} 
                src={imgUrl} 
                alt={`Page ${i + 1}`} 
                className="w-full h-auto block"
                loading={i < 3 ? 'eager' : 'lazy'}
                onLoad={i === 0 ? handleFirstImageLoaded : undefined}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stepper Footer */}
        <div className="mx-3 sm:mx-0 mt-5 p-4 sm:p-5 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <button 
            className="w-full sm:w-auto h-12 px-5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            disabled={currentChapterIndex <= 0}
            onClick={goToPrevChapter}
          >
            <ChevronLeft size={20} />
            <span>Previous Chapter</span>
          </button>

          <div className="text-xs font-semibold text-slate-400">
            Chapter {currentChapter?.number} of {manhwaDetails?.chapters?.length}
          </div>

          <button 
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            disabled={!manhwaDetails || currentChapterIndex >= manhwaDetails.chapters.length - 1}
            onClick={goToNextChapter}
          >
            <span>Next Chapter</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
