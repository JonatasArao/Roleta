import React from 'react';
import { Sparkles, Clock, Trash2, Skull, Crown } from 'lucide-react';
import { Toggle } from '../../atoms/Toggle';
import { Input } from '../../atoms/Input';
import { useAppStore } from '../../../store/useAppStore';

export const GeneralSettings = () => {
  const title = useAppStore(s => s.title);
  const setTitle = useAppStore(s => s.setTitle);
  const winMessage = useAppStore(s => s.winMessage);
  const setWinMessage = useAppStore(s => s.setWinMessage);
  const eliminationMessage = useAppStore(s => s.eliminationMessage);
  const setEliminationMessage = useAppStore(s => s.setEliminationMessage);
  const grandWinnerMessage = useAppStore(s => s.grandWinnerMessage);
  const setGrandWinnerMessage = useAppStore(s => s.setGrandWinnerMessage);
  const spinTime = useAppStore(s => s.spinTime);
  const setSpinTime = useAppStore(s => s.setSpinTime);
  const showConfetti = useAppStore(s => s.showConfetti);
  const setShowConfetti = useAppStore(s => s.setShowConfetti);
  const autoRemoveWinner = useAppStore(s => s.autoRemoveWinner);
  const setAutoRemoveWinner = useAppStore(s => s.setAutoRemoveWinner);
  const eliminationMode = useAppStore(s => s.eliminationMode);
  const setEliminationMode = useAppStore(s => s.setEliminationMode);
  const autoContinueElimination = useAppStore(s => s.autoContinueElimination);
  const setAutoContinueElimination = useAppStore(s => s.setAutoContinueElimination);
  const pitySystemEnabled = useAppStore(s => s.pitySystemEnabled);
  const setPitySystemEnabled = useAppStore(s => s.setPitySystemEnabled);
  const eliminationSpinTime = useAppStore(s => s.eliminationSpinTime);
  const setEliminationSpinTime = useAppStore(s => s.setEliminationSpinTime);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Geral</h3>
        <div className="bg-[#252733] border border-slate-700 rounded-xl p-5 space-y-6">
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-slate-300">Nome do Sorteio</label>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Sorteio de Sexta" className="w-full bg-[#14151a] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors" />
          </div>
          
          {eliminationMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Skull size={14} /> Mensagem de Eliminação</label>
                <Input type="text" value={eliminationMessage} onChange={(e) => setEliminationMessage(e.target.value)} placeholder="Ex: ELIMINADO 💀" className="w-full bg-[#14151a] border border-slate-700 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors" />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Crown size={14} /> Mensagem do Vencedor</label>
                <Input type="text" value={grandWinnerMessage} onChange={(e) => setGrandWinnerMessage(e.target.value)} placeholder="Ex: GRANDE VENCEDOR!" className="w-full bg-[#14151a] border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors" />
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium text-slate-300">Mensagem de Vitória</label>
              <Input type="text" value={winMessage} onChange={(e) => setWinMessage(e.target.value)} placeholder="Ex: Parabéns!" className="w-full bg-[#14151a] border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Clock size={16}/> {eliminationMode ? 'Tempo da Batalha Final (1 vs 1)' : 'Tempo de Rotação'}</label>
              <span className="text-xs font-bold bg-blue-600/20 px-2 py-1 rounded text-blue-400 border border-blue-500/20">{spinTime} Segundos</span>
            </div>
            <input type="range" min="1" max="15" value={spinTime} onChange={(e) => setSpinTime(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-3" />
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">⚔️ Modo Eliminação</label>
                <p className="text-xs text-slate-500 mt-1">O sorteado não é o ganhador, ele é eliminado. A roleta continua até sobrar uma pessoa.</p>
              </div>
              <Toggle enabled={eliminationMode} onChange={setEliminationMode} />
            </div>
            {eliminationMode && (
              <>
                <div className="flex items-center justify-between pl-6 py-2 border-l-2 border-slate-700 ml-2">
                  <div>
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">Automático (Batalha Rápida)</label>
                    <p className="text-xs text-slate-500 mt-1">Continua girando automaticamente até restar 1 jogador.</p>
                  </div>
                  <Toggle enabled={autoContinueElimination} onChange={setAutoContinueElimination} />
                </div>
                <div className="space-y-2 pl-6 py-2 border-l-2 border-slate-700 ml-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">Tempo das Rodadas Rápidas</label>
                    <span className="text-xs font-bold bg-red-600/20 px-2 py-1 rounded text-red-400 border border-red-500/20">{eliminationSpinTime} Segundos</span>
                  </div>
                  <input type="range" min="0.5" max="10" step="0.5" value={eliminationSpinTime} onChange={(e) => setEliminationSpinTime(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 mt-3" />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">⚖️ Pesos Dinâmicos (Pity System)</label>
              <p className="text-xs text-slate-500 mt-1">Acumula pesos/chances para os participantes que não forem sorteados a cada rodada.</p>
            </div>
            <Toggle enabled={pitySystemEnabled} onChange={setPitySystemEnabled} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Sparkles size={16}/> Efeito de Confetes</label>
              <p className="text-xs text-slate-500 mt-1">Disparar chuva de confetes no ecrã quando houver um vencedor.</p>
            </div>
            <Toggle enabled={showConfetti} onChange={setShowConfetti} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Trash2 size={16}/> Auto-remover Vencedor</label>
              <p className="text-xs text-slate-500 mt-1">Remove a opção automaticamente da lista após ganhar.</p>
            </div>
            <Toggle enabled={autoRemoveWinner} onChange={setAutoRemoveWinner} />
          </div>
        </div>
      </div>
    </div>
  );
};

