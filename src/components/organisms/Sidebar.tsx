import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { EntriesTab } from './sidebar/EntriesTab';
import { ResultsTab } from './sidebar/ResultsTab';

export const Sidebar = () => {
  const isSidebarOpen = useAppStore(s => s.isSidebarOpen);
  const setIsSidebarOpen = useAppStore(s => s.setIsSidebarOpen);
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const items = useAppStore(s => s.items);
  const results = useAppStore(s => s.results);

  return (
    <>
      {isSidebarOpen && (
        <div className="lg:hidden absolute inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Painel */}
      <div className={`
        absolute lg:relative right-0 top-0 h-full z-40 shrink-0
        transition-[transform,width] duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-[400px]' : 'translate-x-full lg:translate-x-0 w-[85vw] sm:w-[400px] lg:w-0'}
      `}>
        <div className="absolute top-0 left-0 w-[85vw] sm:w-[400px] h-full bg-[#1a1b23] lg:border-l border-slate-800 shadow-2xl flex flex-col">
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-3 ${isSidebarOpen ? '-left-5' : '-left-12'} w-10 h-10 bg-[#4a72ff] hover:bg-[#3b5ecc] rounded-full flex items-center justify-center text-white z-50 shadow-lg transition-all duration-300`}
            title={isSidebarOpen ? "Ocultar Painel" : "Mostrar Painel"}
          >
            <ChevronRight size={24} className={`transform transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
          </button>

          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-700 bg-[#1e2029] shrink-0 pt-2 px-1 relative overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('entradas')}
                className={`flex-1 pb-3 pt-2 px-2 text-center text-sm sm:text-base font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === 'entradas' ? 'text-white border-b-[3px] border-white' : 'text-slate-400 hover:text-slate-300 border-b-[3px] border-transparent'}`}
              >
                Entradas <span className={`${activeTab === 'entradas' ? 'bg-slate-500/50 text-white' : 'bg-slate-800 text-slate-400'} text-xs px-2 py-0.5 rounded-full`}>{items.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('resultados')}
                className={`flex-1 pb-3 pt-2 px-2 text-center text-sm sm:text-base font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === 'resultados' ? 'text-white border-b-[3px] border-white' : 'text-slate-400 hover:text-slate-300 border-b-[3px] border-transparent'}`}
              >
                Resultados <span className={`${activeTab === 'resultados' ? 'bg-slate-500/50 text-white' : 'bg-slate-800 text-slate-400'} text-xs px-2 py-0.5 rounded-full`}>{results.length}</span>
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col overflow-hidden min-h-0">
              {activeTab === 'entradas' && <EntriesTab />}
              {activeTab === 'resultados' && <ResultsTab />}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
