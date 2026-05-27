import React from 'react';
import { Trophy, Skull, Crown } from 'lucide-react';
import { Result } from '../../types';

interface ResultItemProps {
  result: Result;
  index: number;
}

export const ResultItem: React.FC<ResultItemProps> = ({ result, index }) => {
  const isEliminated = result.type === 'eliminated';
  const isGrandWinner = result.type === 'grand_winner';
  
  let Icon = Trophy;
  let label = "Vencedor";
  let colorTheme = "from-emerald-900/40 to-emerald-800/10 border-emerald-500/30 text-emerald-400";
  let iconColor = "text-emerald-400";
  let textColor = "text-emerald-100";
  let numberColor = "text-emerald-500/50";

  if (isEliminated) {
    Icon = Skull;
    label = "Eliminado";
    colorTheme = "from-red-900/30 to-red-800/10 border-red-500/20 text-red-400/80";
    iconColor = "text-red-400/70";
    textColor = "text-red-200/50 line-through decoration-red-500/30";
    numberColor = "text-red-500/40";
  } else if (isGrandWinner) {
    Icon = Crown;
    label = "Grande Campeão";
    colorTheme = "from-yellow-900/40 to-yellow-800/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    iconColor = "text-yellow-400 drop-shadow-md";
    textColor = "text-yellow-50 font-bold";
    numberColor = "text-yellow-500/80 font-black";
  }

  return (
    <div className={`bg-gradient-to-r border rounded-xl p-3 flex flex-col gap-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md ${colorTheme}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`text-[11px] font-black w-4 text-left shrink-0 ${numberColor}`}>#{index}</span>
          <span className={`text-sm ${textColor} truncate`} title={result.text}>
            {result.text}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/25 shrink-0 ${iconColor}`}>
          <Icon size={12} strokeWidth={2.5} />
          <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
};
