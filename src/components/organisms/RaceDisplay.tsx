import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { useWheelData } from '../../hooks/useWheelData';
import { useWheelActions } from '../../hooks/useWheelActions';

const FINISH_LINE_X = 30;
const START_LINE_X = -10;
const TRACK_WIDTH = 20;

const CameraController = ({ isSpinning, expectedWinnerId, leaderXRef }) => {
  const { camera } = useThree();
  const isSpinningRef = useRef(isSpinning);
  const lookAtTarget = useRef(new THREE.Vector3(5, 0, 0));
  
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useFrame((state) => {
    if (isSpinningRef.current) {
      const leaderX = leaderXRef.current;
      const targetCamX = leaderX - 5;
      camera.position.lerp(new THREE.Vector3(targetCamX, 8, 15), 0.05);
      lookAtTarget.current.lerp(new THREE.Vector3(leaderX + 5, 0, 0), 0.1);
      camera.lookAt(lookAtTarget.current);
    } else {
      if (expectedWinnerId) {
        const t = state.clock.elapsedTime * 0.2;
        camera.position.lerp(new THREE.Vector3(FINISH_LINE_X - 5 + Math.sin(t) * 10, 8, 15 + Math.cos(t) * 10), 0.02);
        lookAtTarget.current.lerp(new THREE.Vector3(FINISH_LINE_X, 0, 0), 0.05);
        camera.lookAt(lookAtTarget.current);
      } else {
        const t = state.clock.elapsedTime * 0.2;
        camera.position.lerp(new THREE.Vector3(Math.sin(t) * 15, 10, 20 + Math.cos(t) * 10), 0.02);
        lookAtTarget.current.lerp(new THREE.Vector3(5, 0, 0), 0.05);
        camera.lookAt(lookAtTarget.current);
      }
    }
  });

  return null;
};

