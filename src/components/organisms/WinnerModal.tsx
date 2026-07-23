import React, { useEffect } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useWheelActions } from '../../hooks/useWheelActions';
import { useTranslation } from 'react-i18next';

export const WinnerModal = () => {
  const { t } = useTranslation();
  const winner = useAppStore(s => s.winner);
  const setWinner = useAppStore(s => s.setWinner);
  const winMessage = useAppStore(s => s.winMessage);
  const grandWinnerMessage = useAppStore(s => s.grandWinnerMessage);
  const autoRemoveWinner = useAppStore(s => s.autoRemoveWinner);
  const wheelType = useAppStore(s => s.wheelType);
  const racePodium = useAppStore(s => s.racePodium);
  
  const { handleRemoveItem, stopWinSound } = useWheelActions();
  
  useEffect(() => {
    return () => {
      stopWinSound();
    };
  }, [stopWinSound]);

  if (!winner || winner.isEliminated) return null;
  
  const isGrandWinner = winner.type === 'grand_winner';
  
  let customMessage = winner.message || winMessage;
  let Icon = Trophy;
  let iconColor = "text-yellow-400";
  let dropShadowColor = "rgba(250,204,21,0.5)";

  if (isGrandWinner) {
    customMessage = grandWinnerMessage;
    Icon = Crown;
    iconColor = "text-yellow-300";
    dropShadowColor = "rgba(253,224,71,0.8)";
  }

  if (wheelType === 'race') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-center transition-all animate-in slide-in-from-bottom-10 fade-in duration-500 w-full max-w-2xl px-4">
        <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl px-6 py-5 rounded-3xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.75)] text-center flex flex-col items-center gap-3 relative overflow-hidden">
            
            {/* Race finish flag pattern decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,#000_10px,#000_20px)] opacity-50"></div>
            
            <div className="flex items-center gap-3 mt-2">
               <Icon className={`${iconColor} drop-shadow-[0_0_15px_${dropShadowColor}] animate-bounce`} size={36} />
               <div>
                 <p className="text-xs text-amber-400 font-black uppercase tracking-[0.2em]">{customMessage}</p>
                 <h2 className="text-2xl font-black text-white drop-shadow-lg leading-tight uppercase italic">{winner.text}</h2>
               </div>
            </div>

            {/* Visual Podium Steps */}
            {racePodium && racePodium.length > 0 && (
              <div className="flex items-end justify-center gap-4 my-3 w-full max-w-md">
                
                {/* 2nd Place Step */}
                {racePodium[1] && (
                  <div className="flex flex-col items-center flex-1 transition-all duration-500 delay-100 animate-in slide-in-from-bottom-4">
                    <div className="text-[10px] font-black text-slate-400 mb-1 truncate max-w-[100px]" title={racePodium[1].text}>
                      {racePodium[1].text}
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center font-black text-white mb-2 text-xs shadow-md transition-transform hover:scale-110" style={{ backgroundColor: racePodium[1].color }}>
                      2
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-xl h-14 flex items-center justify-center border-t border-slate-600/40 shadow-inner">
                      <span className="font-black text-slate-300 text-sm tracking-wider">2º</span>
                    </div>
                  </div>
                )}

                {/* 1st Place Step */}
                {racePodium[0] && (
                  <div className="flex flex-col items-center flex-1 transition-all duration-500 animate-in slide-in-from-bottom-6">
                    <Trophy className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] mb-1 animate-[bounce_2s_infinite]" size={20} />
                    <div className="text-xs font-black text-yellow-400 mb-1 truncate max-w-[120px]" title={racePodium[0].text}>
                      {racePodium[0].text}
                    </div>
                    <div className="w-9 h-9 rounded-full border-2 border-yellow-400 flex items-center justify-center font-black text-slate-950 mb-2 text-sm shadow-[0_0_12px_rgba(250,204,21,0.4)] transition-transform hover:scale-110" style={{ backgroundColor: racePodium[0].color }}>
                      1
                    </div>
                    <div className="w-full bg-gradient-to-t from-amber-600 to-yellow-500 rounded-t-2xl h-20 flex items-center justify-center border-t border-yellow-300/40 shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
                      <span className="font-black text-slate-900 text-lg tracking-widest">1º</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place Step */}
                {racePodium[2] && (
                  <div className="flex flex-col items-center flex-1 transition-all duration-500 delay-200 animate-in slide-in-from-bottom-3">
                    <div className="text-[10px] font-black text-amber-600/80 mb-1 truncate max-w-[100px]" title={racePodium[2].text}>
                      {racePodium[2].text}
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center font-black text-white mb-2 text-xs shadow-md transition-transform hover:scale-110" style={{ backgroundColor: racePodium[2].color }}>
                      3
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-800 to-slate-800/80 rounded-t-xl h-10 flex items-center justify-center border-t border-slate-700/30 shadow-inner">
                      <span className="font-black text-amber-600 text-xs tracking-wider">3º</span>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Other Finishers List */}
            {racePodium && racePodium.length > 3 && (
              <div className="w-full max-w-md bg-slate-950/40 border border-slate-800/60 rounded-2xl p-2.5 mb-2 text-left">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 px-1">
                  {t('race.podium.others', 'Outros Finalistas')}
                </p>
                <div className="grid grid-cols-2 gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {racePodium.slice(3).map((racer) => (
                    <div key={racer.id} className="flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-lg border border-slate-800/30">
                      <div className="text-[9px] font-black text-slate-500 w-3.5 text-center">
                        {racer.rank}º
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: racer.color }}></div>
                      <div className="text-[11px] text-slate-300 font-medium truncate flex-1">{racer.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-row gap-3 w-full max-w-md mt-1">
              <button 
                onClick={() => {
                  stopWinSound();
                  const state = useAppStore.getState();
                  if (winner.drawId) {
                    state.setResults(prev => prev.filter(r => r.drawId !== winner.drawId));
                  }
                  setWinner(null);
                }}
                className="flex-1 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors border border-slate-700"
              >
                {t('horizonDisplay.reject')}
              </button>
              <button 
                onClick={() => {
                  stopWinSound();
                  if (isGrandWinner) {
                      const state = useAppStore.getState();
                      state.setItems(state.items.map(i => ({ ...i, enabled: true })));
                      state.setPityWeights({});
                      setWinner(null);
                  } else {
                      if (autoRemoveWinner) {
                        handleRemoveItem(winner.id);
                      }
                      setWinner(null);
                  }
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-600"
              >
                {t('horizonDisplay.accept')}
              </button>
            </div>
        </div>
      </div>
    );
  }

  if (wheelType === 'penalty_shootout') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex sm:flex-row flex-col items-center justify-center p-4 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300 w-full max-w-4xl">
        <div className="bg-slate-950/80 backdrop-blur-xl px-6 py-5 rounded-3xl w-full shadow-[0_0_80px_rgba(16,185,129,0.25)] border border-emerald-500/40 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-left flex flex-col">
              <div className="flex items-center gap-3">
                 <Icon className={`${iconColor} drop-shadow-[0_0_10px_${dropShadowColor}] animate-bounce`} size={32} />
                 <div>
                   <p className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em]">{customMessage}</p>
                   <h2 className="text-2xl font-extrabold text-white break-words drop-shadow-lg leading-tight line-clamp-2">{winner.text}</h2>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-row gap-3">
              <button 
                onClick={() => {
                  stopWinSound();
                  const state = useAppStore.getState();
                  if (winner.drawId) {
                    state.setResults(prev => prev.filter(r => r.drawId !== winner.drawId));
                  }
                  setWinner(null);
                }}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-white px-5 py-3 rounded-xl font-black text-sm transition-all hover:-translate-y-1"
              >
                {t('horizonDisplay.reject').toUpperCase()}
              </button>
              <button 
                onClick={() => {
                  stopWinSound();
                  if (isGrandWinner) {
                      const state = useAppStore.getState();
                      state.setItems(state.items.map(i => ({ ...i, enabled: true })));
                      state.setPityWeights({});
                      setWinner(null);
                  } else {
                      if (autoRemoveWinner) {
                        handleRemoveItem(winner.id);
                      }
                      setWinner(null);
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-white px-5 py-3 rounded-xl font-black text-sm transition-all hover:-translate-y-1"
              >
                {t('horizonDisplay.accept').toUpperCase()}
              </button>
            </div>
        </div>
      </div>
    );
  }

  if (wheelType === 'mystery_box') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex sm:flex-row flex-col items-center justify-center p-4 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300 w-full max-w-4xl">
        <div className="bg-slate-950/80 backdrop-blur-xl px-6 py-5 rounded-3xl w-full shadow-[0_0_80px_rgba(245,158,11,0.25)] border border-amber-500/40 text-center flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-left sm:flex flex-col">
              <div className="flex items-center gap-3">
                 <Icon className={`${iconColor} drop-shadow-[0_0_10px_${dropShadowColor}] animate-bounce`} size={32} />
                 <div>
                   <p className="text-xs text-amber-500/80 font-bold uppercase tracking-[0.2em]">{customMessage}</p>
                   <h2 className="text-2xl font-extrabold text-white break-words drop-shadow-lg leading-tight line-clamp-2">{winner.text}</h2>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-row gap-3">
              <button 
                onClick={() => {
                  stopWinSound();
                  const state = useAppStore.getState();
                  if (winner.drawId) {
                    state.setResults(prev => prev.filter(r => r.drawId !== winner.drawId));
                  }
                  setWinner(null);
                }}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-white px-5 py-3 rounded-xl font-black text-sm transition-all hover:-translate-y-1"
              >
                {t('horizonDisplay.reject').toUpperCase()}
              </button>
              <button 
                onClick={() => {
                  stopWinSound();
                  if (isGrandWinner) {
                      const state = useAppStore.getState();
                      state.setItems(state.items.map(i => ({ ...i, enabled: true })));
                      state.setPityWeights({});
                      setWinner(null);
                  } else {
                      if (autoRemoveWinner) {
                        handleRemoveItem(winner.id);
                      }
                      setWinner(null);
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-white px-5 py-3 rounded-xl font-black text-sm transition-all hover:-translate-y-1"
              >
                {t('horizonDisplay.accept').toUpperCase()}
              </button>
            </div>
        </div>
      </div>
    );
  }

  if (wheelType === 'horizon') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-slate-950/85 px-8 sm:px-12 py-12 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_100px_rgba(245,158,11,0.25)] border border-slate-800/80 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-amber-500/5 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-fuchsia-500/5 blur-[60px] pointer-events-none" />
        
        <Icon className={`mx-auto ${iconColor} mb-6 drop-shadow-[0_0_25px_${dropShadowColor}] relative z-10 animate-[bounce_2s_infinite]`} size={90} />
        <p className="text-sm text-amber-500/90 font-black uppercase tracking-[0.4em] mb-4 relative z-10 drop-shadow-md">{customMessage}</p>
        <h2 className="text-4xl sm:text-6xl font-black text-white mb-12 break-words relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight">{winner.text}</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center relative z-10">
          <button 
            onClick={() => {
              stopWinSound();
              // Rejeitado: removemos do historico para que nao seja contabilizado
              const state = useAppStore.getState();
              if (winner.drawId) {
                state.setResults(prev => prev.filter(r => r.drawId !== winner.drawId));
              }
              setWinner(null);
            }}
            className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-red-600 hover:to-rose-700 text-slate-300 hover:text-white px-6 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(239,68,68,0.4)] border border-slate-800 hover:border-red-500/50"
          >
            {t('horizonDisplay.reject').toUpperCase()}
          </button>
          <button 
            onClick={() => {
              stopWinSound();
              // Aceitado: fluxo normal
              if (isGrandWinner) {
                  const state = useAppStore.getState();
                  state.setItems(state.items.map(i => ({ ...i, enabled: true })));
                  state.setPityWeights({});
                  setWinner(null);
              } else {
                  if (autoRemoveWinner) {
                    handleRemoveItem(winner.id);
                  }
                  setWinner(null);
              }
            }}
            className="flex-1 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] text-white px-6 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:-translate-y-1 border-b-4 border-orange-700 hover:border-orange-600 active:translate-y-1 active:border-b-0"
          >
            {t('horizonDisplay.accept').toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
