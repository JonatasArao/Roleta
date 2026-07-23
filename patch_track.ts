import fs from 'fs';
let content = fs.readFileSync('src/components/organisms/RaceDisplay.tsx', 'utf8');

const trackVisuals = `      {/* The Track Base */}
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
            <group key={\`lane-\${i}\`}>
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
      </group>`;

const searchRegex = /\{\/\* The Track Base \*\/\}[\s\S]*?\{\/\* Finish Line \*\/\}[\s\S]*?<\/group>/;
content = content.replace(searchRegex, trackVisuals);

fs.writeFileSync('src/components/organisms/RaceDisplay.tsx', content);
