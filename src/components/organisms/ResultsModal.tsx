import React, { useState, useMemo } from 'react';
import { X, ListOrdered, Trophy, Download, AlertCircle, Trash2, Crown, ChevronDown, ChevronUp, ArrowDown, ArrowUp, Flame, Clock, Search, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { ResultItem } from '../molecules/ResultItem';
import { Button } from '../atoms/Button';
import { getParticipantStats, ParticipantStat } from '../../utils/statsUtils';

const RankingItem = ({ st, index, t, i18n }: { st: ParticipantStat, index: number, t: any, i18n: any }) => {
  const [expanded, setExpanded] = useState(false);
  const isWonToday = st.hasWon && st.daysWithoutWin === 0;
  const isLongSpell = st.daysWithoutWin >= 10 || !st.hasWon;

  return (
    <div className="bg-slate-900/40 transition-colors rounded-lg border border-slate-800/80 flex flex-col shadow-sm overflow-hidden">
      <div 
        className="py-1.5 px-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/70"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border ${
            isWonToday ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' :
            isLongSpell ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
            'bg-blue-500/15 border-blue-500/30 text-blue-400'
          }`}>
            {index + 1}º
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-100 font-medium text-xs leading-tight truncate">{st.name}</span>
              {st.isOnWheel ? (
                <span className="text-[8px] leading-none font-bold px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {t('resultsModal.drySpell.activeOnWheel')}
                </span>
              ) : (
                <span className="text-[8px] leading-none font-medium px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                  {t('resultsModal.drySpell.inactive')}
                </span>
              )}
            </div>

            <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span>
                {st.hasWon && st.lastWinTimestamp 
                  ? t('resultsModal.drySpell.lastWinDate', { date: new Date(st.lastWinTimestamp).toLocaleDateString(i18n.language) })
                  : st.firstSeenTimestamp 
                  ? t('resultsModal.drySpell.firstSeen', { date: new Date(st.firstSeenTimestamp).toLocaleDateString(i18n.language) })
                  : t('resultsModal.drySpell.neverWon')}
              </span>
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="shrink-0 flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-medium block">
              {st.winsCount} {st.winsCount === 1 ? t('resultsModal.ranking.win') : t('resultsModal.ranking.wins')}
            </span>
          </div>

          <div className={`px-1.5 py-0.5 rounded border text-[9px] font-bold flex items-center gap-1 shadow-inner ${
            isWonToday 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : st.daysWithoutWin > 7 || !st.hasWon
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
          }`}>
            {isWonToday ? (
              t('resultsModal.drySpell.wonToday')
            ) : st.hasWon ? (
              <>
                <Clock size={8} />
                {t('resultsModal.drySpell.daysWithoutWin', { count: st.daysWithoutWin })}
              </>
            ) : (
              <>
                <AlertCircle size={8} />
                {st.daysWithoutWin}d
              </>
            )}
          </div>
          
          <div className="text-slate-500 ml-1">
             {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-2.5 pt-2 border-t border-slate-800/50 bg-slate-900/20">
          <div className="flex flex-col gap-2">
            {st.drawsWithoutWin > 0 && (
              <p className="text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">Jejum de sorteios:</span> {t('resultsModal.drySpell.drawsCount', { count: st.drawsWithoutWin })}
              </p>
            )}
            
            <div>
              <p className="text-[10px] font-semibold text-slate-300 mb-1.5">Histórico de vitórias:</p>
              {st.winTimestamps && st.winTimestamps.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {st.winTimestamps.map((ts: number, idx: number) => (
                    <span key={idx} title={new Date(ts).toLocaleString(i18n.language)} className="text-[9px] leading-none px-1.5 py-1 rounded bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white transition-colors cursor-default">
                      {new Date(ts).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">
                   Nenhuma vitória registrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ResultsModal = () => {
  const { t, i18n } = useTranslation();
  const isResultsModalOpen = useAppStore(s => s.isResultsModalOpen);
  const setIsResultsModalOpen = useAppStore(s => s.setIsResultsModalOpen);
  const results = useAppStore(s => s.results);
  const setResults = useAppStore(s => s.setResults);
  const items = useAppStore(s => s.items);

  const [activeTab, setActiveTab] = useState<'historico' | 'ranking' | 'importar'>('historico');
  const [filterMode, setFilterMode] = useState<'draw' | 'date'>('draw');
  const [customStartDraw, setCustomStartDraw] = useState('');
  const [customEndDraw, setCustomEndDraw] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customInterval, setCustomInterval] = useState('10');
  const [intervalOrder, setIntervalOrder] = useState<'asc' | 'desc'>('desc');
  const [importText, setImportText] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  const [drySpellSearch, setDrySpellSearch] = useState('');
  const [drySpellSort, setDrySpellSort] = useState<'longest' | 'shortest' | 'wins' | 'name'>('wins');
  const [drySpellOnlyOnWheel, setDrySpellOnlyOnWheel] = useState(false);

  const filteredResults = useMemo(() => {
    return results.filter((r, i) => {
      const originalIndex = results.length - i;
      
      if (filterMode === 'draw') {
        let start = parseInt(customStartDraw, 10);
        let end = parseInt(customEndDraw, 10);
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        
        if (!isNaN(min) && originalIndex < min) return false;
        if (!isNaN(max) && originalIndex > max) return false;
      }
      
      if (filterMode === 'date') {
        if (customStartDate && r.timestamp) {
          const itemDate = new Date(r.timestamp);
          itemDate.setHours(0, 0, 0, 0);
          const startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          
          const localStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
          if (itemDate < localStartDate) return false;
        }
        
        if (customEndDate && r.timestamp) {
          const itemDate = new Date(r.timestamp);
          itemDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customEndDate);
          endDate.setHours(0, 0, 0, 0);
          
          const localEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
          if (itemDate > localEndDate) return false;
        }
      }

      return true;
    });
  }, [results, customStartDraw, customEndDraw, customStartDate, customEndDate, filterMode]);

  const allParticipantStats = useMemo(() => {
    return getParticipantStats(items, filteredResults);
  }, [items, filteredResults]);

  const statsMap = useMemo(() => {
    const map = new Map<string, ParticipantStat>();
    allParticipantStats.forEach(st => {
      map.set(st.name.toLowerCase(), st);
    });
    return map;
  }, [allParticipantStats]);

  const longestDrySpellParticipant = useMemo(() => {
    let list = [...allParticipantStats];
    if (drySpellOnlyOnWheel) {
      list = list.filter(p => p.isOnWheel);
    }
    if (list.length === 0) return null;
    return list.sort((a, b) => b.daysWithoutWin - a.daysWithoutWin)[0];
  }, [allParticipantStats, drySpellOnlyOnWheel]);

  const averageDrySpell = useMemo(() => {
    let list = allParticipantStats;
    if (drySpellOnlyOnWheel) {
      list = list.filter(p => p.isOnWheel);
    }
    const winners = list.filter(s => s.hasWon);
    if (winners.length === 0) return 0;
    const sum = winners.reduce((acc, curr) => acc + curr.daysWithoutWin, 0);
    return Math.round((sum / winners.length) * 10) / 10;
  }, [allParticipantStats, drySpellOnlyOnWheel]);

  const neverWonCount = useMemo(() => {
    let list = allParticipantStats;
    if (drySpellOnlyOnWheel) {
      list = list.filter(p => p.isOnWheel);
    }
    return list.filter(s => !s.hasWon).length;
  }, [allParticipantStats, drySpellOnlyOnWheel]);

  const filteredDrySpellList = useMemo(() => {
    let list = [...allParticipantStats];

    if (drySpellOnlyOnWheel) {
      list = list.filter(p => p.isOnWheel);
    }

    if (drySpellSearch.trim()) {
      const q = drySpellSearch.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (drySpellSort === 'longest') {
        if (b.daysWithoutWin !== a.daysWithoutWin) return b.daysWithoutWin - a.daysWithoutWin;
        return b.drawsWithoutWin - a.drawsWithoutWin;
      }
      if (drySpellSort === 'shortest') {
        if (a.daysWithoutWin !== b.daysWithoutWin) return a.daysWithoutWin - b.daysWithoutWin;
        return a.drawsWithoutWin - b.drawsWithoutWin;
      }
      if (drySpellSort === 'wins') {
        if (b.winsCount !== a.winsCount) return b.winsCount - a.winsCount;
        return b.daysWithoutWin - a.daysWithoutWin;
      }
      if (drySpellSort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [allParticipantStats, drySpellSearch, drySpellSort, drySpellOnlyOnWheel]);

  const exportResults = () => {
    if (results.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Posição,Nome,Status,ID_do_Sorteio,Data\n"
      + results.map((r, i) => {
          const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('pt-BR') : '';
          return `${results.length - i},"${r.text.replace(/"/g, '""')}","${r.type || 'winner'}","${r.drawId}","${dateStr}"`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_roleta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l);
    if (!lines.length) return;

    const parseCSVLine = (str: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"' && str[i+1] === '"' && inQuotes) {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };

    const isCSV = lines[0].includes('Posição,Nome,Status') || lines[0].includes('Posição,Text,Status');
    const startIndex = isCSV ? 1 : 0;
    
    const newResults = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (isCSV) {
        const cols = parseCSVLine(line);
        if (cols.length >= 2) {
          const text = cols[1];
          const type = cols[2] === 'loser' ? 'loser' : 'winner';
          const drawId = cols[3] || `imported-${crypto.randomUUID()}`;
          const dateStr = cols[4];
          
          let timestamp = Date.now();
          if (dateStr) {
            const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})(?:[ ,]+(\d{2}):(\d{2}):(\d{2}))?/);
            if (parts) {
              const [_, d, m, y, h, min, s] = parts;
              timestamp = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(h || '0'), parseInt(min || '0'), parseInt(s || '0')).getTime();
            } else {
              const parsed = Date.parse(dateStr);
              if (!isNaN(parsed)) timestamp = parsed;
            }
          }

          newResults.push({
            id: crypto.randomUUID(),
            text,
            weight: 1,
            enabled: true,
            drawId,
            type,
            timestamp,
          });
        }
      } else {
        let text = line;
        let timestamp = Date.now();
        
        // Try to extract date from the end of the line (e.g. "Maria, 12/05/2023 14:30:00" or "João 12/05/2023")
        const dateMatch = line.match(/(.*?)(?:,?\s*)(\d{2}\/\d{2}\/\d{4}(?:[ ,]+\d{2}:\d{2}:\d{2})?)$/);
        
        if (dateMatch) {
          text = dateMatch[1].trim();
          const dateStr = dateMatch[2];
          const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})(?:[ ,]+(\d{2}):(\d{2}):(\d{2}))?/);
          if (parts) {
            const [_, d, m, y, h, min, s] = parts;
            timestamp = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(h || '0'), parseInt(min || '0'), parseInt(s || '0')).getTime();
          }
        }

        newResults.push({
          id: crypto.randomUUID(),
          text,
          weight: 1,
          enabled: true,
          drawId: `imported-${crypto.randomUUID()}`,
          type: 'winner' as const,
          timestamp,
        });
      }
    }

    setResults(prev => [...newResults, ...prev]);
    setImportText('');
    setActiveTab('historico');
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const isBoxSelectedByDate = (res: any) => {
    if (!customStartDate && !customEndDate) return true;
    if (!res.timestamp) return false;

    const itemDate = new Date(res.timestamp);
    itemDate.setHours(0, 0, 0, 0);
    
    if (customStartDate) {
      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      const localStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
      if (itemDate < localStartDate) return false;
    }
    
    if (customEndDate) {
      const endDate = new Date(customEndDate);
      endDate.setHours(0, 0, 0, 0);
      const localEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
      if (itemDate > localEndDate) return false;
    }
    
    return true;
  };

  const isBoxSelected = (index: number) => {
    let start = parseInt(customStartDraw, 10);
    let end = parseInt(customEndDraw, 10);
    if (isNaN(start) && isNaN(end)) {
      return true;
    }
    if (!isNaN(start) && !isNaN(end)) {
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      return index >= min && index <= max;
    }
    if (!isNaN(start)) return index === start;
    if (!isNaN(end)) return index === end;
    return false;
  };

  const handleBoxClick = (index: number) => {
    const start = parseInt(customStartDraw, 10);
    const end = parseInt(customEndDraw, 10);

    if (isNaN(start) || isNaN(end)) {
      setCustomStartDraw(index.toString());
      setCustomEndDraw(index.toString());
    } else {
      if (start === end) {
        if (index > start) {
          setCustomEndDraw(index.toString());
        } else {
          setCustomStartDraw(index.toString());
        }
      } else {
        setCustomStartDraw(index.toString());
        setCustomEndDraw(index.toString());
      }
    }
  };

  const quickSelects = useMemo(() => {
    if (results.length === 0) return [];
    const options = [];
    
    options.push({
      label: 'Todos',
      start: 1,
      end: results.length
    });

    const intervalSize = Math.max(1, parseInt(customInterval, 10) || 10);
    
    const chunks = Math.ceil(results.length / intervalSize);
    if (intervalOrder === 'asc') {
      for (let i = 0; i < chunks; i++) {
        const start = i * intervalSize + 1;
        const end = Math.min((i + 1) * intervalSize, results.length);
        options.push({
          label: `${start}-${end}`,
          start,
          end
        });
      }
    } else {
      for (let i = 0; i < chunks; i++) {
        const end = results.length - i * intervalSize;
        const start = Math.max(1, end - intervalSize + 1);
        options.push({
          label: `${end}-${start}`,
          start,
          end
        });
      }
    }
    return options;
  }, [results.length, customInterval, intervalOrder]);

  if (!isResultsModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md"
      onClick={() => setIsResultsModalOpen(false)}
    >
      <div 
        className="w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/60 bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
              <Trophy size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-tight">{t('resultsModal.title')}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t('resultsModal.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsResultsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex w-full bg-slate-950/40 border-b border-slate-800/60 shrink-0 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('historico')}
            className={`flex-1 min-w-[120px] text-xs sm:text-sm font-semibold py-3 transition-all border-b-2 ${activeTab === 'historico' ? 'text-white border-blue-500 bg-blue-500/5 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.05)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20'}`}
          >
            {t('resultsModal.tabs.history')}
          </button>
          <button 
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 min-w-[140px] sm:min-w-[150px] text-xs sm:text-sm font-semibold py-3 transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'ranking' ? 'text-amber-400 border-amber-500 bg-amber-500/5 shadow-[inset_0_-2px_10px_rgba(245,158,11,0.05)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20'}`}
          >
            <Trophy size={14} className={activeTab === 'ranking' ? "text-amber-400 shrink-0" : "text-slate-400 shrink-0"} />
            {t('resultsModal.tabs.ranking')}
          </button>
          <button 
            onClick={() => setActiveTab('importar')}
            className={`flex-1 min-w-[120px] text-xs sm:text-sm font-semibold py-3 transition-all border-b-2 ${activeTab === 'importar' ? 'text-white border-blue-500 bg-blue-500/5 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.05)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20'}`}
          >
            {t('resultsModal.tabs.import')}
          </button>
        </div>

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          
          {(activeTab === 'historico' || activeTab === 'ranking') && (
            <div className="flex flex-col pb-2 border-b border-slate-800/50 shrink-0 relative z-20">
              <button 
                onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                className="flex items-center justify-between w-full py-2 px-1 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ListOrdered size={18} />
                  <span className="text-sm font-medium">{t('resultsModal.filter.title')}</span>
                </div>
                {isFilterCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>

              {!isFilterCollapsed && (
                <div className="flex flex-col gap-3 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/80 mt-2 shadow-inner">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col gap-4 sm:w-64 shrink-0">
                      <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800/80">
                        <button 
                          onClick={() => setFilterMode('draw')}
                          className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all ${filterMode === 'draw' ? 'bg-blue-600/15 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {t('resultsModal.filter.typeDraw')}
                        </button>
                        <button 
                          onClick={() => setFilterMode('date')}
                          className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all ${filterMode === 'date' ? 'bg-blue-600/15 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {t('resultsModal.filter.typeDate')}
                        </button>
                      </div>

                      {filterMode === 'draw' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 w-full">
                            <label className="text-xs font-medium text-slate-400 flex-1">{t('resultsModal.filter.groupBy')}</label>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="number" 
                                min="1"
                                value={customInterval}
                                onChange={(e) => setCustomInterval(e.target.value)}
                                className="bg-slate-950/45 border border-slate-800 rounded-lg px-2.5 py-1 w-16 text-xs text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30"
                              />
                              <button
                                onClick={() => setIntervalOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-1.5 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                              >
                                {intervalOrder === 'asc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full">
                            <label className="text-xs font-medium text-slate-400 flex-1">{t('resultsModal.filter.start')}</label>
                            <input 
                              type="number" 
                              min="1"
                              placeholder="20"
                              value={customStartDraw}
                              onChange={(e) => setCustomStartDraw(e.target.value)}
                              className="bg-slate-950/45 border border-slate-800 rounded-lg px-2 py-1 w-28 text-xs text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 w-full">
                            <label className="text-xs font-medium text-slate-400 flex-1">{t('resultsModal.filter.end')}</label>
                            <input 
                              type="number" 
                              min="1"
                              placeholder="30"
                              value={customEndDraw}
                              onChange={(e) => setCustomEndDraw(e.target.value)}
                              className="bg-slate-950/45 border border-slate-800 rounded-lg px-2 py-1 w-28 text-xs text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30"
                            />
                          </div>
                        </div>
                      )}

                      {filterMode === 'date' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 w-full">
                            <label className="text-xs font-medium text-slate-400 flex-1">{t('resultsModal.filter.startDate')}</label>
                            <input 
                              type="date" 
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="bg-slate-950/45 border border-slate-800 rounded-lg px-2 py-1 w-28 text-xs text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark]"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 w-full">
                            <label className="text-xs font-medium text-slate-400 flex-1">{t('resultsModal.filter.endDate')}</label>
                            <input 
                              type="date" 
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="bg-slate-950/45 border border-slate-800 rounded-lg px-2 py-1 w-28 text-xs text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-1">
                      {filterMode === 'draw' && quickSelects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {quickSelects.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCustomStartDraw(opt.start.toString());
                                setCustomEndDraw(opt.end.toString());
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-950/50 text-slate-300 rounded-lg hover:bg-slate-900 hover:text-white transition-colors border border-slate-800/80"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {results.length > 0 && (
                        <div className="flex flex-col">
                          {filterMode === 'date' && (
                            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5 px-0.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                               <span>
                                 {t('resultsModal.filter.selected')} <strong className="text-white ml-1">{results.filter(r => isBoxSelectedByDate(r)).length}</strong>
                               </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 p-0.5">
                            {Array.from({ length: results.length }).map((_, i) => {
                              const index = i + 1;
                              const res = results[results.length - index];
                              const selected = filterMode === 'draw' ? isBoxSelected(index) : isBoxSelectedByDate(res);
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (filterMode === 'date') setFilterMode('draw');
                                    handleBoxClick(index);
                                  }}
                                  className={`w-4 h-4 rounded-[3px] transition-all duration-200 ${
                                    selected 
                                      ? 'ring-1 ring-blue-500 ring-offset-1 ring-offset-slate-900 scale-110 opacity-100 z-10 shadow-sm' 
                                      : 'opacity-40 hover:opacity-100 hover:scale-105'
                                  }`}
                                  style={{ 
                                    backgroundColor: res.color || '#4a72ff'
                                  }}
                                  title={`${t("resultsModal.draw")} ${index}: ${res.text}`}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-sm font-medium text-slate-400">
                  {t('resultsModal.history.showing')} {filteredResults.length} {t('resultsModal.history.results')}
                </span>
                <div className="flex gap-3">
                  {results.length > 0 && (
                    <button onClick={exportResults} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-semibold flex items-center gap-1">
                      <Download size={16} /> {t('resultsModal.history.export')}
                    </button>
                  )}
                  {results.length > 0 && (
                    <button onClick={handleClearResults} className="text-sm text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-1">
                      <Trash2 size={16} /> {t('resultsModal.history.clearAll')}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 pb-2 flex flex-col">
                {filteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-4 py-8 opacity-70">
                    <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                      <ListOrdered size={48} className="text-slate-600" />
                    </div>
                    <p className="text-lg">{t('resultsModal.history.empty')}</p>
                  </div>
                ) : (
                  filteredResults.map((result, i) => {
                    const originalIndex = results.length - results.findIndex(r => r.drawId === result.drawId);
                    const dateLabel = result.timestamp ? new Date(result.timestamp).toLocaleDateString(i18n.language) : t('resultsModal.history.unknownDate');
                    return (
                      <div key={result.drawId} className="relative group">
                        <ResultItem result={result} index={originalIndex} />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2.5 py-1.5 rounded shadow-lg border border-slate-700 pointer-events-none">
                          {dateLabel}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="flex flex-col gap-3">
              
              {/* Summary Header Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-inner">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30 text-amber-400 shrink-0">
                    <Flame size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-amber-400/90 font-medium truncate leading-tight">{t('resultsModal.drySpell.longestSpell')}</p>
                    <p className="text-sm font-bold text-white truncate leading-tight">
                      {longestDrySpellParticipant 
                        ? `${longestDrySpellParticipant.name} (${longestDrySpellParticipant.daysWithoutWin}d)` 
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center gap-2.5 hidden sm:flex">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-medium truncate leading-tight">{t('resultsModal.drySpell.averageSpell')}</p>
                    <p className="text-sm font-bold text-white truncate leading-tight">{averageDrySpell} {t('resultsModal.drySpell.daysWithoutWin', { count: averageDrySpell }).split(' ')[1] || 'dias'}</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center gap-2.5">
                  <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400 shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-medium truncate leading-tight">{t('resultsModal.drySpell.neverWonCount')}</p>
                    <p className="text-sm font-bold text-white truncate leading-tight">{neverWonCount} {t('sidebar.entries.participants')}</p>
                  </div>
                </div>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={drySpellSearch}
                    onChange={(e) => setDrySpellSearch(e.target.value)}
                    placeholder={t('resultsModal.drySpell.searchPlaceholder')}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                  />
                </div>

                <div className="flex items-center flex-wrap gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={drySpellOnlyOnWheel}
                        onChange={(e) => setDrySpellOnlyOnWheel(e.target.checked)}
                      />
                      <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 border border-slate-700/50"></div>
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium group-hover:text-white transition-colors select-none">{t('resultsModal.drySpell.onlyOnWheel')}</span>
                  </label>
                  
                  <div className="w-px h-4 bg-slate-800/80 mx-0.5 hidden sm:block"></div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">{t('resultsModal.drySpell.sortBy')}</label>
                    <select
                      value={drySpellSort}
                      onChange={(e: any) => setDrySpellSort(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500/80 [color-scheme:dark]"
                    >
                      <option value="longest">{t('resultsModal.drySpell.sortLongest')}</option>
                      <option value="shortest">{t('resultsModal.drySpell.sortShortest')}</option>
                      <option value="wins">{t('resultsModal.drySpell.sortMostWins')}</option>
                      <option value="name">{t('resultsModal.drySpell.sortName')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* List of participants */}
              <div className="space-y-2 pb-1 flex flex-col pr-1">
                {filteredDrySpellList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-3 py-8 opacity-70">
                    <Clock size={40} className="text-slate-600" />
                    <p className="text-sm">{t('resultsModal.drySpell.noParticipants')}</p>
                  </div>
                ) : (
                  filteredDrySpellList.map((st, index) => (
                    <RankingItem key={st.name} st={st} index={index} t={t} i18n={i18n} />
                  ))
                )}
              </div>

            </div>
          )}

          {activeTab === 'importar' && (
            <div className="flex flex-col gap-6 text-slate-300 pb-2">
              <div className="flex flex-col min-h-[250px]">
                <label className="text-base font-semibold text-slate-300 mb-3 block">
                  {t('resultsModal.import.title')}
                </label>
                <div className="flex-1 bg-slate-950/45 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
                  <textarea
                    className="w-full h-full bg-transparent p-3 text-sm text-white resize-none focus:outline-none placeholder-slate-600 custom-scrollbar"
                    placeholder={t('resultsModal.import.placeholder')}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="shrink-0 space-y-4">
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-200/90 leading-relaxed">
                    {t('resultsModal.import.info1')}<b>{t('sidebar.tabs.results')}</b>{t('resultsModal.import.info2')}<b>{t('resultsModal.tabs.ranking')}</b>. <br/>{t('resultsModal.import.info3')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {results.length > 0 ? (
                    <Button variant="danger" onClick={handleClearResults} className="w-full gap-2 py-3 rounded-2xl border border-red-500/20 bg-red-950/15 hover:bg-red-950/25 text-red-400">
                      <Trash2 size={18} /> {t('resultsModal.history.clearAll')}
                    </Button>
                  ) : <div></div>}
                  <Button onClick={handleImport} disabled={!importText.trim()} className="w-full gap-2 py-3 rounded-2xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/20">
                    <Download size={18} /> {t('resultsModal.import.btn')}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
