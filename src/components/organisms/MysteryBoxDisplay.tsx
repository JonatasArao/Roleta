import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useWheelData } from '../../hooks/useWheelData';
import { useWheelActions } from '../../hooks/useWheelActions';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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

  const wheelTheme = useAppStore(state => state.wheelTheme);
  
  // Theme Variables
  let bgGradient = "from-[#1c1836] via-[#100e1f] to-[#0a0812]";
  let outerGlow = "bg-orange-500/5 blur-[100px]";
  let containerBorder = "border-[#f59e0b]/40 border-[4px] shadow-amber-900/50";
  let innerBg = "bg-[#0b0a14]";
  let targetAreaClass = "border-amber-500/50 bg-amber-500/5 shadow-[0_0_50px_rgba(245,158,11,0.15)]";
  let boxFrontClass = "from-[#2d2a45] to-[#1a1829] border-[#454060]";
  let boxHighlightClass = "border-amber-400";
  let dropShadowColor = "rgba(245,158,11,0.6)";
  let bgPattern = <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none transition-all duration-500"></div>;

  switch (wheelTheme) {
    case 'neon':
      bgGradient = "from-[#0a0014] via-[#15002b] to-[#0a0014]";
      outerGlow = "bg-fuchsia-600/30 blur-[120px]";
      containerBorder = "border-cyan-500/40 border-[4px] shadow-cyan-900/50";
      innerBg = "bg-[#090014]";
      targetAreaClass = "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.25)]";
      boxFrontClass = "from-[#2d0052] to-[#140026] border-fuchsia-800";
      boxHighlightClass = "border-cyan-400";
      dropShadowColor = "rgba(34,211,238,0.6)";
      bgPattern = (
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none transition-all duration-500">
           <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/10 to-transparent"></div>
        </div>
      );
      break;
    case 'casino':
      bgGradient = "from-[#3b0918] via-[#1a0000] to-[#2d1b00]";
      outerGlow = "bg-amber-500/30 blur-[120px]";
      containerBorder = "border-amber-600 border-[6px] border-dashed shadow-amber-900/80";
      innerBg = "bg-[#1a0000]";
      targetAreaClass = "border-yellow-500/80 bg-yellow-500/10 shadow-[0_0_60px_rgba(234,179,8,0.2)]";
      boxFrontClass = "from-[#4a0d0d] to-[#260505] border-amber-900";
      boxHighlightClass = "border-amber-400";
      dropShadowColor = "rgba(251,191,36,0.6)";
      bgPattern = (
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15)_0%,transparent_100%)] bg-[size:20px_20px] pointer-events-none transition-all duration-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-30"></div>
        </div>
      );
      break;
    case 'candy':
      bgGradient = "from-[#ffe4e6] via-[#fbcfe8] to-[#e0e7ff]";
      outerGlow = "bg-pink-400/40 blur-[100px]";
      containerBorder = "border-pink-300 border-[6px] shadow-pink-300/50";
      innerBg = "bg-[#fff0f5]";
      targetAreaClass = "border-pink-400/80 bg-pink-100/50 shadow-[0_0_40px_rgba(244,114,182,0.3)]";
      boxFrontClass = "from-pink-200 to-pink-100 border-pink-300";
      boxHighlightClass = "border-pink-500";
      dropShadowColor = "rgba(236,72,153,0.6)";
      bgPattern = (
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMiIgZmlsbD0iI2Y0NzJiNiIvPjwvc3ZnPg==')] pointer-events-none transition-all duration-500"></div>
      );
      break;
    case 'dark':
      bgGradient = "from-[#0a0a0a] via-[#121212] to-[#000000]";
      outerGlow = "bg-zinc-500/10 blur-[100px]";
      containerBorder = "border-zinc-800 border-[2px]";
      innerBg = "bg-[#0a0a0a]";
      targetAreaClass = "border-zinc-500/50 bg-zinc-800/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]";
      boxFrontClass = "from-zinc-800 to-black border-zinc-700";
      boxHighlightClass = "border-white";
      dropShadowColor = "rgba(255,255,255,0.6)";
      bgPattern = (
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none transition-all duration-500"></div>
      );
      break;
  }

  // Dimensions
  const containerRatio = 1.8; 
  const cols = Math.max(2, Math.ceil(Math.sqrt(validItems.length * containerRatio)));

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 relative bg-gradient-to-br ${bgGradient} overflow-hidden min-h-0 items-center justify-center transition-colors duration-500`}>
      {bgPattern}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] ${outerGlow} rounded-full pointer-events-none transition-colors duration-500`} />
      
      <div className={`w-[95vw] md:w-[1000px] max-w-full h-[85vh] flex flex-col rounded-2xl overflow-hidden relative shadow-2xl transition-all duration-500 ${containerBorder} ${innerBg}`}>
         
         <div className={`border-b z-20 flex justify-center items-center py-4 relative overflow-hidden shrink-0 transition-all duration-500 shadow-md ${targetAreaClass}`}>
           {/* Glint effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]"></div>
           <h2 className="uppercase tracking-[0.3em] font-black text-center text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
               {isSpinning ? t("mysteryBox.mixing") : (winner ? t("mysteryBox.chosen") : t("mysteryBox.choose"))}
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
                           ${isHighlighted && !isWinnerBox ? `drop-shadow-[0_0_20px_${dropShadowColor}] z-10` : ''}
                           ${isWinnerBox && isRevealed ? `scale-[1.3] z-30 drop-shadow-[0_0_50px_${dropShadowColor}] md:scale-[1.5]` : 'scale-100'}
                        `}
                        onClick={() => handleBoxClick(idx)}
                     >
                        {/* 3D Flip Container */}
                        <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
                           
                           {/* Front Face: The Suitcase / Box */}
                           <div 
                              className={`absolute inset-0 [backface-visibility:hidden] bg-gradient-to-b rounded-xl border-2 shadow-xl overflow-hidden flex flex-col items-center justify-center ${boxFrontClass}
                                 ${isHighlighted ? boxHighlightClass : ''}
                              `}
                           >
                              {/* Box Handle */}
                              <div className="absolute top-2 md:top-3 w-1/3 h-2 md:h-3 rounded-t-lg border-2 border-b-0 border-[#1a1829] bg-transparent opacity-50"></div>
                              
                              <div className="text-white/30 text-3xl md:text-5xl font-black font-serif italic mb-1 group-hover:text-white/70 transition-colors drop-shadow-md">
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
                 {t('mysteryBox.clickBoxOr')}
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
               {isSpinning ? t('mysteryBox.shuffling') : t('mysteryBox.randomChoice')}
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
