import fs from 'fs';
let content = fs.readFileSync('src/components/organisms/RaceDisplay.tsx', 'utf8');

const useEffectReplace = `  useEffect(() => {
    if (isSpinning) {
      let tp = 0;
      if (isWinner) {
        tp = 1.03 + Math.random() * 0.02; // Winner crosses finish line (X=30)
      } else {
        tp = 0.85 + (0.12 * weightFraction) + (Math.random() - 0.5) * 0.05;
        if (tp > 0.99) tp = 0.99; // Ensure losers stay behind the finish line
      }
      raceData.targetProgress = tp;

      const numPoints = 150;
      const profile = [];
      const A1 = (Math.random() - 0.5) * 0.35;
      const A2 = (Math.random() - 0.5) * 0.20;
      const A3 = (Math.random() - 0.5) * 0.10;
      const A4 = (Math.random() - 0.5) * 0.05;

      let lastP = 0;
      for (let i = 0; i <= numPoints; i++) {
         const t = i / numPoints; 
         const base = t; 
         
         const noise = A1 * Math.sin(1 * Math.PI * t) + 
                       A2 * Math.sin(2 * Math.PI * t) + 
                       A3 * Math.sin(3 * Math.PI * t) + 
                       A4 * Math.sin(5 * Math.PI * t);
                       
         let div = 0;
         const split = 0.85;
         if (t > split) {
            const x = (t - split) / (1 - split);
            const smooth = x * x * (3 - 2 * x); // Ease-in-out
            div = smooth * (tp - 1.0);
         }
         
         let p = base + noise + div;
         
         // Ensure monotonically increasing
         if (p < lastP) p = lastP;
         
         profile.push(p);
         lastP = p;
      }
      
      raceData.profile = profile;
    }
  }, [isSpinning, isWinner, weightFraction, raceData]);`;

content = content.replace(/  useEffect\(\(\) => \{\n    if \(isSpinning\) \{\n      let tp = 0;[\s\S]*?raceData\.profile = profile;\n    \}\n  \}, \[isSpinning, isWinner, weightFraction, raceData\]\);/, useEffectReplace);

fs.writeFileSync('src/components/organisms/RaceDisplay.tsx', content);
