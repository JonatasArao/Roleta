import React, { useState, useMemo } from 'react';
import { X, ListOrdered, Trophy, Download, AlertCircle, Trash2, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ResultItem } from '../molecules/ResultItem';
import { Button } from '../atoms/Button';

export const ResultsModal = () => {
  const isResultsModalOpen = useAppStore(s => s.isResultsModalOpen);
  const setIsResultsModalOpen = useAppStore(s => s.setIsResultsModalOpen);
  const results = useAppStore(s => s.results);
  const setResults = useAppStore(s => s.setResults);

  const [activeTab, setActiveTab] = useState<'historico' | 'ranking' | 'importar'>('historico');
  const [customStartDraw, setCustomStartDraw] = useState('');
  const [customEndDraw, setCustomEndDraw] = useState('');
  const [customInterval, setCustomInterval] = useState('10');
  const [importText, setImportText] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

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
    
    if (results.length > intervalSize) {
      options.push({
        label: `Últimos ${intervalSize}`,
        start: Math.max(1, results.length - intervalSize + 1),
        end: results.length
      });
    }

    const chunks = Math.ceil(results.length / intervalSize);
    for (let i = 0; i < chunks; i++) {
      const start = i * intervalSize + 1;
      const end = Math.min((i + 1) * intervalSize, results.length);
      options.push({
        label: `${start}-${end}`,
        start,
        end
      });
    }
    return options;
  }, [results.length, customInterval]);

  const filteredResults = useMemo(() => {
    let start = parseInt(customStartDraw, 10);
    let end = parseInt(customEndDraw, 10);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    
    return results.filter((r, i) => {
      const originalIndex = results.length - i;
      if (!isNaN(min) && originalIndex < min) return false;
      if (!isNaN(max) && originalIndex > max) return false;
      return true;
    });
  }, [results, customStartDraw, customEndDraw]);

  const rankings = useMemo(() => {
    const counts = new Map<string, { name: string; wins: number }>();
    
    filteredResults.forEach(res => {
      const name = res.text;
      if (!counts.has(name)) {
        counts.set(name, { name, wins: 0 });
      }
      const data = counts.get(name)!;
      if (res.type === 'winner' || res.type === 'grand_winner' || !res.type) {
        data.wins++;
      }
    });

    return Array.from(counts.values()).sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });
  }, [filteredResults]);

  if (!isResultsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl max-h-[90vh] h-full bg-[#1a1b23] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
              <Trophy size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Resultados da Roleta</h2>
              <p className="text-sm text-slate-400 mt-0.5">Histórico, classificação e importação</p>
            </div>
          </div>
          <button 
            onClick={() => setIsResultsModalOpen(false)}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex w-full bg-slate-900/50 border-b border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('historico')}
            className={`flex-1 min-w-[150px] text-sm font-semibold py-3.5 transition-all border-b-2 ${activeTab === 'historico' ? 'text-white border-blue-500 bg-blue-500/10 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.1)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/80'}`}
          >
            Histórico de Sorteios
          </button>
          <button 
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 min-w-[150px] text-sm font-semibold py-3.5 transition-all border-b-2 ${activeTab === 'ranking' ? 'text-white border-blue-500 bg-blue-500/10 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.1)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/80'}`}
          >
            Classificação (Ranking)
          </button>
          <button 
            onClick={() => setActiveTab('importar')}
            className={`flex-1 min-w-[150px] text-sm font-semibold py-3.5 transition-all border-b-2 ${activeTab === 'importar' ? 'text-white border-blue-500 bg-blue-500/10 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.1)]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/80'}`}
          >
            Importar Resultados
          </button>
        </div>

        <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          
          {(activeTab === 'historico' || activeTab === 'ranking') && (
            <div className="flex flex-col pb-2 border-b border-slate-800/50 shrink-0 relative z-20">
              <button 
                onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                className="flex items-center justify-between w-full py-2 px-1 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ListOrdered size={18} />
                  <span className="text-sm font-medium">Filtrar Sorteios</span>
                </div>
                {isFilterCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>

              {!isFilterCollapsed && (
                <div className="flex flex-col gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800 mt-2 shadow-inner">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-row flex-wrap sm:flex-col gap-3 sm:w-48 shrink-0">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs font-medium text-slate-400 flex-1">Agrupar por:</label>
                        <input 
                          type="number" 
                          min="1"
                          value={customInterval}
                          onChange={(e) => setCustomInterval(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 w-16 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs font-medium text-slate-400 flex-1">Início:</label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="20"
                          value={customStartDraw}
                          onChange={(e) => setCustomStartDraw(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 w-16 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs font-medium text-slate-400 flex-1">Fim:</label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="30"
                          value={customEndDraw}
                          onChange={(e) => setCustomEndDraw(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 w-16 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-1">
                      {quickSelects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {quickSelects.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCustomStartDraw(opt.start.toString());
                                setCustomEndDraw(opt.end.toString());
                              }}
                              className="px-2 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {results.length > 0 && (
                        <div className="flex flex-col">
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
                            {Array.from({ length: results.length }).map((_, i) => {
                              const index = i + 1;
                              const res = results[results.length - index];
                              const selected = isBoxSelected(index);
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleBoxClick(index)}
                                  className={`w-4 h-4 rounded-[3px] transition-all duration-200 ${
                                    selected 
                                      ? 'ring-1 ring-blue-500 ring-offset-1 ring-offset-slate-900 scale-110 opacity-100 z-10 shadow-sm' 
                                      : 'opacity-40 hover:opacity-100 hover:scale-105'
                                  }`}
                                  style={{ 
                                    backgroundColor: res.color || '#4a72ff'
                                  }}
                                  title={`Sorteio ${index}: ${res.text}`}
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
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-center mb-3 shrink-0 px-1">
                <span className="text-sm font-medium text-slate-400">
                  Exibindo {filteredResults.length} resultado(s)
                </span>
                <div className="flex gap-3">
                  {results.length > 0 && (
                    <button onClick={exportResults} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-semibold flex items-center gap-1">
                      <Download size={16} /> Exportar CSV
                    </button>
                  )}
                  {results.length > 0 && (
                    <button onClick={handleClearResults} className="text-sm text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-1">
                      <Trash2 size={16} /> Limpar Tudo
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-3 pb-2 min-h-[200px] flex flex-col">
                {filteredResults.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-70">
                    <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                      <ListOrdered size={48} className="text-slate-600" />
                    </div>
                    <p className="text-lg">Nenhum resultado encontrado para este filtro.</p>
                  </div>
                ) : (
                  filteredResults.map((result, i) => {
                    const originalIndex = results.length - results.findIndex(r => r.drawId === result.drawId);
                    const dateLabel = result.timestamp ? new Date(result.timestamp).toLocaleDateString('pt-BR') : 'Data desconhecida';
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
            <div className="flex-1 space-y-3 pb-2 min-h-[200px] flex flex-col">
              {rankings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-70">
                  <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                    <Crown size={48} className="text-slate-600" />
                  </div>
                  <p className="text-lg">Nenhum ranking disponível.</p>
                </div>
              ) : (
                rankings.map((user, idx) => (
                  <div key={user.name} className="bg-slate-800/40 hover:bg-slate-800/70 transition-colors flex items-center justify-between p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shrink-0 shadow-inner
                        ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950' : 
                          idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' : 
                          idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-50' : 
                          'bg-slate-700/80 text-slate-300 border border-slate-600'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-white font-semibold text-lg truncate tracking-wide">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-right">
                        <p className="text-sm font-bold text-emerald-400">{user.wins} Vitór{user.wins !== 1 ? 'ias' : 'ia'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'importar' && (
            <div className="flex-1 flex flex-col gap-6 text-slate-300 pb-2">
              <div className="flex-1 flex flex-col min-h-[250px]">
                <label className="text-base font-semibold text-slate-300 mb-3 block">
                  Adicionar vencedores manualmente
                </label>
                <div className="flex-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700 shadow-inner">
                  <textarea
                    className="w-full h-full bg-transparent p-3 text-sm text-white resize-none focus:outline-none placeholder-slate-600 custom-scrollbar"
                    placeholder="Cole aqui os nomes (um por linha)...&#10;Opcionalmente inclua a data.&#10;&#10;Maria Silva&#10;João S., 12/05/2023&#10;Ana Pereira 12/05/2023"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="shrink-0 space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-200/90 leading-relaxed">
                    A importação adicionará estes nomes aos <b>Resultados</b> do aplicativo. Eles também serão computados no <b>Ranking</b>. <br/>Dica: Você pode colar os dados exportados via CSV para importar os resultados com datas e status.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {results.length > 0 ? (
                    <Button variant="danger" onClick={handleClearResults} className="w-full gap-2 py-3 rounded-xl border border-red-500/30">
                      <Trash2 size={18} /> Limpar Tudo
                    </Button>
                  ) : <div></div>}
                  <Button onClick={handleImport} disabled={!importText.trim()} className="w-full gap-2 py-3 rounded-xl shadow-lg">
                    <Download size={18} /> Importar Resultados
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
