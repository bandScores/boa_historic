
import React, { useState, useMemo } from 'react';
import { BandScore, SortDirection } from '../types.js';
import { DISPLAY_COLUMNS } from '../constants.js';

interface ScoreTableProps {
  scores: BandScore[];
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ scores }) => {
  const [sortKey, setSortKey] = useState<keyof BandScore>('ID');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const sortedScores = useMemo(() => {
    return [...scores].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }
      const primaryResult = sortDir === 'asc' ? comparison : -comparison;
      if (primaryResult === 0 && sortKey !== 'Year') {
        return b.Year - a.Year;
      }
      return primaryResult;
    });
  }, [scores, sortKey, sortDir]);

  const handleSort = (key: keyof BandScore) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'Year' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (key: keyof BandScore) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' 
      ? <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
  };

  const getPropertyKeyFromLabel = (label: string): keyof BandScore => {
    switch (label) {
      case 'Show Name': return 'Event';
      case 'Show Round': return 'Show_Round';
      case 'School': return 'New School';
      default: return label as keyof BandScore;
    }
  };

  return (
    <div className="w-full">
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-slate-100 overflow-visible">
        <table className="w-full text-left border-separate border-spacing-0 table-auto">
          <thead>
            <tr className="bg-slate-50">
              {DISPLAY_COLUMNS.map(col => {
                const key = getPropertyKeyFromLabel(col);
                return (
                  <th key={col} onClick={() => handleSort(key)} className="sticky top-[56px] z-30 px-2 lg:px-3 py-2 text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-1">{col} {getSortIcon(key)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedScores.map((score, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800">{score.Year}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800 truncate max-w-[120px] lg:max-w-[200px]">{score.Event}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800">{score.Show_Round}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800 truncate max-w-[150px] lg:max-w-[250px]">{score["New School"]}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800">{score.Total.toFixed(3)}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 text-[10px] font-bold">{score.Class}</span></td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800 text-center">{score["Place:Class"]}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800 text-center">{score["Place:Panel"]}</td>
                <td className="px-2 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold text-slate-800 text-center">{score["Place:Overall"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-1.5">
        {sortedScores.map((score, idx) => (
          <div key={idx} className="bg-white px-2.5 py-2 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center gap-2 leading-none mb-0.5">
              <h4 className="font-black text-slate-900 text-sm truncate flex-1">{score["New School"]}</h4>
              <div className="text-sm font-black text-slate-900 shrink-0">{score.Total.toFixed(3)}</div>
            </div>
            <div className="flex items-start gap-2 leading-tight mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase shrink-0">{score.Year}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex-1 break-words">{score.Event}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase shrink-0">Class: {score.Class}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1.5 border-t border-slate-50">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight mr-1 whitespace-nowrap">{score.Show_Round}</span>
              <div className="flex flex-wrap items-center gap-1">
                {score["Place:Overall"] !== '-' && <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-black text-blue-700 whitespace-nowrap"><span className="text-blue-400 opacity-70">Overall:</span>#{score["Place:Overall"]}</span>}
                {score["Place:Class"] !== '-' && <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-black text-emerald-700 whitespace-nowrap"><span className="text-emerald-400 opacity-70">Class:</span>#{score["Place:Class"]}</span>}
                {score["Place:Panel"] !== '-' && <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 border border-amber-100 rounded text-[9px] font-black text-amber-700 whitespace-nowrap"><span className="text-amber-500 opacity-70">Panel:</span>#{score["Place:Panel"]}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedScores.length === 0 && (
        <div className="bg-white p-8 text-center rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-sm font-black uppercase tracking-tight">No results found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
