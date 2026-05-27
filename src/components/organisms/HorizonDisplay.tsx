import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useWheelData } from '../../hooks/useWheelData';
import { useWheelActions } from '../../hooks/useWheelActions';

function getContrastYIQ(hexcolor: string) {
  if (!hexcolor || typeof hexcolor !== 'string' || !hexcolor.startsWith('#')) return '#ffffff';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '#ffffff';
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#111111' : '#ffffff';
}

export const HorizonDisplay = () => {
  const isSpinning = useAppStore(s => s.isSpinning);
  const rotation = useAppStore(s => s.rotation);
  const spinTime = useAppStore(s => s.spinTime);
  const eliminationMode = useAppStore(s => s.eliminationMode);
  const eliminationSpinTime = useAppStore(s => s.eliminationSpinTime);
  const winner = useAppStore(s => s.winner);
  const setWinner = useAppStore(s => s.setWinner);
  const autoRemoveWinner = useAppStore(s => s.autoRemoveWinner);
  
  const { validItems, slices } = useWheelData();
  const { spinWheel, handleRemoveItem, stopWinSound } = useWheelActions();

  const isFinalRound = eliminationMode && validItems.length === 2;
  const actualSpinTime = isFinalRound 
    ? spinTime 
    : (eliminationMode ? eliminationSpinTime : spinTime);

  const [currentRotation, setCurrentRotation] = useState(rotation);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      let startTime = performance.now();
      const startRotation = currentRotation;
      const targetRotation = rotation;

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = (time: number) => {
        const elapsed = (time - startTime) / 1000;
        let progress = elapsed / actualSpinTime;
        if (progress > 1) progress = 1;

        const currentEasedProgress = easeOut(progress);
        setCurrentRotation(startRotation + (targetRotation - startRotation) * currentEasedProgress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentRotation(targetRotation);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    } else {
      setCurrentRotation(rotation);
    }
  }, [isSpinning, rotation, actualSpinTime]);

  const spinWheelRef = useRef(spinWheel);
  useEffect(() => {
    spinWheelRef.current = spinWheel;
  }, [spinWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
         return;
      }
      if (e.ctrlKey && e.key === 'Enter') {
         if (!isSpinning && !winner && validItems.length >= 2) {
            spinWheelRef.current();
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpinning, winner, validItems.length]);

  const REEL_PORTION = 100;
  const TOTAL_HEIGHT = REEL_PORTION * Math.max(1, validItems.length); // Dynamic height roughly based on items count
  const ITEM_BASE_HEIGHT = TOTAL_HEIGHT; // so we map 360 to height

  // In classic: pointer is at 90 deg (3 o'clock). The top of the wheel is 270 deg / -90 deg.
  // Wheel offset is -90 deg.
  // The relative angle pointing to the 3 o'clock is (90 - rot) mod 360.
  // Let's use the same target logic so results map identically to classic.
  // We want the item that has (90 - rot(modulo 360) + 360)%360 within [startAngle, endAngle) to be centered.
  
  // Actually, angle under center:
  const pointerAngle = ((90 - currentRotation) % 360 + 360) % 360;
  
  // In the DOM, y increases downwards. Let's map degrees directly to Y.
  // 0 degrees corresponds to y = 0.
  const offsetY = (pointerAngle / 360) * TOTAL_HEIGHT;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative bg-gradient-to-br from-[#1a2530] via-[#0d131a] to-[#251000] overflow-hidden min-h-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Reel Container */}
      <div 
        onClick={() => {
           if (!isSpinning && !winner && validItems.length >= 2) spinWheel();
        }}
        className={`w-[90vw] md:w-[500px] h-[60vh] md:h-[500px] bg-[#1a1b26] rounded-[2rem] relative overflow-hidden shadow-2xl border transition-all duration-300 box-border
          ${!isSpinning && !winner && validItems.length >= 2 ? 'cursor-pointer hover:scale-[1.02] border-slate-500' : 'border-slate-700/50'}
          ${!isSpinning && winner ? 'shadow-[0_0_80px_rgba(255,0,85,0.2)] border-orange-500/50 scale-100' : 'opacity-95'}
        `}
      >
        
        {/* Transparent frame highlight for winning row */}
        <div className="absolute top-1/2 left-0 w-full h-[120px] -translate-y-1/2 z-30 pointer-events-none box-border flex items-center justify-between transition-all duration-500">
            {/* The white frame in the center */}
            <div className={`absolute inset-0 border-y-2 pointer-events-none transition-all duration-500 ${!isSpinning && winner ? 'border-orange-400 bg-orange-500/10' : 'border-white/20 bg-white/5'}`}></div>
            {/* Small triangles pointing inward */}
            <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[16px] border-l-orange-500 drop-shadow-md z-40 relative"></div>
            <div className="w-0 h-0 border-y-[12px] border-y-transparent border-r-[16px] border-r-orange-500 drop-shadow-md z-40 relative"></div>
        </div>

        {/* The reel */}
        <div className="absolute left-0 right-0 top-1/2" style={{ transform: `translateY(-${offsetY}px)` }}>
            {/* We render 5 copies of the entire 360-degree reel to support continuous scrolling up/down indefinitely */}
            {[-2, -1, 0, 1, 2].map((copyIndex) => (
              <div key={copyIndex} className="absolute left-0 right-0" style={{ top: `${copyIndex * TOTAL_HEIGHT}px`, height: `${TOTAL_HEIGHT}px` }}>
                {slices.map((slice, i) => {
                  const top = (slice.startAngle / 360) * TOTAL_HEIGHT;
                  const height = (slice.angle / 360) * TOTAL_HEIGHT;
                  
                  // Limit the visual text size so tiny slices don't overflow completely
                  const isTiny = slice.angle < 5;
                  const textColor = getContrastYIQ(slice.color);
                  
                  return (
                     <div key={i} className="absolute left-0 w-full p-2 box-border border-b-[3px] border-black/40" style={{ top: `${top}px`, height: `${height}px`}}>
                        <div className="w-full h-full rounded shadow-inner flex overflow-hidden relative group" style={{ backgroundColor: slice.color }}>
                            {slice.item.image && (
                              <div className="h-full min-w-[80px] md:min-w-[120px] bg-white/10 flex items-center justify-center p-2 border-r border-white/20">
                                <img src={slice.item.image} className="h-full w-full object-contain drop-shadow-md" alt="" />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col justify-center px-6 relative">
                                <span className={`font-black uppercase tracking-wide truncate ${isTiny ? 'text-sm' : 'text-3xl md:text-4xl'}`} style={{ color: textColor }}>
                                  {slice.item.text}
                                </span>
                                {/* Background stylistic element */}
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                     </div>
                  );
                })}
              </div>
            ))}
        </div>
        
        {/* Top/Bottom shadows for depth */}
        <div className="absolute top-0 left-0 w-full h-[60px] bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-black/80 to-transparent z-40 pointer-events-none"></div>
        
      </div>

      {/* Action Area */}
      <div className="mt-8 flex flex-col items-center gap-4 relative z-50 h-[120px]">
        {!isSpinning && !winner && validItems.length >= 2 && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
            <button
               onClick={(e) => { e.stopPropagation(); spinWheel(); }}
               className="bg-amber-600 hover:bg-amber-500 text-white px-10 py-3 uppercase tracking-[0.2em] font-black text-xl md:text-2xl rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.4)] border-b-4 border-amber-800 hover:border-amber-700 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3"
            >
               Girar Roleta
            </button>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-none">ou pressione ctrl+enter</p>
          </div>
        )}

        {isSpinning && (
          <div className="text-amber-500/80 font-black text-2xl uppercase tracking-[0.4em] animate-pulse">
            Sorteando...
          </div>
        )}

        {!isSpinning && winner && (
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <h3 className="text-orange-400 font-extrabold text-2xl uppercase tracking-widest drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">
              {winner.type === 'grand_winner' ? 'GRANDE VENCEDOR!' : 'TEMOS UM VENCEDOR!'}
            </h3>
            <div className="flex w-full justify-center gap-4">
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   stopWinSound();
                   const state = useAppStore.getState();
                   if (winner.drawId) {
                     state.setResults(prev => prev.filter(r => r.drawId !== winner.drawId));
                   }
                   setWinner(null);
                 }}
                 className="flex-1 max-w-[200px] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-6 py-3 rounded-xl font-black text-base transition-all hover:-translate-y-1 shadow-[0_10px_30px_rgba(239,68,68,0.3)] border-b-4 border-red-800 hover:border-red-600 active:translate-y-1 active:border-b-0 uppercase tracking-wider"
               >
                 Rejeitar
               </button>
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   stopWinSound();
                   if (winner.type === 'grand_winner') {
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
                 className="flex-1 max-w-[200px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-black text-base transition-all hover:-translate-y-1 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-b-4 border-emerald-800 hover:border-emerald-600 active:translate-y-1 active:border-b-0 uppercase tracking-wider"
               >
                 Aceitar
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
