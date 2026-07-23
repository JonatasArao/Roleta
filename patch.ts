import fs from 'fs';

let content = fs.readFileSync('src/components/organisms/RaceDisplay.tsx', 'utf8');

const leaderboardUpdaterCode = `
const LeaderboardUpdater = ({ slices, positionsRef, leaderXRef }: { slices: any[], positionsRef: any, leaderXRef: any }) => {
  useFrame(() => {
    if (!positionsRef.current) return;
    
    const racers = slices.map((slice, idx) => ({
      id: slice.item.id,
      pos: positionsRef.current[idx]
    }));
    
    racers.sort((a, b) => b.pos - a.pos);
    
    racers.forEach((racer, rank) => {
      const el = document.getElementById(\`leaderboard-racer-\${racer.id}\`);
      if (el) {
         el.style.transform = \`translateY(\${rank * 32}px)\`;
      }
      const rankEl = document.getElementById(\`leaderboard-rank-\${racer.id}\`);
      if (rankEl) {
         rankEl.innerText = \`\${rank + 1}\`;
      }
    });

    const sectorEl = document.getElementById('sector-display');
    if (sectorEl) {
       const leaderX = leaderXRef.current;
       if (leaderX < 3.33) sectorEl.innerText = "SECTOR 1";
       else if (leaderX < 16.66) sectorEl.innerText = "SECTOR 2";
       else sectorEl.innerText = "SECTOR 3";
    }
  });
  return null;
};
`;

content = content.replace('const RaceScene = () => {', leaderboardUpdaterCode + '\nconst RaceScene = () => {');

// Add Sector Lines to the track
const sectorLines = `
      {/* Sector Lines */}
      <mesh position={[3.33, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, TRACK_WIDTH + 4]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[16.66, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, TRACK_WIDTH + 4]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
`;
content = content.replace('{/* Start Line */}', sectorLines + '\n      {/* Start Line */}');

// Add LeaderboardUpdater inside RaceScene
content = content.replace('<CameraController', '<LeaderboardUpdater slices={slices} positionsRef={racerPositions} leaderXRef={leaderXRef} />\n      <CameraController');

// Add Leaderboard UI in RaceDisplay
const raceDisplayMatch = `export const RaceDisplay = () => {
  const { spinWheel } = useWheelActions();
  const isSpinning = useAppStore(state => state.isSpinning);
  const winner = useAppStore(state => state.winner);
  const { validItems, slices } = useWheelData();`;

const raceDisplayReplace = `export const RaceDisplay = () => {
  const { spinWheel } = useWheelActions();
  const isSpinning = useAppStore(state => state.isSpinning);
  const winner = useAppStore(state => state.winner);
  const { validItems, slices } = useWheelData();`;

// Actually just inject the HTML after <div className="...">
const htmlInjectMatch = `    <div className="flex-1 w-full h-full relative bg-slate-900 overflow-hidden">`;
const htmlInjectReplace = `    <div className="flex-1 w-full h-full relative bg-slate-900 overflow-hidden">
      {/* Leaderboard UI */}
      <div className="absolute top-4 left-4 z-10 w-48 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg overflow-hidden shadow-2xl pointer-events-none">
        <div className="bg-slate-800 px-3 py-2 text-white font-black text-xs tracking-widest uppercase border-b border-slate-700/50 flex justify-between">
          <span>POS</span>
          <span id="sector-display" className="text-amber-500">SECTOR 1</span>
        </div>
        <div className="relative p-2 transition-all duration-300" style={{ height: \`\${slices.length * 32}px\` }}>
           {slices.map((slice, i) => (
             <div 
               key={slice.item.id}
               id={\`leaderboard-racer-\${slice.item.id}\`}
               className="absolute left-2 right-2 flex items-center gap-2 h-7 transition-transform duration-100 ease-linear"
               style={{ transform: \`translateY(\${i * 32}px)\` }}
             >
                <div id={\`leaderboard-rank-\${slice.item.id}\`} className="w-5 text-slate-400 font-bold text-xs text-center">
                  {i + 1}
                </div>
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: slice.color }}></div>
                <div className="text-white text-xs font-bold truncate flex-1">{slice.item.text}</div>
             </div>
           ))}
        </div>
      </div>
`;
content = content.replace(htmlInjectMatch, htmlInjectReplace);

fs.writeFileSync('src/components/organisms/RaceDisplay.tsx', content);
