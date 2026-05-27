import React, { useState, useMemo } from 'react';
import { Trophy, Crown, Download, AlertCircle, Trash2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { ResultItem } from '../../molecules/ResultItem';
import { Button } from '../../atoms/Button';

export const ResultsTab = () => {
  const results = useAppStore(s => s.results);
  const setResults = useAppStore(s => s.setResults);
  const [activeTab, setActiveTab] = useState<'historico' | 'ranking' | 'importar'>('historico');
  const [importText, setImportText] = useState('');

  const exportResults = () => {
    if (results.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Posição,Text,Status,ID_do_Sorteio\n"
      + results.map((r, i) => `${results.length - i},"${r.text.replace(/"/g, '""')}","${r.type || 'winner'}","${r.drawId}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_roleta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rankings = useMemo(() => {
    const counts = new Map<string, { name: string; wins: number }>();
    
    results.forEach(res => {
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
  }, [results]);

  const handleImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l);
    if (!lines.length) return;

    const newResults = lines.map(name => ({
      id: crypto.randomUUID(),
      text: name,
      weight: 1,
      enabled: true,
      drawId: `imported-${crypto.randomUUID()}`,
      type: 'winner' as const,
    }));

    setResults(prev => [...prev, ...newResults]);
    setImportText('');
    setActiveTab('historico');
  };

  const handleClearResults = () => {
    setResults([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex w-full mb-4 bg-[#1a1b23] rounded-lg p-1 shrink-0 border border-slate-800">
        <button 
          onClick={() => setActiveTab('historico')}
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-all ${activeTab === 'historico' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Histórico
        </button>
        <button 
          onClick={() => setActiveTab('ranking')}
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-all ${activeTab === 'ranking' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Ranking
        </button>
        <button 
          onClick={() => setActiveTab('importar')}
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-all ${activeTab === 'importar' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Importar
        </button>
      </div>

      {activeTab === 'historico' && (
        <>
          <div className="flex justify-between items-center mb-3 shrink-0 px-1">
            <span className="text-sm font-medium text-slate-400">Resultados</span>
            <div className="flex gap-3">
              {results.length > 0 && (
                <button onClick={exportResults} className="text-xs text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider font-bold">Exportar</button>
              )}
              {results.length > 0 && (
                <button onClick={handleClearResults} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-bold">Limpar</button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-0 pb-4">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                <Trophy size={48} className="mb-4" />
                <p className="text-center text-sm">Gire a roleta para ver<br/>os resultados aqui.</p>
              </div>
            ) : (
              results.map((result, index) => {
                const originalIndex = results.length - results.findIndex(r => r.drawId === result.drawId);
                return (
                  <ResultItem key={result.drawId} result={result} index={originalIndex} />
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'ranking' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-0 pb-4">
          <div className="flex justify-between items-center mb-3 shrink-0 px-1">
            <span className="text-sm font-medium text-slate-400">Classificação</span>
          </div>
          {rankings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
              <Crown size={48} className="mb-4" />
              <p className="text-center text-sm">Nenhum ranking disponível.</p>
            </div>
          ) : (
            rankings.map((user, idx) => (
              <div key={user.name} className="bg-slate-800/60 flex items-center justify-between p-3 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shrink-0
                    ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                      idx === 1 ? 'bg-slate-300/20 text-slate-300' : 
                      idx === 2 ? 'bg-amber-600/20 text-amber-500' : 
                      'bg-slate-700 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-white font-medium truncate">{user.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-400 leading-none">{user.wins} Vitór{user.wins !== 1 ? 'ias' : 'ia'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'importar' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar min-h-0 text-slate-300 pb-4">
          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-sm font-semibold text-slate-400 mb-2 block">
              Colar nomes (1 vencedor por linha)
            </label>
            <textarea
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600"
              placeholder="Maria Silva&#10;João S.&#10;Ana Pereira"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>

          <div className="shrink-0 space-y-4">
            <Button onClick={handleImport} disabled={!importText.trim()} className="w-full gap-2">
              <Download size={18} /> Importar aos Resultados
            </Button>
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200">
                A importação adicionará estes nomes aos <b>Resultados</b> e computará para o <b>Ranking</b> geral.
              </p>
            </div>

            {results.length > 0 && (
              <Button variant="danger" onClick={handleClearResults} className="w-full gap-2 mt-4 opacity-80 hover:opacity-100">
                <Trash2 size={18} /> Limpar Histórico Atual
              </Button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};


