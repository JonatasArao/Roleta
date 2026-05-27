import React, { useState, useRef } from "react";
import { X, Upload, Plus, Music, PlayCircle } from "lucide-react";
import { useAudioActions } from "../../../hooks/useAppActions";

interface AddAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAudioModal: React.FC<AddAudioModalProps> = ({ isOpen, onClose }) => {
  const { addCustomAudio } = useAudioActions();

  const [inputType, setInputType] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const [categories, setCategories] = useState<("tick" | "win")[]>(["tick"]);
  const [mode, setMode] = useState<"tick" | "continuous">("tick");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor, digite um nome para o áudio.");
      return;
    }
    if (categories.length === 0) {
      alert("Por favor, selecione onde o áudio será usado (Roleta, Vitória ou Ambos).");
      return;
    }

    if (inputType === "file") {
      if (!file) {
        alert("Por favor, selecione um arquivo.");
        return;
      }
      addCustomAudio(categories, file, name.trim(), true, mode);
    } else {
      if (!url.trim()) {
        alert("Por favor, cole uma URL válida.");
        return;
      }
      addCustomAudio(categories, url.trim(), name.trim(), false, mode);
    }

    onClose();
    // Reset state
    setFile(null);
    setUrl("");
    setName("");
    setCategories(["tick"]);
    setMode("tick");
    setInputType("file");
  };

  const toggleCategory = (cat: "tick" | "win") => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1b23] border border-slate-700 w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-[#22242f]">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Music size={18} className="text-blue-400" /> Adicionar Áudio Personalizado
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Onde usar */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Onde deseja usar este áudio?</label>
            <div className="flex gap-3">
              <button
                onClick={() => toggleCategory("tick")}
                className={`flex-1 py-2 rounded-lg text-sm border font-medium transition-all ${
                  categories.includes("tick")
                    ? "bg-blue-600/20 text-blue-400 border-blue-500"
                    : "bg-[#252733] text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                Giro da Roleta
              </button>
              <button
                onClick={() => toggleCategory("win")}
                className={`flex-1 py-2 rounded-lg text-sm border font-medium transition-all ${
                  categories.includes("win")
                    ? "bg-blue-600/20 text-blue-400 border-blue-500"
                    : "bg-[#252733] text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                Vitória
              </button>
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-red-400">Selecione pelo menos uma opção.</p>
            )}
          </div>

          {/* Modo do som (Apenas para Roleta) */}
          {categories.includes("tick") && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
              <label className="text-sm font-medium text-slate-300">
                Comportamento (Giro da Roleta)
              </label>
              <div className="flex bg-[#252733] p-1 rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setMode("tick")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === "tick" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Bate e Volta (Ponteiro)
                </button>
                <button
                  onClick={() => setMode("continuous")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === "continuous" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Música de Fundo
                </button>
              </div>
            </div>
          )}

          {/* Nome do Áudio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome do Áudio</label>
            <input
              type="text"
              placeholder="Ex: Efeito Super Mario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#252733] text-sm text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Fonte do Áudio */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-600 group-hover:border-blue-400 transition-colors">
                  {inputType === "file" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={inputType === "file"}
                  onChange={() => setInputType("file")}
                />
                Enviar Arquivo
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-600 group-hover:border-blue-400 transition-colors">
                  {inputType === "url" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={inputType === "url"}
                  onChange={() => setInputType("url")}
                />
                Copiar URL Direta
              </label>
            </div>

            {inputType === "file" ? (
              <div
                className="bg-[#252733] border-2 border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!name) setName(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                />
                <Upload size={24} className="text-slate-400 mb-2" />
                {file ? (
                  <span className="text-sm font-medium text-blue-400 text-center truncate w-full px-2">
                    {file.name}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Clique para selecionar MP3 / WAV</span>
                )}
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://exemplo.com/audio.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#252733] text-sm text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-[#22242f] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