const Racer = ({ item, color, index, total, isSpinning, spinDuration, expectedWinnerId, onUpdatePosition, weightFraction, finishingRank }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const zPos = total === 1 ? 0 : (index / (total - 1)) * TRACK_WIDTH - TRACK_WIDTH / 2;
  
  const [raceData] = useState(() => {
    return {
      startTime: 0,
      profile: [] as number[],
      targetProgress: 0,
      finishedX: START_LINE_X,
      randomOffset: 0,
    };
  });

  const isWinner = expectedWinnerId === item.id;

  useEffect(() => {
    if (isSpinning) {
      // rankFraction goes from 0.0 (1st place) to 1.0 (last place)
      const rankFraction = total > 1 ? finishingRank / (total - 1) : 0;
      
      // Winner gets targetProgress around 1.15, last place around 1.02.
      // All cross the finish line (which is X=30, meaning tp=1.0).
      const baseTp = 1.15 - 0.13 * rankFraction;
      const tp = baseTp + (Math.random() - 0.5) * 0.01;
      
      raceData.targetProgress = tp;

      const numPoints = 150;
      const profile = [];
      
      // Noise scale depends slightly on weightFraction (heavier balls have slightly more momentum / smoother peaks)
      const noiseScale = 1.0 - 0.25 * weightFraction;
      const A1 = (Math.random() - 0.5) * 0.35 * noiseScale;
      const A2 = (Math.random() - 0.5) * 0.20 * noiseScale;
      const A3 = (Math.random() - 0.5) * 0.10 * noiseScale;
      const A4 = (Math.random() - 0.5) * 0.05 * noiseScale;

      let lastP = 0;
      for (let i = 0; i <= numPoints; i++) {
         const t = i / numPoints; 
         
         // Base progress: blend of linear and power curve.
         // We use a constant power for the baseT curve of all racers so their relative positions
         // are strictly determined by their tp (targetProgress) near the finish, preventing crossovers.
         const power = 1.1; 
         const baseT = t * 0.3 + Math.pow(t, power) * 0.7;
         const base = baseT * tp;
         
         // Taper noise at the start (base = 0) and smoothly fade to 0 before the finish line (base = 0.82)
         // This ensures that all overtakes happen during the middle of the track, and as they
         // approach and cross the finish line (base >= 0.82), they are perfectly ordered
         // by their targetProgress (i.e., their podium ranks) with NO post-finish-line overtakes.
         let noiseTaper = 0;
         if (base < 0.82) {
           const normBase = base / 0.82;
           noiseTaper = Math.sin(Math.PI * normBase);
         } else {
           noiseTaper = 0;
         }
         
         const noise = noiseTaper * (
           A1 * Math.sin(1 * Math.PI * t) + 
           A2 * Math.sin(2 * Math.PI * t) + 
           A3 * Math.sin(3 * Math.PI * t) + 
           A4 * Math.sin(5 * Math.PI * t)
         );
         
         let p = base + noise;
         
         // Ensure monotonically increasing progress to prevent backtracking/vibrating backward
         if (p < lastP) p = lastP;
         
         profile.push(p);
         lastP = p;
      }
      
      raceData.profile = profile;
    }
  }, [isSpinning, isWinner, weightFraction, raceData, finishingRank, total]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    
    if (isSpinning) {
      if (raceData.startTime === 0) {
        raceData.startTime = state.clock.elapsedTime;
      }
      
      const elapsed = state.clock.elapsedTime - raceData.startTime;
      const durationSeconds = spinDuration / 1000;
      const progress = Math.min(elapsed / durationSeconds, 1.0);
      
      let profileProgress = 1.0;
      let currentSpeed = 0;
      
      if (raceData.profile.length > 0) {
        const segments = raceData.profile.length - 1;
        const exactIndex = progress * segments;
        const index = Math.floor(exactIndex);
        const fraction = exactIndex - index;
        
        if (index < segments) {
           const p1 = raceData.profile[index];
           const p2 = raceData.profile[index + 1];
           profileProgress = p1 + (p2 - p1) * fraction;
           currentSpeed = (p2 - p1) * segments;
        }
      }
      
      const finalProgress = profileProgress;
      
      // Total distance is 40 units. Start: -10. Finish line: 30.
      const targetX = START_LINE_X + 40 * finalProgress;
      
      groupRef.current.position.x = targetX;
      // Rolling animation
      meshRef.current.position.y = 0.5 + Math.abs(Math.sin(progress * Math.PI * 50)) * (currentSpeed * 0.1);
      meshRef.current.rotation.z = -finalProgress * Math.PI * 15; // Sphere rolling forward
      
      // Slight wobble
      groupRef.current.rotation.x = Math.sin(progress * Math.PI * 40) * 0.05 * currentSpeed; 
      
      raceData.finishedX = targetX;
      
      if (onUpdatePosition) {
        onUpdatePosition(index, targetX);
      }
    } else {
      raceData.startTime = 0;
      
      const resetX = expectedWinnerId ? raceData.finishedX : START_LINE_X;
      
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, resetX, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      
      if (isWinner && expectedWinnerId) {
         meshRef.current.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 6)) * 1.5;
         meshRef.current.rotation.x += 0.05;
         meshRef.current.rotation.y += 0.05;
      } else {
         meshRef.current.position.y = 0.5;
         meshRef.current.rotation.y = 0;
         meshRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[START_LINE_X, 0, zPos]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} flatShading />
        {/* Inner wireframe to make rotation even more obvious */}
        <mesh>
          <icosahedronGeometry args={[0.505, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      </mesh>
      
      <Billboard position={[0, 2, 0]}>
        <Text
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          {item.text}
        </Text>
      </Billboard>
    </group>
  );
};


const LeaderboardUpdater = ({ slices, positionsRef, leaderXRef }: { slices: any[], positionsRef: any, leaderXRef: any }) => {
  useFrame(() => {
    if (!positionsRef.current) return;
    
    const racers = slices.map((slice, idx) => ({
      id: slice.item.id,
      pos: positionsRef.current[idx]
    }));
    
    racers.sort((a, b) => b.pos - a.pos);
    
    racers.forEach((racer, rank) => {
      const el = document.getElementById(`leaderboard-racer-${racer.id}`);
      if (el) {
         el.style.transform = `translateY(${rank * 32}px)`;
      }
      const rankEl = document.getElementById(`leaderboard-rank-${racer.id}`);
      if (rankEl) {
         rankEl.innerText = `${rank + 1}`;
      }
    });

    const sectorEl = document.getElementById('sector-display');
    if (sectorEl) {
       const leaderX = leaderXRef.current;
       if (leaderX >= 30) sectorEl.innerText = "FINISH";
       else if (leaderX < 3.33) sectorEl.innerText = "SECTOR 1";
       else if (leaderX < 16.66) sectorEl.innerText = "SECTOR 2";
       else sectorEl.innerText = "SECTOR 3";
    }
  });
  return null;
};

const RaceScene = () => {
  const { validItems, slices } = useWheelData();
  const isSpinning = useAppStore(state => state.isSpinning);
  const expectedWinnerId = useAppStore(state => state.expectedWinnerId);
  const racePodium = useAppStore(state => state.racePodium);
  const spinTime = useAppStore(state => state.spinTime);
  const eliminationMode = useAppStore(state => state.eliminationMode);
  const eliminationSpinTime = useAppStore(state => state.eliminationSpinTime);
  
  const isFinalRound = eliminationMode && validItems.length === 2;
  const actualSpinTime = isFinalRound ? spinTime : (eliminationMode ? eliminationSpinTime : spinTime);
  const spinDurationMs = actualSpinTime * 1000;
  
  const racerPositions = useRef<number[]>(new Array(slices.length).fill(START_LINE_X));
  const leaderXRef = useRef(START_LINE_X);

  const maxWeight = useMemo(() => {
    return Math.max(...validItems.map(i => i.weight || 1), 1);
  }, [validItems]);

  const handleUpdatePosition = (index: number, x: number) => {
    racerPositions.current[index] = x;
    if (isSpinning) {
      leaderXRef.current = Math.max(...racerPositions.current);
    }
  };

  return (
    <>
      <LeaderboardUpdater slices={slices} positionsRef={racerPositions} leaderXRef={leaderXRef} />
      <CameraController isSpinning={isSpinning} expectedWinnerId={expectedWinnerId} leaderXRef={leaderXRef} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, -10]} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={40}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      <Environment preset="city" />

            {/* The Track Base */}
      <mesh position={[(FINISH_LINE_X + START_LINE_X)/2, -0.2, 0]} receiveShadow>
        <boxGeometry args={[FINISH_LINE_X - START_LINE_X + 20, 0.4, TRACK_WIDTH + 8]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Track Borders (Kerbs) */}
      <mesh position={[(FINISH_LINE_X + START_LINE_X)/2, 0.05, TRACK_WIDTH / 2 + 2]} receiveShadow>
         <boxGeometry args={[FINISH_LINE_X - START_LINE_X + 20, 0.2, 0.5]} />
         <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[(FINISH_LINE_X + START_LINE_X)/2, 0.05, -TRACK_WIDTH / 2 - 2]} receiveShadow>
         <boxGeometry args={[FINISH_LINE_X - START_LINE_X + 20, 0.2, 0.5]} />
         <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Lanes */}
      {slices.map((_, i) => {
         const zPos = slices.length === 1 ? 0 : (i / (slices.length - 1)) * TRACK_WIDTH - TRACK_WIDTH / 2;
         return (
            <group key={`lane-${i}`}>
              <mesh position={[(FINISH_LINE_X + START_LINE_X)/2, 0.01, zPos]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                 <planeGeometry args={[FINISH_LINE_X - START_LINE_X + 20, 0.1]} />
                 <meshStandardMaterial color="#374151" />
              </mesh>
            </group>
         )
      })}

      {/* Sector Lines */}
      <mesh position={[3.33, 0.015, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, TRACK_WIDTH + 4]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[16.66, 0.015, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, TRACK_WIDTH + 4]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Start Line Arch & Line */}
      <group position={[START_LINE_X, 0, 0]}>
        <mesh position={[0, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, TRACK_WIDTH + 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 2.5, TRACK_WIDTH / 2 + 2]}>
           <boxGeometry args={[0.5, 5, 0.5]} />
           <meshStandardMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0, 2.5, -TRACK_WIDTH / 2 - 2]}>
           <boxGeometry args={[0.5, 5, 0.5]} />
           <meshStandardMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0, 5.25, 0]}>
           <boxGeometry args={[0.5, 0.5, TRACK_WIDTH + 4.5]} />
           <meshStandardMaterial color="#4ade80" />
        </mesh>
      </group>

      {/* Finish Line Arch & Line */}
      <group position={[FINISH_LINE_X, 0, 0]}>
        <mesh position={[0, 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          {/* Very thin finish line so it's precise */}
          <planeGeometry args={[0.15, TRACK_WIDTH + 4]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, TRACK_WIDTH + 4]} />
          <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
        </mesh>
        {/* Arch pillars */}
        <mesh position={[0, 2.5, TRACK_WIDTH / 2 + 2]}>
           <boxGeometry args={[0.5, 5, 0.5]} />
           <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 2.5, -TRACK_WIDTH / 2 - 2]}>
           <boxGeometry args={[0.5, 5, 0.5]} />
           <meshStandardMaterial color="#3b82f6" />
        </mesh>
        {/* Arch Top */}
        <mesh position={[0, 5.25, 0]}>
           <boxGeometry args={[0.5, 0.5, TRACK_WIDTH + 4.5]} />
           <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {slices.map((slice, i) => {
        const pIdx = racePodium ? racePodium.findIndex(p => p.id === slice.item.id) : -1;
        const finishingRank = pIdx !== -1 ? pIdx : (slice.item.id === expectedWinnerId ? 0 : i);
        return (
          <Racer 
            key={slice.item.id}
            item={slice.item}
            color={slice.color}
            index={i}
            total={slices.length}
            isSpinning={isSpinning}
            spinDuration={spinDurationMs}
            expectedWinnerId={expectedWinnerId}
            onUpdatePosition={handleUpdatePosition}
            weightFraction={(slice.item.weight || 1) / maxWeight}
            finishingRank={finishingRank}
          />
        );
      })}
    </>
  );
};

