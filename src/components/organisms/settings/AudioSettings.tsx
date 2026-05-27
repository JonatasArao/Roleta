import React, { useState } from "react";
import { PlayCircle, Trash2, Plus, Music2 } from "lucide-react";
import { Toggle } from "../../atoms/Toggle";
import { useAppStore } from "../../../store/useAppStore";
import { useAudioActions } from "../../../hooks/useAppActions";
import { playTickSound, playWinSound, playFailureSound } from "../../../utils/audioEngine";

export const AudioSettings = () => {
  const soundEnabled = useAppStore(s => s.soundEnabled);
  const setSoundEnabled = useAppStore(s => s.setSoundEnabled);
  const masterVolume = useAppStore(s => s.masterVolume);
  const setMasterVolume = useAppStore(s => s.setMasterVolume);
  const tickSoundType = useAppStore(s => s.tickSoundType);
  const setTickSoundType = useAppStore(s => s.setTickSoundType);
  const spinSoundMode = useAppStore(s => s.spinSoundMode);
  const setSpinSoundMode = useAppStore(s => s.setSpinSoundMode);
  const customTickAudios = useAppStore(s => s.customTickAudios);
  const winSoundType = useAppStore(s => s.winSoundType);
  const setWinSoundType = useAppStore(s => s.setWinSoundType);
  const eliminationSoundType = useAppStore(s => s.eliminationSoundType);
  const setEliminationSoundType = useAppStore(s => s.setEliminationSoundType);
  const eliminationMode = useAppStore(s => s.eliminationMode);
  const customWinAudios = useAppStore(s => s.customWinAudios);
  const setIsAddAudioModalOpen = useAppStore(s => s.setIsAddAudioModalOpen);

  const { removeCustomAudio } = useAudioActions();

  const [activeTab, setActiveTab] = useState<'roleta' | 'vencedor' | 'eliminacao'>('roleta');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center bg-[#252733] border border-slate-700 p-4 rounded-xl">
        <h3 className="font-bold text-white flex items-center gap-3">
          Som do Sorteio
        </h3>
        <Toggle enabled={soundEnabled} onChange={setSoundEnabled} />
      </div>

      <div className={`space-y-6 transition-opacity ${!soundEnabled && "opacity-50 pointer-events-none"}`}>
        <div className="bg-[#252733] border border-slate-700 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">
              Volume Principal
            </label>
            <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-300">
              {masterVolume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="bg-[#252733] border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-700/50 bg-[#1e2029]">
            <button
              onClick={() => setActiveTab('roleta')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'roleta' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#252733]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#252733]'}`}
            >
              Som da Roleta
            </button>
            <button
              onClick={() => setActiveTab('vencedor')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'vencedor' ? 'text-blue-400 border-b-2 border-blue-500 bg-[#252733]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#252733]'}`}
            >
              Som de Vitória
            </button>
            {eliminationMode && (
              <button
                onClick={() => setActiveTab('eliminacao')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'eliminacao' ? 'text-red-400 border-b-2 border-red-500 bg-[#252733]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#252733]'}`}
              >
                Som de Eliminação
              </button>
            )}
          </div>

          <div className="p-5">
            {activeTab === 'roleta' && (
              <div className="space-y-6 animate-in slide-in-from-left-2 fade-in">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Sons Padrão
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {[
                      "click",
                      "beep",
                      "pop",
                      "madeira",
                      "metal",
                      "synth",
                      "drum",
                      "bambu",
                      "vidro",
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTickSoundType(type);
                          playTickSound(0.5, type, null, masterVolume / 100);
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${tickSoundType === type ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#252733]" : "bg-[#14151a] text-slate-400 hover:bg-slate-800 border border-slate-700/50"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Áudios Personalizados
                    </label>
                    <button
                      onClick={() => setIsAddAudioModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Plus size={14} /> Novo Áudio
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar bg-[#14151a] rounded-lg border border-slate-700 p-2">
                    {customTickAudios.map((audio) => (
                      <div
                        key={audio.id}
                        className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${tickSoundType === audio.id ? "bg-blue-600/20 border-blue-500/50" : "bg-[#1e2029] border-slate-700 hover:border-slate-600"}`}
                      >
                        <div
                          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer group"
                          onClick={() => setTickSoundType(audio.id)}
                        >
                          <button
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${tickSoundType === audio.id ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (audio.audioObj) {
                                (audio.audioObj.cloneNode() as HTMLAudioElement)
                                  .play()
                                  .catch(() => {});
                              }
                            }}
                          >
                            <PlayCircle size={16} />
                          </button>
                          <div className="flex flex-col overflow-hidden">
                            <span className={`text-sm truncate ${tickSoundType === audio.id ? "text-blue-300 font-medium" : "text-slate-300"}`}>
                              {audio.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {audio.isFile ? 'Arquivo Local' : 'URL Externa'} 
                              {audio.mode === 'continuous' ? ' • Música de Fundo' : ' • Bate e Volta'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomAudio("tick", audio.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors shrink-0"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {customTickAudios.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-500 space-y-2">
                        <Music2 size={24} className="opacity-50" />
                        <p className="text-xs italic">Nenhum áudio personalizado adicionado.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'vencedor' && (
              <div className="space-y-6 animate-in slide-in-from-right-2 fade-in">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Sons Padrão
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {[
                      "tada",
                      "fanfarra",
                      "sino",
                      "harpa",
                      "magia",
                      "orquestra",
                      "aplausos-suaves",
                      "aplausos-fortes",
                      "trombeta",
                      "sino-vitoria",
                      "surpresa",
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setWinSoundType(type);
                          playWinSound(0.6, type, null, masterVolume / 100);
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${winSoundType === type ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#252733]" : "bg-[#14151a] text-slate-400 hover:bg-slate-800 border border-slate-700/50"}`}
                      >
                        {type.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Áudios Personalizados
                    </label>
                    <button
                      onClick={() => setIsAddAudioModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Plus size={14} /> Novo Áudio
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar bg-[#14151a] rounded-lg border border-slate-700 p-2">
                    {customWinAudios.map((audio) => (
                      <div
                        key={audio.id}
                        className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${winSoundType === audio.id ? "bg-blue-600/20 border-blue-500/50" : "bg-[#1e2029] border-slate-700 hover:border-slate-600"}`}
                      >
                        <div
                          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer group"
                          onClick={() => setWinSoundType(audio.id)}
                        >
                          <button
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${winSoundType === audio.id ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (audio.audioObj) {
                                audio.audioObj.currentTime = 0;
                                audio.audioObj.play().catch(() => {});
                              }
                            }}
                          >
                            <PlayCircle size={16} />
                          </button>
                          <div className="flex flex-col overflow-hidden">
                            <span className={`text-sm truncate ${winSoundType === audio.id ? "text-blue-300 font-medium" : "text-slate-300"}`}>
                              {audio.name}
                            </span>
                            <span className="text-[10px] text-slate-500">{audio.isFile ? 'Arquivo Local' : 'URL Externa'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomAudio("win", audio.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-md transition-colors shrink-0"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {customWinAudios.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-500 space-y-2">
                        <Music2 size={24} className="opacity-50" />
                        <p className="text-xs italic">Nenhum áudio personalizado adicionado.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'eliminacao' && eliminationMode && (
              <div className="space-y-6 animate-in slide-in-from-right-2 fade-in">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Sons Padrão de Eliminação
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "failure",
                      "buzzer",
                      "sad_trombone",
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setEliminationSoundType(type);
                          playFailureSound(masterVolume / 100, type, null);
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${eliminationSoundType === type ? "bg-red-600 text-white shadow-md ring-2 ring-red-500/50 ring-offset-2 ring-offset-[#252733]" : "bg-[#14151a] text-slate-400 hover:bg-slate-800 border border-slate-700/50"}`}
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Áudios Personalizados (Partilhados com Vitória)
                    </label>
                  </div>
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar bg-[#14151a] rounded-lg border border-slate-700 p-2">
                    {customWinAudios.map((audio) => (
                      <div
                        key={audio.id}
                        className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${eliminationSoundType === audio.id ? "bg-red-600/20 border-red-500/50" : "bg-[#1e2029] border-slate-700 hover:border-slate-600"}`}
                      >
                        <div
                          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer group"
                          onClick={() => setEliminationSoundType(audio.id)}
                        >
                          <button
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${eliminationSoundType === audio.id ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (audio.audioObj) {
                                audio.audioObj.currentTime = 0;
                                audio.audioObj.play().catch(() => {});
                              }
                            }}
                          >
                            <PlayCircle size={16} />
                          </button>
                          <div className="flex flex-col overflow-hidden">
                            <span className={`text-sm truncate ${eliminationSoundType === audio.id ? "text-red-300 font-medium" : "text-slate-300"}`}>
                              {audio.name}
                            </span>
                            <span className="text-[10px] text-slate-500">{audio.isFile ? 'Arquivo Local' : 'URL Externa'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {customWinAudios.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-500 space-y-2">
                        <Music2 size={24} className="opacity-50" />
                        <p className="text-xs italic">Nenhum áudio configurado.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

