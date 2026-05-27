import React, { useEffect } from 'react';
import { Trophy, Crown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useWheelActions } from '../../hooks/useWheelActions';

export const WinnerModal = () => {
  const winner = useAppStore(s => s.winner);
  const setWinner = useAppStore(s => s.setWinner);
  const winMessage = useAppStore(s => s.winMessage);
  const grandWinnerMessage = useAppStore(s => s.grandWinnerMessage);
  const autoRemoveWinner = useAppStore(s => s.autoRemoveWinner);
  const wheelType = useAppStore(s => s.wheelType);
  
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

  if (wheelType === 'mystery_box') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex sm:flex-row flex-col items-center justify-center p-4 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300 w-full max-w-4xl">
        <div className="bg-[#131120]/95 backdrop-blur-md px-6 py-4 rounded-3xl w-full shadow-[0_0_80px_rgba(245,158,11,0.3)] border border-amber-500/30 text-center flex flex-col sm:flex-row items-center gap-6">
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
                REJEITAR
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
                ACEITAR
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#1e2029] to-[#14151a] px-8 sm:px-12 py-10 rounded-3xl max-w-md w-full shadow-[0_0_80px_rgba(249,115,22,0.15)] border border-orange-500/20 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-[50px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-[50px]" />
        
        <Icon className={`mx-auto ${iconColor} mb-6 drop-shadow-[0_0_20px_${dropShadowColor}] relative z-10 animate-bounce`} size={80} />
        <p className="text-sm text-yellow-500/80 font-bold uppercase tracking-[0.3em] mb-2 relative z-10">{customMessage}</p>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-10 break-words relative z-10 drop-shadow-lg leading-tight">{winner.text}</h2>
        
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
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] text-white px-6 py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-1"
          >
            REJEITO
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
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] text-white px-6 py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-1"
          >
            ACEITO
          </button>
        </div>
      </div>
    </div>
  );
};