export const RaceDisplay = () => {
  const { spinWheel } = useWheelActions();
  const isSpinning = useAppStore(state => state.isSpinning);
  const winner = useAppStore(state => state.winner);
  const { validItems, slices } = useWheelData();

  const handleStart = () => {
    if (!isSpinning && !winner && validItems.length >= 2) {
      spinWheel();
    }
  };

  return (
    <div className="flex-1 w-full h-full relative bg-slate-900 overflow-hidden">
      {/* Leaderboard UI */}
      <div className="absolute top-4 left-4 z-10 w-48 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg overflow-hidden shadow-2xl pointer-events-none">
        <div className="bg-slate-800 px-3 py-2 text-white font-black text-xs tracking-widest uppercase border-b border-slate-700/50 flex justify-between">
          <span>POS</span>
          <span id="sector-display" className="text-amber-500">SECTOR 1</span>
        </div>
        <div className="relative p-2 transition-all duration-300" style={{ height: `${slices.length * 32}px` }}>
           {slices.map((slice, i) => (
             <div 
               key={slice.item.id}
               id={`leaderboard-racer-${slice.item.id}`}
               className="absolute left-2 right-2 flex items-center gap-2 h-7 transition-transform duration-100 ease-linear"
               style={{ transform: `translateY(${i * 32}px)` }}
             >
                <div id={`leaderboard-rank-${slice.item.id}`} className="w-5 text-slate-400 font-bold text-xs text-center">
                  {i + 1}
                </div>
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: slice.color }}></div>
                <div className="text-white text-xs font-bold truncate flex-1">{slice.item.text}</div>
             </div>
           ))}
        </div>
      </div>

      {!isSpinning && !winner && validItems.length >= 2 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <button
            onClick={handleStart}
            className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-slate-900/90 backdrop-blur-md rounded-2xl text-white font-black tracking-widest text-xl uppercase overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-700 hover:border-amber-500"
          >
            <div className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#fff,#fff_5px,#000_5px,#000_10px)] opacity-50"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#fff,#fff_5px,#000_5px,#000_10px)] opacity-50"></div>
            <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Iniciar Corrida</span>
          </button>
        </div>
      )}
      <Canvas shadows="percentage" camera={{ position: [-15, 10, 15], fov: 50 }}>
        <RaceScene />
      </Canvas>
    </div>
  );
};
