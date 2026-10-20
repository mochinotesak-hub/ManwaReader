import React from 'react';
import { Layers } from 'lucide-react';
import ManhwaCard from './ManhwaCard';

const STATUS_OPTIONS = ['All', 'Reading', 'Completed', 'On Hold', 'Plan to Read'];

export default function CatalogView({
  manhwas,
  activeTab,
  setActiveTab,
  onSelectManhwa,
  onToggleFavorite,
  onSetStatus
}) {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col gap-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Personal Webtoon Collection
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Instant offline streaming powered by your local media server.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-400">
            <Layers size={14} className="text-rose-500" />
            <span>{manhwas.length} Titles Ready</span>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          {STATUS_OPTIONS.map(status => (
            <button 
              key={status}
              className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 touch-manipulation flex items-center gap-2 ${
                activeTab === status 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab(status)}
            >
              <span>{status}</span>
              {status === 'All' && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                  {manhwas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Poster Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {manhwas.map(manhwa => (
          <ManhwaCard
            key={manhwa.id}
            manhwa={manhwa}
            onSelect={onSelectManhwa}
            onToggleFavorite={onToggleFavorite}
            onSetStatus={onSetStatus}
          />
        ))}
      </div>
    </div>
  );
}
