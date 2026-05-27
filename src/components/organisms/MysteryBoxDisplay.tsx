import React, { useEffect, useRef, useState, useMemo } from 'react';
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

export const MysteryBoxDisplay = () => {
  const isSpinning = useAppStore(s => s.isSpinning);
  const winner = useAppStore(s => s.winner);
  const { validItems, slices } = useWheelData();
  const { spinWheel } = useWheelActions();

  // Highlight and user selection
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null);
  
  // Mapping of which item is in which box (by index)
  const [boxMapping, setBoxMapping] = useState<Record<number, any>>({});
  const [winnerBoxIndex, setWinnerBoxIndex] = useState<number | null>(null);
  
  // Control which boxes are flipped (revealed)
  const [revealedBoxes, setRevealedBoxes] = useState<Record<number, boolean>>({});

  // Reset phase when there's no spin and no winner
  useEffect(() => {
    if (!isSpinning && !winner) {
      setBoxMapping({});
      setWinnerBoxIndex(null);
      setRevealedBoxes({});
      setHighlightedIndex(null);
      setUserSelectedIndex(null);
    }
  }, [isSpinning, winner]);

  // Spinning loop: fast shuffle highlight
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSpinning) {
       interval = setInterval(() => {
         // If user selected a box, we can occasionally highlight it, or just random
         const randomBox = Math.floor(Math.random() * validItems.length);
         setHighlightedIndex(randomBox);
       }, 70);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning, validItems.length]);

  // When spin finishes and a winner is chosen
  useEffect(() => {
    if (winner && !isSpinning && validItems.length > 0) {
      // Determine which box index holds the winner
      let winIdx = userSelectedIndex;
      if (winIdx === null || winIdx >= validItems.length) {
         // Either user didn't click, or items changed
         winIdx = Math.floor(Math.random() * validItems.length);
      }
      
      setWinnerBoxIndex(winIdx);
      setHighlightedIndex(winIdx); // Lock highlight to the winner

      // Create the mapping!
      const unchosenItems = validItems.filter(i => i.id !== winner.id);
      // Shuffle unchosen
      for (let i = unchosenItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unchosenItems[i], unchosenItems[j]] = [unchosenItems[j], unchosenItems[i]];
      }

      const newMapping: Record<number, any> = {};
      let unchosenCursor = 0;
      for (let i = 0; i < validItems.length; i++) {
         if (i === winIdx) {
            newMapping[i] = winner;
         } else {
            newMapping[i] = unchosenItems[unchosenCursor++] || validItems[0]; // fallback
         }
      }
      setBoxMapping(newMapping);

      // Reveal sequence
      // 1. Reveal winner box immediately
      setRevealedBoxes({ [winIdx]: true });

      // 2. Reveal all others after a short delay
      const t = setTimeout(() => {
         const allRevealed: Record<number, boolean> = {};
         for (let i = 0; i < validItems.length; i++) allRevealed[i] = true;
         setRevealedBoxes(allRevealed);
      }, 1500);

      return () => clearTimeout(t);
    }
  }, [winner, isSpinning, validItems, userSelectedIndex]);

  const spinWheelRef = useRef(spinWheel);
  useEffect(() => {
    spinWheelRef.current = spinWheel;
  }, [spinWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey && e.key === 'Enter') {
         if (!isSpinning && validItems.length >= 2 && !winner) {
            spinWheelRef.current();
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, validItems.length, winner]);

  const handleBoxClick = (index: number) => {
    if (!isSpinning && !winner && validItems.length >= 2) {
       setUserSelectedIndex(index);
       setHighlightedIndex(index);
       spinWheelRef.current(true);
    }
  };

  const startRandomSpin = () => {
    if (!isSpinning && !winner && validItems.length >= 2) {
       setUserSelectedIndex(null); // System picks
       spinWheelRef.current();
    }
  };

  // Dimensions
  const containerRatio = 1.8; 
  const cols = Math.max(2, Math.ceil(Math.sqrt(validItems.length * containerRatio)));

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 relative bg-gradient-to-br from-[#1c1836] via-[#100e1f] to-[#0a0812] overflow-hidden min-h-0 items-center justify-center">
      
      <div className="w-[95vw] md:w-[1000px] max-w-full h-[85vh] flex flex-col border-[#f59e0b]/40 border-[4px] rounded-2xl bg-[#0b0a14] overflow-hidden relative shadow-2xl">
         
         <div className="bg-gradient-to-r from-amber-900/60 via-amber-600/80 to-amber-900/60 border-b border-amber-500/50 text-amber-50 shadow-[0_4px_25px_rgba(245,158,11,0.2)] z-20 flex justify-center items-center py-4 relative overflow-hidden shrink-0">
           {/* Glint effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]"></div>
           <h2 className="uppercase tracking-[0.3em] font-black text-center text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
               {isSpinning ? "Qual é a sua mala?" : (winner ? "A Mala Escolhida!" : "Escolha Sua Mala")}
           </h2>
         </div>

         {/* Content Area with 3D perspective to enable cool flips */}
         <div className="flex-1 relative overflow-hidden p-3 md:p-6 flex items-center justify-center [perspective:1000px]">
            <div className="flex flex-wrap justify-center items-center content-center w-full h-full gap-3 md:gap-4 overflow-hidden">
               {validItems.map((_, idx) => {
                  
                  const isHighlighted = highlightedIndex === idx;
                  const isRevealed = revealedBoxes[idx] || false;
                  
                  // In post-spin, if winner is chosen, we check if this is the winner box
                  const isWinnerBox = winnerBoxIndex === idx;
                  const isDimmed = Object.keys(revealedBoxes).length > 0 && !isWinnerBox;
                  
                  const mappedItem = boxMapping[idx] || null;
                  const slice = mappedItem ? slices.find(s => s.item.id === mappedItem.id) : null;
                  const bgColor = slice?.color || '#3b3464';
                  const textColor = getContrastYIQ(bgColor);

                  return (
                     <div 
                        key={idx} 
                        style={{ 
                           width: `calc(${100 / cols}% - 1rem)`, 
                           minWidth: '60px',
                           maxWidth: '180px', 
                           aspectRatio: '1/1' 
                        }}
                        className={`group relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                           ${!winner && !isSpinning ? 'cursor-pointer hover:scale-105' : ''}
                           ${isDimmed ? 'opacity-40 scale-90 grayscale' : 'opacity-100'}
                           ${isHighlighted && !isWinnerBox ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] z-10' : ''}
                           ${isWinnerBox && isRevealed ? 'scale-[1.3] z-30 drop-shadow-[0_0_50px_rgba(245,158,11,0.8)] md:scale-[1.5]' : 'scale-100'}
                        `}
                        onClick={() => handleBoxClick(idx)}
                     >
                        {/* 3D Flip Container */}
                        <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
                           
                           {/* Front Face: The Suitcase / Box */}
                           <div 
                              className={`absolute inset-0 [backface-visibility:hidden] bg-gradient-to-b from-[#2d2a45] to-[#1a1829] rounded-xl border-2 shadow-xl overflow-hidden flex flex-col items-center justify-center
                                 ${isHighlighted ? 'border-amber-400' : 'border-[#454060]'}
                              `}
                           >
                              {/* Box Handle */}
                              <div className="absolute top-2 md:top-3 w-1/3 h-2 md:h-3 rounded-t-lg border-2 border-b-0 border-[#1a1829] bg-transparent"></div>
                              
                              <div className="text-amber-500/30 text-3xl md:text-5xl font-black font-serif italic mb-1 group-hover:text-amber-500/70 transition-colors">
                                 {idx + 1}
                              </div>
                           </div>

                           {/* Back Face: Revealed Content */}
                           <div 
                              className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2 text-center"
                              style={{ 
                                 backgroundColor: bgColor,
                                 borderColor: isWinnerBox ? '#fbbf24' : '#ffffff20' 
                              }}
                           >
                              {/* Inner soft glow/shadow */}
                              <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none"></div>
                              
                              {mappedItem && (
                                 <>
                                    {mappedItem.image && (
                                       <img src={mappedItem.image} alt="" className="w-1/2 h-1/2 object-contain mb-1 drop-shadow-md relative z-10" />
                                    )}
                                    <span 
                                       className="font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wide break-words w-full px-1 drop-shadow relative z-10 leading-tight"
                                       style={{ color: textColor }}
                                    >
                                       {mappedItem.text}
                                    </span>
                                 </>
                              )}
                              
                              {/* If it's the winner, add a special star effect */}
                              {isWinnerBox && (
                                 <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 animate-[spin_4s_linear_infinite] pointer-events-none rounded-full blur-xl mix-blend-screen"></div>
                              )}
                           </div>
                           
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Bottom Control Bar */}
         <div className="bg-black/50 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-center border-t border-white/10 gap-4">
            
            {!winner && !isSpinning && validItems.length >= 2 && (
               <div className="text-white/60 text-sm font-bold uppercase tracking-widest hidden sm:block">
                 Clique em uma caixa ou
               </div>
            )}

            <button 
               onClick={startRandomSpin} 
               disabled={isSpinning || validItems.length < 2 || winner !== null}
               className={`px-8 py-3 uppercase tracking-widest font-black text-lg md:text-xl rounded shadow-xl transition-all
                  ${isSpinning || validItems.length < 2 || winner !== null
                     ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                     : 'bg-amber-600 hover:bg-amber-500 text-white hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.4)] border-b-4 border-amber-800 hover:border-amber-700 active:translate-y-0 active:border-b-0'
                  }
               `}
            >
               {isSpinning ? 'Embaralhando...' : 'Escolha Aleatória'}
            </button>
            
            {/* Rejeitar/Aceitar from WinnerModal moved here conceptually! Actually, WinnerModal is handling the action for mystery_box at the bottom? Let's check! */}
            
         </div>

      </div>
    
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
};
