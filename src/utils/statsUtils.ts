import { Item, Result } from '../types';

export interface ParticipantStat {
  name: string;
  winsCount: number;
  lastWinTimestamp: number | null;
  firstSeenTimestamp: number | null;
  daysWithoutWin: number;
  drawsWithoutWin: number;
  hasWon: boolean;
  isOnWheel: boolean;
  winTimestamps: number[];
}

export function getParticipantStats(items: Item[], results: Result[]): ParticipantStat[] {
  const now = Date.now();
  const todayStart = new Date(now).setHours(0, 0, 0, 0);

  let firstGlobalDrawTimestamp: number | null = null;
  if (results.length > 0) {
    firstGlobalDrawTimestamp = results.reduce((min, r) => {
      if (r.timestamp && r.timestamp < min) return r.timestamp;
      return min;
    }, results[0].timestamp || now);
  }

  const map = new Map<string, {
    displayName: string;
    winsCount: number;
    lastWinTimestamp: number | null;
    firstSeenTimestamp: number | null;
    hasWon: boolean;
    isOnWheel: boolean;
    winTimestamps: number[];
  }>();

  // 1. Collect from items currently on wheel
  items.forEach(item => {
    const name = item.text.trim();
    const key = name.toLowerCase();
    const isOnWheel = item.enabled !== false;
    if (key && !map.has(key)) {
      map.set(key, {
        displayName: name,
        winsCount: 0,
        lastWinTimestamp: null,
        firstSeenTimestamp: null,
        hasWon: false,
        isOnWheel: isOnWheel,
        winTimestamps: [],
      });
    } else if (key && map.has(key)) {
      if (isOnWheel) {
        map.get(key)!.isOnWheel = true;
      }
    }
  });

  // 2. Process results (results is an array of draws)
  results.forEach(res => {
    const name = res.text.trim();
    const key = name.toLowerCase();
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, {
        displayName: name,
        winsCount: 0,
        lastWinTimestamp: null,
        firstSeenTimestamp: null,
        hasWon: false,
        isOnWheel: false,
        winTimestamps: [],
      });
    }

    const stat = map.get(key)!;
    const ts = res.timestamp || now;

    if (stat.firstSeenTimestamp === null || ts < stat.firstSeenTimestamp) {
      stat.firstSeenTimestamp = ts;
    }

    const isWin = res.type === 'winner' || res.type === 'grand_winner' || !res.type;
    if (isWin) {
      stat.winsCount++;
      stat.hasWon = true;
      if (ts !== null) {
        stat.winTimestamps.push(ts);
      }
      if (stat.lastWinTimestamp === null || ts > stat.lastWinTimestamp) {
        stat.lastWinTimestamp = ts;
      }
    }
  });

  const totalDraws = results.length;

  return Array.from(map.values()).map(stat => {
    let daysWithoutWin = 0;
    let drawsWithoutWin = 0;

    if (stat.hasWon && stat.lastWinTimestamp !== null) {
      const winDayStart = new Date(stat.lastWinTimestamp).setHours(0, 0, 0, 0);
      const diffTime = todayStart - winDayStart;
      daysWithoutWin = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      // Count draws that occurred after this participant's last win
      let count = 0;
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const rTs = r.timestamp || 0;
        if (rTs > stat.lastWinTimestamp) {
          count++;
        } else {
          break;
        }
      }
      drawsWithoutWin = count;
    } else {
      drawsWithoutWin = totalDraws;
      const baseTimestamp = firstGlobalDrawTimestamp !== null ? firstGlobalDrawTimestamp : stat.firstSeenTimestamp;
      if (baseTimestamp !== null) {
        const firstDayStart = new Date(baseTimestamp).setHours(0, 0, 0, 0);
        const diffTime = todayStart - firstDayStart;
        daysWithoutWin = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      } else {
        daysWithoutWin = 0;
      }
    }

    return {
      name: stat.displayName,
      winsCount: stat.winsCount,
      lastWinTimestamp: stat.lastWinTimestamp,
      firstSeenTimestamp: stat.firstSeenTimestamp,
      daysWithoutWin,
      drawsWithoutWin,
      hasWon: stat.hasWon,
      isOnWheel: stat.isOnWheel,
      winTimestamps: stat.winTimestamps.sort((a, b) => b - a),
    };
  });
}
