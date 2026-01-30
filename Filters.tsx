
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FilterState, BandScore } from '../types.js';

interface FiltersProps {
  scores: BandScore[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const MultiSelectDropdown: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}> = ({ label, options, selected, onChange, placeholder = "Select...", searchable = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(updated);
  };

  const handleSelectAll = () => onChange(options);
  const handleClear = () => onChange([]);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all text-left shadow-sm"
      >
        <span className="truncate max-w-[90%] text-slate-700 font-black">
          {selected.length === 0 
            ? <span className="text-slate-400">{placeholder}</span>
            : selected.length === 1 ? selected[0] : `${selected.length} Selected`
          }
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search options..."
                className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b border-slate-100">
            <button onClick={handleSelectAll} className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tight">Select All</button>
            <button onClick={handleClear} className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-tight">Clear</button>
          </div>

          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-slate-400 font-black">No matching options</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-slate-600 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors group"
                >
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                    {selected.includes(opt) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={selected.includes(opt) ? 'font-black text-blue-700' : 'font-black'}>{opt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Filters: React.FC<FiltersProps> = ({ scores, filters, onFilterChange, onReset }) => {
  const matchesOtherFilters = (score: BandScore, excludeKey?: keyof FilterState) => {
    const searchTerms = filters.searchQuery.toLowerCase().trim().split(/\s+/).filter(t => t !== "");
    if (searchTerms.length > 0) {
      if (!score.Search || !searchTerms.every(term => score.Search.toLowerCase().includes(term))) {
        return false;
      }
    }
    if (excludeKey !== 'Year' && filters.Year.length > 0 && !filters.Year.includes(String(score.Year))) return false;
    if (excludeKey !== 'Event' && filters.Event.length > 0 && !filters.Event.includes(score.Event)) return false;
    if (excludeKey !== 'Show_Round' && filters.Show_Round.length > 0 && !filters.Show_Round.includes(score.Show_Round)) return false;
    if (excludeKey !== 'Class' && filters.Class.length > 0 && !filters.Class.includes(score.Class)) return false;
    if (excludeKey !== 'State long' && filters["State long"].length > 0 && !filters["State long"].includes(score["State long"])) return false;
    if (excludeKey !== 'newSchools' && filters.newSchools.length > 0 && !filters.newSchools.includes(score["New School"])) return false;
    return true;
  };

  const getFilteredOptions = (scoreKey: keyof BandScore, filterKey: keyof FilterState) => {
    const validScores = scores.filter(s => matchesOtherFilters(s, filterKey));
    return Array.from(new Set(validScores.map(s => s[scoreKey]))).filter(Boolean).map(String);
  };

  const years = useMemo(() => getFilteredOptions('Year', 'Year').sort((a, b) => Number(b) - Number(a)), [scores, filters]);
  const events = useMemo(() => getFilteredOptions('Event', 'Event').sort(), [scores, filters]);
  const states = useMemo(() => getFilteredOptions('State long', 'State long').sort(), [scores, filters]);
  const schools = useMemo(() => getFilteredOptions('New School', 'newSchools').sort(), [scores, filters]);
  
  const classOrder = ["AAAA", "AAA", "AA", "A", "Open"];
  const classes = useMemo(() => getFilteredOptions('Class', 'Class').sort((a, b) => {
    const idxA = classOrder.indexOf(a);
    const idxB = classOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  }), [scores, filters]);

  const roundOrder = ["Grand Nationals Finals", "Semis", "Finals", "Prelims", "Prelims 1", "Prelims 2"];
  const rounds = useMemo(() => getFilteredOptions('Show_Round', 'Show_Round').sort((a, b) => {
    const idxA = roundOrder.indexOf(a);
    const idxB = roundOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  }), [scores, filters]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selected Criteria</span>
        <button onClick={onReset} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tight">Reset Filters</button>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Smart Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by year, event, round, or show city"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all shadow-sm font-black"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      <MultiSelectDropdown label="School Search" options={schools} selected={filters.newSchools} onChange={(val) => onFilterChange({ ...filters, newSchools: val })} placeholder="All Schools" />
      <MultiSelectDropdown label="School State" options={states} selected={filters["State long"]} onChange={(val) => onFilterChange({ ...filters, "State long": val })} placeholder="All States" />
      <MultiSelectDropdown label="Year" options={years} selected={filters.Year} onChange={(val) => onFilterChange({ ...filters, Year: val })} placeholder="All Years" />
      <MultiSelectDropdown label="Show Name" options={events} selected={filters.Event} onChange={(val) => onFilterChange({ ...filters, Event: val })} placeholder="All Shows" />
      <MultiSelectDropdown label="Show Round" options={rounds} selected={filters.Show_Round} onChange={(val) => onFilterChange({ ...filters, Show_Round: val })} placeholder="All Rounds" />
      <MultiSelectDropdown label="Class" options={classes} selected={filters.Class} onChange={(val) => onFilterChange({ ...filters, Class: val })} placeholder="All Classes" searchable={false} />
    </div>
  );
};
