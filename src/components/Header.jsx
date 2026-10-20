import React from 'react';
import { 
  BookOpen, 
  Home, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  Search, 
  Heart 
} from 'lucide-react';

export default function Header({
  selectedManhwa,
  currentChapter,
  currentChapterIndex,
  totalChapters,
  isChapterListOpen,
  setIsChapterListOpen,
  goToPrevChapter,
  goToNextChapter,
  readingWidth,
  setReadingWidth,
  isFullscreen,
  toggleFullscreen,
  searchQuery,
  setSearchQuery,
  filterFavorite,
  setFilterFavorite,
  onBackToLibrary
}) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0d0f17]/90 border-b border-white/10 transition-all pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group active:scale-95 transition-transform shrink-0" 
          onClick={selectedManhwa ? undefined : onBackToLibrary}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 shadow-md shadow-rose-500/25 ring-1 ring-white/20 shrink-0">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {selectedManhwa ? (
                <span className="hidden sm:inline">ManwaReader</span>
              ) : (
                'ManwaReader'
              )}
            </span>
            {!selectedManhwa && (
              <span className="text-[10px] font-semibold tracking-wider text-rose-500 uppercase">
                Offline Vault
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Controls */}
        {selectedManhwa ? (
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button 
              className="h-10 w-10 sm:w-auto sm:px-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation shrink-0"
              onClick={onBackToLibrary} 
              title="Return to Library"
            >
              <Home size={18} />
              <span className="hidden md:inline">Library</span>
            </button>

            <button 
              className="h-10 px-3 sm:px-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation shrink-0"
              onClick={() => setIsChapterListOpen(!isChapterListOpen)}
            >
              <List size={18} />
              <span>{currentChapter?.number}</span>
            </button>

            {/* Stepper with Large Tap Targets */}
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5 shrink-0">
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed active:scale-90 transition-all touch-manipulation"
                disabled={currentChapterIndex <= 0}
                onClick={goToPrevChapter}
                title="Previous Chapter"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-bold px-1.5 text-slate-400 min-w-10 text-center">
                {currentChapterIndex + 1}/{totalChapters}
              </span>
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed active:scale-90 transition-all touch-manipulation"
                disabled={currentChapterIndex >= totalChapters - 1}
                onClick={goToNextChapter}
                title="Next Chapter"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Reading Width Slider (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2.5 h-11 px-3.5 bg-white/5 rounded-xl border border-white/10">
              <Sliders size={16} className="text-slate-400" />
              <input 
                type="range" 
                min="640" 
                max="1200" 
                step="40" 
                value={readingWidth} 
                onChange={(e) => setReadingWidth(Number(e.target.value))}
                className="w-20 accent-rose-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-400 w-11 text-right">{readingWidth}px</span>
            </div>

            <button 
              className="hidden sm:flex w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
              onClick={toggleFullscreen} 
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 h-11 px-3.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all w-36 sm:w-64">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search series..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
              />
            </div>

            <button 
              className={`h-11 px-3.5 sm:px-4 rounded-xl border font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 touch-manipulation ${
                filterFavorite 
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-500/10' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setFilterFavorite(!filterFavorite)}
            >
              <Heart size={18} className={filterFavorite ? "fill-rose-500 text-rose-500" : ""} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
