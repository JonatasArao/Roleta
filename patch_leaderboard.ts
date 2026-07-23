import fs from 'fs';
let content = fs.readFileSync('src/components/organisms/RaceDisplay.tsx', 'utf8');

const search = `    const sectorEl = document.getElementById('sector-display');
    if (sectorEl) {
       const leaderX = leaderXRef.current;
       if (leaderX < 3.33) sectorEl.innerText = "SECTOR 1";
       else if (leaderX < 16.66) sectorEl.innerText = "SECTOR 2";
       else sectorEl.innerText = "SECTOR 3";
    }`;

const replace = `    const sectorEl = document.getElementById('sector-display');
    if (sectorEl) {
       const leaderX = leaderXRef.current;
       if (leaderX >= 30) sectorEl.innerText = "FINISH";
       else if (leaderX < 3.33) sectorEl.innerText = "SECTOR 1";
       else if (leaderX < 16.66) sectorEl.innerText = "SECTOR 2";
       else sectorEl.innerText = "SECTOR 3";
    }`;
content = content.replace(search, replace);

fs.writeFileSync('src/components/organisms/RaceDisplay.tsx', content);
