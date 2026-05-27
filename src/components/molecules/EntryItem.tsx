import React from 'react';
import { ArrowUp, ArrowDown, Settings2, X, Palette } from 'lucide-react';
import { Item } from '../../types';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

function getContrastYIQ(hexcolor: string) {
  if (!hexcolor || typeof hexcolor !== 'string' || !hexcolor.startsWith('#')) return '#ffffff';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '#ffffff';
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 70 ? '#111111' : '#ffffff';
}

interface EntryItemProps {
  item: Item;
  index: number;
  totalItems: number;
  totalWeight: number;
  isAdvancedEntries: boolean;
  isSpinning: boolean;
  color: string;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onEditSettings: (id: string) => void;
}

export const EntryItem: React.FC<EntryItemProps> = ({
  item,
  index,
  totalItems,
  totalWeight,
  isAdvancedEntries,
  isSpinning,
  color,
  onUpdate,
  onRemove,
  onMove,
  onEditSettings,
}) => {
  const weightPercentage = item.enabled !== false ? Math.round(((item.weight || 1) / totalWeight) * 100) : 0;
  const itemColor = item.color || color || '#cccccc';

  return (
    <div className="border-b border-white/10 pb-3 flex items-center gap-2 group">
      {isAdvancedEntries && (
        <div className="flex flex-col items-center justify-center gap-2">
          <button onClick={() => onMove(item.id, 'up')} disabled={isSpinning || index === 0} className="text-slate-400 hover:text-white disabled:opacity-30">
            <ArrowUp size={16} />
          </button>
          <button onClick={() => onMove(item.id, 'down')} disabled={isSpinning || index === totalItems - 1} className="text-slate-400 hover:text-white disabled:opacity-30">
            <ArrowDown size={16} />
          </button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {!isAdvancedEntries && (
            <div className="w-4 h-4 rounded-full ml-1 flex-shrink-0 shadow-inner" style={{ backgroundColor: itemColor }} />
          )}
          <Input
            type="text" value={item.text} onChange={(e) => onUpdate(item.id, { text: e.target.value })} disabled={isSpinning}
            className="flex-1"
          />
          
          {!isAdvancedEntries && (
            <button onClick={() => onRemove(item.id)} disabled={isSpinning} className="text-slate-500 hover:text-red-400 p-1 transition-colors disabled:opacity-50" title="Remover">
              <X size={18} />
            </button>
          )}
        </div>
        
        {isAdvancedEntries && (
          <div className="flex items-center gap-2 pl-0">
            <label 
              className={`text-black p-2 rounded relative flex items-center justify-center overflow-hidden border border-white/20 ${isSpinning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              style={{ backgroundColor: itemColor }}
              title="Mudar cor"
            >
              <input 
                type="color" 
                disabled={isSpinning}
                value={itemColor} 
                onChange={(e) => onUpdate(item.id, { color: e.target.value })}
                className="absolute opacity-0 inset-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
              />
              <Palette size={16} color={getContrastYIQ(itemColor)} />
            </label>
            <div className={`flex flex-1 items-center bg-[#252733] rounded px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 min-w-0 ${isSpinning ? 'opacity-50' : ''}`}>
              <input 
                type="number" 
                min="1" 
                disabled={isSpinning}
                value={item.weight || 1} 
                onChange={(e) => onUpdate(item.id, { weight: Number(e.target.value) })}
                className="bg-transparent text-white w-full border-none focus:outline-none min-w-0 text-sm disabled:cursor-not-allowed"
              />
              <span className="text-slate-400 text-sm ml-2">{weightPercentage}%</span>
            </div>
          </div>
        )}
      </div>
      
      {isAdvancedEntries && (
        <div className="flex items-center gap-2 ml-1">
          <Button variant="primary" size="icon" className="p-1.5" disabled={isSpinning} onClick={() => onEditSettings(item.id)}>
            <Settings2 size={16} />
          </Button>
          <div className="flex flex-col items-center justify-center gap-2 shrink-0">
            <button onClick={() => onRemove(item.id)} disabled={isSpinning} className="text-slate-400 hover:text-white hover:bg-red-500/20 rounded p-0.5 disabled:opacity-30 disabled:hover:bg-transparent">
               <X size={16} />
            </button>
            <label className={isSpinning ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
              <input 
                type="checkbox" 
                disabled={isSpinning}
                checked={item.enabled !== false}
                onChange={(e) => onUpdate(item.id, { enabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 cursor-pointer disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
