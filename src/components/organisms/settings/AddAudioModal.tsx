import React, { useState, useRef } from "react";
import { X, Upload, Plus, Music, PlayCircle } from "lucide-react";
import { useAudioActions } from "../../../hooks/useAppActions";
import { useTranslation } from "react-i18next";

interface AddAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAudioModal: React.FC<AddAudioModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
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
      alert(t("addAudioModal.alertNoName"));
      return;
    }
    if (categories.length === 0) {
      alert(t("addAudioModal.alertNoCategory"));
      return;
    }

    if (inputType === "file") {
      if (!file) {
        alert(t("addAudioModal.alertNoFile"));
        return;
      }
      addCustomAudio(categories, file, name.trim(), true, mode);
    } else {
      if (!url.trim()) {
        alert(t("addAudioModal.alertNoURL"));
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/40">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Music size={18} className="text-blue-400" /> {t('addAudioModal.title')}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Onde usar */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">{t('addAudioModal.whereToUse')}</label>
            <div className="flex gap-3">
              <button
                onClick={() => toggleCategory("tick")}
                className={`flex-1 py-2.5 rounded-xl text-sm border font-medium transition-all ${
                  categories.includes("tick")
                    ? "bg-blue-600/15 text-blue-400 border-blue-500/50 shadow-md"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                {t('addAudioModal.spin')}
              </button>
              <button
                onClick={() => toggleCategory("win")}
                className={`flex-1 py-2.5 rounded-xl text-sm border font-medium transition-all ${
                  categories.includes("win")
                    ? "bg-blue-600/15 text-blue-400 border-blue-500/50 shadow-md"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                {t('addAudioModal.win')}
              </button>
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-red-400">{t('addAudioModal.selectOption')}</p>
            )}
          </div>

          {/* Modo do som (Apenas para Roleta) */}
          {categories.includes("tick") && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
              <label className="text-sm font-medium text-slate-300">
                {t('addAudioModal.behavior')}
              </label>
              <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800/80 overflow-hidden">
                <button
                  onClick={() => setMode("tick")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === "tick" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t('addAudioModal.tickMode')}
                </button>
                <button
                  onClick={() => setMode("continuous")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === "continuous" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t('addAudioModal.musicMode')}
                </button>
              </div>
            </div>
          )}

          {/* Nome do Áudio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t('addAudioModal.audioName')}</label>
            <input
              type="text"
              placeholder={t('addAudioModal.audioNamePlh')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/45 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Fonte do Áudio */}
          <div className="space-y-3">
            <div className="flex gap-5">
              <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-600 group-hover:border-blue-400 transition-colors">
                  {inputType === "file" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={inputType === "file"}
                  onChange={() => setInputType("file")}
                />
                <span className="text-sm font-medium select-none text-slate-300 group-hover:text-slate-100 transition-colors">{t('addAudioModal.uploadFile')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-slate-600 group-hover:border-blue-400 transition-colors">
                  {inputType === "url" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={inputType === "url"}
                  onChange={() => setInputType("url")}
                />
                <span className="text-sm font-medium select-none text-slate-300 group-hover:text-slate-100 transition-colors">{t('addAudioModal.copyURL')}</span>
              </label>
            </div>

            {inputType === "file" ? (
              <div
                className="bg-slate-950/30 border-2 border-dashed border-slate-800/80 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900/40 hover:border-blue-500/50 transition-all duration-300 group/drop"
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
                <Upload size={24} className="text-slate-500 group-hover/drop:text-blue-400 mb-2 transition-colors" />
                {file ? (
                  <span className="text-sm font-semibold text-blue-400 text-center truncate w-full px-2">
                    {file.name}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 group-hover/drop:text-slate-400 transition-colors">{t('addAudioModal.clickToSelect')}</span>
                )}
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://exemplo.com/audio.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950/45 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all shadow-inner"
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors">
            {t('addAudioModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/15 transition-all active:scale-95"
          >
            {t('addAudioModal.add')}
          </button>
        </div>
      </div>
    </div>
  );
};
