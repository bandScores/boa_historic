
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FilterState, BandScore } from './types';
import { ScoreTable } from './components/ScoreTable';
import { Filters } from './components/Filters';
import { fetchScoresFromSheet } from './services/sheetService';
import { GOOGLE_SHEET_ID } from './constants';

const App: React.FC = () => {
  const [scores, setScores] = useState<BandScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(500);
  
  const [filters, setFilters] = useState<FilterState>({
    Year: [],
    Event: [],
    Show_Round: [],
    Class: [],
    searchQuery: "",
    newSchools: [],
    "State long": []
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchScoresFromSheet();
      setScores(data);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setVisibleCount(500);
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      Year: [],
      Event: [],
      Show_Round: [],
      Class: [],
      searchQuery: "",
      newSchools: [],
      "State long": []
    });
  };

  const filteredScores = useMemo(() => {
    return scores.filter(score => {
      const matchYear = filters.Year.length === 0 || filters.Year.includes(String(score.Year));
      const matchEvent = filters.Event.length === 0 || filters.Event.includes(score.Event);
      const matchRound = filters.Show_Round.length === 0 || filters.Show_Round.includes(score.Show_Round);
      const matchClass = filters.Class.length === 0 || filters.Class.includes(score.Class);
      const matchState = filters["State long"].length === 0 || filters["State long"].includes(score["State long"]);
      const matchSchools = filters.newSchools.length === 0 || filters.newSchools.includes(score["New School"]);
      
      const searchTerms = filters.searchQuery.toLowerCase().trim().split(/\s+/).filter(term => term !== "");
      const matchSearch = searchTerms.length === 0 || (
        score.Search && searchTerms.every(term => score.Search.toLowerCase().includes(term))
      );
      
      return matchYear && matchEvent && matchRound && matchClass && matchState && matchSearch && matchSchools;
    });
  }, [filters, scores]);

  const displayedScores = useMemo(() => {
    return filteredScores.slice(0, visibleCount);
  }, [filteredScores, visibleCount]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && visibleCount < filteredScores.length) {
      setVisibleCount(prev => prev + 500);
    }
  }, [visibleCount, filteredScores.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.Year.length > 0) count++;
    if (filters.Event.length > 0) count++;
    if (filters.Show_Round.length > 0) count++;
    if (filters.Class.length > 0) count++;
    if (filters.searchQuery !== "") count++;
    if (filters.newSchools.length > 0) count++;
    if (filters["State long"].length > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              </div>
              <span className="text-lg font-black tracking-tight hidden sm:block">MarchingScore<span className="text-blue-600">DB</span></span>
              <span className="text-lg font-black tracking-tight sm:hidden">MS<span className="text-blue-600">DB</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all border bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-slate-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] rounded-full bg-blue-600 text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>
              <button onClick={loadData} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-50">
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Filter Results</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{filteredScores.length} matches found</p>
            </div>
            <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <Filters scores={scores} filters={filters} onFilterChange={setFilters} onReset={resetFilters} />
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button onClick={() => setIsFilterOpen(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              Show {filteredScores.length} Results
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pb-12">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-red-900 mb-2">Connection Error</h2>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button onClick={loadData} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">Try Again</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div><h1 className="text-xl font-black text-slate-900 tracking-tight">Historic Results Explorer</h1></div>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Displaying {Math.min(visibleCount, filteredScores.length)} of {filteredScores.length} Records</h2>
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded"></div>
                <div className="h-96 bg-white border border-slate-200 rounded-xl"></div>
              </div>
            ) : (
              <>
                <ScoreTable scores={displayedScores} />
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                  {visibleCount < filteredScores.length && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <span className="text-xs font-bold uppercase tracking-widest">Loading more...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-slate-400 text-[10px]">
        <p>&copy; {new Date().getFullYear()} MarchingScoreDB. Data from live Google Sheets.</p>
        <p className="mt-1 flex justify-center gap-4">
          <a href={`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline">Source Workbook</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
