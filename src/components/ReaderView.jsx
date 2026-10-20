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
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadedPages, setLoadedPages] = useState({});
  const [currentFetching, setCurrentFetching] = useState(null);

  // Reset page count and loading state when chapter changes
  useEffect(() => {
    setIsChapterLoading(true);
    setVisibleCount(6);
    setLoadedPages({});
    setCurrentFetching({ page: 1, name: currentChapter?.imageMeta?.[0]?.name || 'Page 1', size: currentChapter?.imageMeta?.[0]?.sizeFormatted || '' });
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fallback safety net: never keep user stuck on loading spinner if browser delayed onLoad
    const safetyTimer = setTimeout(() => {
      setIsChapterLoading(false);
    }, 1500);

    return () => clearTimeout(safetyTimer);
  }, [currentChapter?.number]);

  const handleImageLoad = (idx, startTime) => {
    const elapsedMs = startTime ? Math.round(performance.now() - startTime) : 0;
    setLoadedPages(prev => ({ ...prev, [idx]: true }));
    if (idx === 0) {
      setIsChapterLoading(false);
    }

    // Telemetry log to server
    const meta = currentChapter?.imageMeta?.[idx];
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PAGE_LOAD_SUCCESS',
        page: idx + 1,
        manhwa: selectedManhwa?.title,
        chapter: currentChapter?.number,
        durationMs: elapsedMs,
        details: { filename: meta?.name, size: meta?.sizeFormatted }
      })
    }).catch(() => {});

    // Update currently fetching to the next pending visible page
    const nextPending = idx + 1;
    if (nextPending < visibleCount) {
      const nextMeta = currentChapter?.imageMeta?.[nextPending];
      setCurrentFetching({
        page: nextPending + 1,
        name: nextMeta?.name || `Page ${nextPending + 1}`,
        size: nextMeta?.sizeFormatted || ''
      });
    } else {
      setCurrentFetching(null);
    }
  };

  const handleImageError = (idx, url) => {
    handleImageLoad(idx, null);
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PAGE_LOAD_ERROR',
        page: idx + 1,
        manhwa: selectedManhwa?.title,
        chapter: currentChapter?.number,
        details: { url }
      })
    }).catch(() => {});
  };

  // Infinite scroll: auto-load 5 more pages as user approaches bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 1200;

      if (scrollPosition >= threshold) {
        setVisibleCount(prev => {
          const total = currentChapter?.images?.length || 0;
          if (prev < total) {
            return Math.min(prev + 5, total);
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentChapter?.images]);



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
          {/* Live Fetching HUD Bar */}
          {currentChapter?.images && (
            <div className="sticky top-14 z-10 w-full px-4 py-2.5 bg-[#090a0f]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs font-medium shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-slate-300">
                  {currentFetching ? (
                    <>
                      Fetching <span className="text-rose-400 font-bold">{currentFetching.name}</span>
                      {currentFetching.size && <span className="text-slate-500 ml-1">({currentFetching.size})</span>}
                    </>
                  ) : (
                    <span className="text-emerald-400 font-semibold">Active buffer ready</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>{Object.keys(loadedPages).length} / {currentChapter.images.length} Loaded</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${Math.round((Object.keys(loadedPages).length / currentChapter.images.length) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {isChapterLoading ? (
            <div className="w-full flex flex-col items-center justify-center gap-4 py-36 bg-[#090a0f]">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <Loader2 size={28} className="text-rose-500 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold tracking-wider text-slate-200">
                  Loading Chapter {currentChapter?.number}
                </p>
                <p className="text-xs text-slate-400">
                  Fetching page 1 {currentChapter?.imageMeta?.[0]?.sizeFormatted ? `(${currentChapter.imageMeta[0].sizeFormatted})` : ''}...
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col">
              {currentChapter?.images?.slice(0, visibleCount).map((imgUrl, i) => {
                const meta = currentChapter?.imageMeta?.[i];
                const isLoaded = loadedPages[i];
                return (
                  <div key={`${currentChapter?.number}-${i}`} className="relative w-full bg-black">
                    {!isLoaded && (
                      <div className="w-full py-20 flex flex-col items-center justify-center gap-2 bg-[#0c0d14] text-slate-500">
                        <Loader2 size={22} className="text-rose-500 animate-spin" />
                        <span className="text-xs font-medium text-slate-400">
                          Loading Page {i + 1} {meta?.sizeFormatted ? `(${meta.sizeFormatted})` : ''}
                        </span>
                      </div>
                    )}
                    <img 
                      src={imgUrl} 
                      alt={`Page ${i + 1}`} 
                      className={`w-full h-auto block transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0 h-0'}`}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      onLoad={() => handleImageLoad(i, performance.now())}
                      onError={() => handleImageError(i, imgUrl)}
                    />
                  </div>
                );
              })}

            {/* Indicator when more pages are remaining */}
            {!isChapterLoading && currentChapter?.images && visibleCount < currentChapter.images.length && (
              <div className="w-full py-8 flex flex-col items-center justify-center gap-2 bg-[#090a0f]/90 text-slate-400">
                <Loader2 size={20} className="text-rose-500 animate-spin" />
                <span className="text-xs font-medium">
                  Showing {visibleCount} of {currentChapter.images.length} pages • Scrolling auto-fetches next 5
                </span>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Bottom Stepper Footer */}
        <div className="mx-3 sm:mx-0 mt-5 p-4 sm:p-5 rounded-2xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <button 
            type="button"
            className="w-full sm:w-auto h-12 px-5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            disabled={currentChapterIndex <= 0}
            onClick={(e) => {
              e.stopPropagation();
              goToPrevChapter();
            }}
          >
            <ChevronLeft size={20} />
            <span>Previous Chapter</span>
          </button>

          <div className="text-xs font-semibold text-slate-400">
            Chapter {currentChapter?.number} of {manhwaDetails?.chapters?.length}
          </div>

          <button 
            type="button"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            disabled={!manhwaDetails || currentChapterIndex >= manhwaDetails.chapters.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              goToNextChapter();
            }}
          >
            <span>Next Chapter</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
