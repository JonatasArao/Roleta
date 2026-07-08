import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Maximize, Minimize, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';

export const Header = () => {
  const { t } = useTranslation();
  const title = useAppStore(s => s.title);
  const soundEnabled = useAppStore(s => s.soundEnabled);
  const setSoundEnabled = useAppStore(s => s.setSoundEnabled);
  const setIsSettingsOpen = useAppStore(s => s.setIsSettingsOpen);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="px-4 py-2 bg-[#1a1b23] border-b border-slate-800 flex items-center justify-between shadow-md z-10 shrink-0">
      <div className="flex items-center gap-3 w-full max-w-sm">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex-shrink-0" />
        <h1 className="text-lg font-bold text-white truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleFullscreen}
          className="text-slate-300 hover:text-white transition-colors flex items-center p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 ml-1"
          title={isFullscreen ? t('header.exitFullscreen') : t('header.fullscreen')}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`transition-colors flex items-center gap-2 p-1.5 rounded-lg ml-1 ${soundEnabled ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 bg-slate-800/50 hover:bg-slate-800 hover:text-white'}`}
          title={soundEnabled ? t("header.mute") : t("header.unmute")}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        <button 
          onClick={() => useAppStore.getState().setIsResultsModalOpen(true)}
          className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 ml-1"
          title={t("header.history")}
        >
          <Trophy size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold hidden sm:block">{t('sidebar.results.winners')}</span>
        </button>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 ml-1"
        >
          <Settings size={18} className="text-blue-400" />
          <span className="text-sm font-semibold hidden sm:block">{t('settings.title')}</span>
        </button>
      </div>
    </header>
  );
};;

