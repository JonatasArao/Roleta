import React from 'react';
import { Shuffle, SortAsc, Plus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useWheelData } from '../../../hooks/useWheelData';
import { useWheelActions } from '../../../hooks/useWheelActions';
import { Button } from '../../atoms/Button';
import { EntryItem } from '../../molecules/EntryItem';

export const EntriesTab = () => {
  const items = useAppStore(s => s.items);
  const isSpinning = useAppStore(s => s.isSpinning);
  const colors = useAppStore(s => s.colors);
  const isAdvancedEntries = useAppStore(s => s.isAdvancedEntries);
  const setIsAdvancedEntries = useAppStore(s => s.setIsAdvancedEntries);
  const setEditingEntryId = useAppStore(s => s.setEditingEntryId);

  const { validItems } = useWheelData();
  const { 
    handleShuffle, handleSort,
    handleUpdateItem, handleRemoveItem, handleAddEmptyItem, handleMoveItem
  } = useWheelActions();

  const totalWeight = validItems.reduce((acc, item) => acc + (item.weight || 1), 0) || 1;

  return (
    <>
      <div className="flex gap-3 mb-4 shrink-0">
        <Button onClick={handleShuffle} disabled={isSpinning || items.length < 2} className="flex-1 w-full gap-2 text-sm">
          <Shuffle size={16} /> Baralhar
        </Button>
        <Button onClick={handleSort} disabled={isSpinning || items.length < 2} className="flex-1 w-full gap-2 text-sm">
          <SortAsc size={16} /> Ordenar
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4 shrink-0 px-1">
        <div className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700/50">
          {items.filter(i => i.enabled !== false).length} {items.filter(i => i.enabled !== false).length === 1 ? 'participante' : 'participantes'}
        </div>
        <label className={`flex items-center gap-2 text-white font-medium text-sm ${isSpinning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          <input 
            type="checkbox" 
            disabled={isSpinning}
            checked={isAdvancedEntries}
            onChange={(e) => setIsAdvancedEntries(e.target.checked)}
            className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-700 disabled:cursor-not-allowed" 
          />
          Avançado
        </label>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
        {items.map((item, index) => {
          const validItem = validItems.find(vi => vi.id === item.id);
          const effectiveWeight = validItem ? validItem.weight : item.weight || 1;
          
          return (
            <EntryItem
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              totalWeight={totalWeight}
              effectiveWeight={effectiveWeight}
              isAdvancedEntries={isAdvancedEntries}
              isSpinning={isSpinning}
              color={colors[index % (colors.length || 1)] || '#cccccc'}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
              onMove={handleMoveItem}
              onEditSettings={setEditingEntryId}
            />
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
        <Button variant="secondary" onClick={handleAddEmptyItem} disabled={isSpinning} className="w-full gap-2">
          <Plus size={20} /> Adicionar
        </Button>
      </div>
    </>
  );
};
