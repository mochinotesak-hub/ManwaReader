import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CatalogView from './components/CatalogView';
import ReaderView from './components/ReaderView';
import './App.css';

const API_BASE = '/api';

export default function App() {
  const [manhwas, setManhwas] = useState([]);
  const [selectedManhwa, setSelectedManhwa] = useState(null);
  const [manhwaDetails, setManhwaDetails] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [readingWidth, setReadingWidth] = useState(840);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);

  // Prevent background page scrolling when chapter drawer is open
  useEffect(() => {
    if (isChapterListOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isChapterListOpen]);

  const loadLibrary = () => {
    fetch(`${API_BASE}/manhwas`)
      .then(res => res.json())
      .then(data => {
        setManhwas(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching library:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const selectManhwa = (manhwa, resumeChapter = null) => {
    setIsLoading(true);
    fetch(`${API_BASE}/manhwa/${manhwa.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedManhwa(manhwa);
        setManhwaDetails(data);

        let targetIndex = 0;
        const chToFind = resumeChapter !== null ? resumeChapter : (data.meta?.lastReadChapter || manhwa.lastReadChapter);
        if (chToFind) {
          const foundIdx = data.chapters.findIndex(c => c.number === chToFind);
          if (foundIdx !== -1) targetIndex = foundIdx;
        }

        setCurrentChapterIndex(targetIndex);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'instant' });

        const targetChapter = data.chapters[targetIndex];
        if (targetChapter) {
          fetch(`${API_BASE}/manhwa/${manhwa.id}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapterNumber: targetChapter.number })
          }).catch(() => {});
        }
      })
      .catch(err => {
        console.error('Error opening manhwa:', err);
        setIsLoading(false);
      });
  };

  const currentChapter = manhwaDetails?.chapters?.[currentChapterIndex];

  const toggleFavorite = (e, manhwa) => {
    e.stopPropagation();
    const newFav = !manhwa.isFavorite;
    setManhwas(prev => prev.map(m => m.id === manhwa.id ? { ...m, isFavorite: newFav } : m));
    if (selectedManhwa?.id === manhwa.id) {
      setSelectedManhwa(prev => ({ ...prev, isFavorite: newFav }));
    }

    fetch(`${API_BASE}/manhwa/${manhwa.id}/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: newFav })
    }).catch(() => loadLibrary());
  };

  const setStatus = (e, manhwa, newStatus) => {
    e.stopPropagation();
    setManhwas(prev => prev.map(m => m.id === manhwa.id ? { ...m, status: newStatus } : m));
    fetch(`${API_BASE}/manhwa/${manhwa.id}/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => loadLibrary());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedManhwa) return;
      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        goToNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        goToPrevChapter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedManhwa, currentChapterIndex, manhwaDetails]);

  const goToNextChapter = () => {
    if (manhwaDetails && currentChapterIndex < manhwaDetails.chapters.length - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      const ch = manhwaDetails.chapters[nextIdx];
      fetch(`${API_BASE}/manhwa/${selectedManhwa.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber: ch.number })
      }).catch(() => {});
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const ch = manhwaDetails.chapters[prevIdx];
      fetch(`${API_BASE}/manhwa/${selectedManhwa.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber: ch.number })
      }).catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleSelectChapter = (idx, chapterNumber) => {
    setCurrentChapterIndex(idx);
    setIsChapterListOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetch(`${API_BASE}/manhwa/${selectedManhwa.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterNumber })
    }).catch(() => {});
  };

  const filteredManhwas = manhwas.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || m.status === activeTab;
    const matchesFav = !filterFavorite || m.isFavorite;
    return matchesSearch && matchesTab && matchesFav;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100 antialiased select-none">
      <Header
        selectedManhwa={selectedManhwa}
        currentChapter={currentChapter}
        currentChapterIndex={currentChapterIndex}
        totalChapters={manhwaDetails?.chapters?.length || 0}
        isChapterListOpen={isChapterListOpen}
        setIsChapterListOpen={setIsChapterListOpen}
        goToPrevChapter={goToPrevChapter}
        goToNextChapter={goToNextChapter}
        readingWidth={readingWidth}
        setReadingWidth={setReadingWidth}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterFavorite={filterFavorite}
        setFilterFavorite={setFilterFavorite}
        onBackToLibrary={() => { setSelectedManhwa(null); loadLibrary(); }}
      />

      <main className="flex-1 flex flex-col w-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-12 h-12 border-3 border-white/10 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading collection...</p>
          </div>
        ) : !selectedManhwa ? (
          <CatalogView
            manhwas={filteredManhwas}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectManhwa={selectManhwa}
            onToggleFavorite={toggleFavorite}
            onSetStatus={setStatus}
          />
        ) : (
          <ReaderView
            selectedManhwa={selectedManhwa}
            manhwaDetails={manhwaDetails}
            currentChapter={currentChapter}
            currentChapterIndex={currentChapterIndex}
            readingWidth={readingWidth}
            isChapterListOpen={isChapterListOpen}
            setIsChapterListOpen={setIsChapterListOpen}
            goToPrevChapter={goToPrevChapter}
            goToNextChapter={goToNextChapter}
            onSelectChapter={handleSelectChapter}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>
    </div>
  );
}
