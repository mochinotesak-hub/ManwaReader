import React from 'react';
import { BookOpen, Heart, ArrowRight } from 'lucide-react';

export default function ManhwaCard({ manhwa, onSelect, onToggleFavorite, onSetStatus }) {
  const percentRead = Math.round(((manhwa.readCount || 1) / manhwa.totalChapters) * 100);

  return (
    <div 
      className="group flex flex-col bg-[#11131c] rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer active:scale-[0.98]"
      onClick={() => onSelect(manhwa)}
    >
      {/* Poster Cover */}
      <div className="relative w-full pt-[142%] bg-slate-900 overflow-hidden">
        {manhwa.coverImage ? (
          <img 
            src={manhwa.coverImage} 
            alt={manhwa.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-600">
            <BookOpen size={48} />
          </div>
        )}

        {/* Status Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/75 border border-white/10 text-slate-200">
            {manhwa.status}
          </span>
        </div>

        {/* Favorite Button */}
        <button 
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full backdrop-blur-md bg-black/75 border border-white/10 flex items-center justify-center transition-transform active:scale-90 touch-manipulation ${
            manhwa.isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
          onClick={(e) => onToggleFavorite(e, manhwa)}
          title="Favorite"
        >
          <Heart size={16} className={manhwa.isFavorite ? "fill-rose-500" : ""} />
        </button>

        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
          <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: `${percentRead}%` }}></div>
        </div>

        {/* Quick Resume Button */}
        <div className="absolute inset-x-0 bottom-1 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center">
          <button 
            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-transform touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(manhwa, manhwa.lastReadChapter);
            }}
          >
            <span>Resume Ch. {manhwa.lastReadChapter}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="p-3.5 flex flex-col gap-2">
        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
          {manhwa.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ch. {manhwa.firstChapter} - {manhwa.lastChapter}</span>
          <div onClick={(e) => e.stopPropagation()}>
            <select 
              value={manhwa.status} 
              onChange={(e) => onSetStatus(e, manhwa, e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md text-[11px] font-semibold text-slate-300 py-0.5 px-1.5 outline-none cursor-pointer"
            >
              <option value="Reading" className="bg-[#11131c]">Reading</option>
              <option value="Completed" className="bg-[#11131c]">Completed</option>
              <option value="On Hold" className="bg-[#11131c]">On Hold</option>
              <option value="Plan to Read" className="bg-[#11131c]">Plan to Read</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
