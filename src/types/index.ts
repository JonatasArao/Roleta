export interface Item {
  id: string;
  text: string;
  weight: number;
  enabled: boolean;
  color?: string;
  message?: string;
  sound?: string;
  image?: string;
  isEliminated?: boolean;
  type?: "winner" | "eliminated" | "grand_winner";
  drawId?: string;
}

export interface Result extends Item {
  drawId: string;
  type?: "winner" | "eliminated" | "grand_winner";
}

export interface CustomAudioItem {
  id: string;
  categories: ("tick" | "win")[];
  name: string;
  blob?: Blob;
  url?: string;
  isFile: boolean;
  mode?: "tick" | "continuous";
}

export interface CustomAudio {
  id: string;
  url: string;
  name: string;
  audioObj: HTMLAudioElement;
  isFile: boolean;
  mode?: "tick" | "continuous";
}

export interface WheelConfig {
  title: string;
  entries: {
    text: string;
    weight: number;
    enabled: boolean;
    color?: string;
    message?: string;
    sound?: string;
    image?: string;
  }[];
  colorSettings: { color: string; enabled: boolean }[];
  customPictureDataUri: string;
  winnerMessage: string;
}

export interface AppSettings {
  spinTime: number;
  showConfetti: boolean;
  autoRemoveWinner: boolean;
  soundEnabled: boolean;
  masterVolume: number;
  tickSoundType: string;
  spinSoundMode: string;
  winSoundType: string;
  textSize: number;
  centerSize: number;
  isAdvancedEntries: boolean;
  eliminationMessage?: string;
  grandWinnerMessage?: string;
  eliminationMode?: boolean;
  autoContinueElimination?: boolean;
  pitySystemEnabled?: boolean;
  showPitySystemVisually?: boolean;
  antiRepetitionEnabled?: boolean;
  antiRepetitionCount?: number;
  eliminationSoundType?: string;
  eliminationSpinTime?: number;
  wheelTheme?: string;
}
