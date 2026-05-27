// --- SERVIÇO DE ÁUDIO (Web Audio API) ---
const audioCtx =
  typeof window !== "undefined"
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null;

export const playTickSound = (
  baseVolume = 0.5,
  type = "click",
  customAudioObj: HTMLAudioElement | null = null,
  masterVolume = 1,
) => {
  if (masterVolume === 0) return;
  const volume = baseVolume * masterVolume;

  if (customAudioObj) {
    const clone = customAudioObj.cloneNode() as HTMLAudioElement;
    clone.volume = Math.min(masterVolume * 1.5, 1); // Aumenta um pouco o volume base para audios customizados, limitando a 1.0
    clone.play().catch(() => {});
    return;
  }

  const knownTickTypes = [
    "click",
    "beep",
    "pop",
    "madeira",
    "metal",
    "synth",
    "drum",
    "bambu",
    "vidro",
  ];
  if (!knownTickTypes.includes(type)) {
    return;
  }

  if (volume === 0) return;
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  let finalVolume = volume;

  if (type === "beep") {
    osc.type = "square";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    finalVolume = volume * 0.3;
  } else if (type === "pop") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  } else if (type === "madeira") {
    osc.type = "square";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    finalVolume = volume * 0.4;
  } else if (type === "metal") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  } else if (type === "synth") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    finalVolume = volume * 0.2;
  } else if (type === "drum") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.1,
    );
    finalVolume = volume * 0.8;
  } else if (type === "bambu") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
  } else if (type === "vidro") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, audioCtx.currentTime);
    finalVolume = volume * 0.3;
  } else {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  }

  gain.gain.setValueAtTime(finalVolume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
};

let activeWinAudio: HTMLAudioElement | null = null;

export const playWinSound = (
  baseVolume = 0.6,
  type = "tada",
  customAudioObj: HTMLAudioElement | null = null,
  masterVolume = 1,
) => {
  if (masterVolume === 0) return;
  const volume = baseVolume * masterVolume;

  if (activeWinAudio) {
    activeWinAudio.pause();
    activeWinAudio.currentTime = 0;
  }

  if (customAudioObj) {
    const clone = customAudioObj.cloneNode() as HTMLAudioElement;
    clone.currentTime = 0;
    clone.volume = Math.min(masterVolume * 1.5, 1); // Increased base volume
    clone.play().catch(() => {});
    activeWinAudio = clone;
    return;
  }

  const mixkitMap: Record<string, string> = {
    "aplausos-suaves":
      "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
    "aplausos-fortes":
      "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
    trombeta:
      "https://assets.mixkit.co/active_storage/sfx/2598/2598-preview.mp3",
    "sino-vitoria":
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    surpresa:
      "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3",
  };

  if (mixkitMap[type]) {
    const audio = new Audio(mixkitMap[type]);
    audio.volume = masterVolume;
    audio.play().catch(() => {});
    activeWinAudio = audio;
    return;
  }

  const knownTypes = [
    "tada",
    "fanfarra",
    "sino",
    "harpa",
    "magia",
    "orquestra",
  ];
  if (!knownTypes.includes(type)) {
    return;
  }

  if (volume === 0) return;
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  let frequencies = [523.25, 659.25, 783.99, 1046.5];
  let waveType: OscillatorType = "triangle";
  let finalVolume = volume;

  if (type === "fanfarra") {
    frequencies = [440, 554.37, 659.25, 880];
    waveType = "square";
    finalVolume = volume * 0.3;
  } else if (type === "sino") {
    frequencies = [1046.5, 1318.51, 1567.98];
    waveType = "sine";
  } else if (type === "harpa") {
    frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    waveType = "sine";
    finalVolume = volume * 0.5;
  } else if (type === "magia") {
    frequencies = [1046.5, 1567.98, 2093.0, 3135.96];
    waveType = "sine";
    finalVolume = volume * 0.3;
  } else if (type === "orquestra") {
    frequencies = [261.63, 329.63, 392.0, 523.25];
    waveType = "square";
    finalVolume = volume * 0.2;
  }

  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = waveType;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    const speed = type === "harpa" ? 0.05 : 0.1;
    const sustain = type === "harpa" ? 0.5 : 1.5;

    gain.gain.linearRampToValueAtTime(
      finalVolume,
      audioCtx.currentTime + speed + i * speed,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + sustain + i * speed,
    );

    osc.start(audioCtx.currentTime + i * speed);
    osc.stop(audioCtx.currentTime + sustain + i * speed);
  });
};

export const playFailureSound = (masterVolume = 1, type: string = "failure", customAudioObj: HTMLAudioElement | null = null) => {
  if (masterVolume === 0) return;
  
  if (activeWinAudio) {
    activeWinAudio.pause();
    activeWinAudio.currentTime = 0;
  }

  if (customAudioObj) {
    const clone = customAudioObj.cloneNode() as HTMLAudioElement;
    clone.volume = masterVolume;
    clone.currentTime = 0;
    clone.play().catch(() => {});
    activeWinAudio = clone;
    return;
  }

  let audioUrl = "https://assets.mixkit.co/active_storage/sfx/2834/2834-preview.mp3";
  if (type === "sad_trombone") {
    audioUrl = "https://assets.mixkit.co/active_storage/sfx/2974/2974-preview.mp3";
  } else if (type === "buzzer") {
    audioUrl = "https://assets.mixkit.co/active_storage/sfx/2828/2828-preview.mp3";
  }

  const audio = new Audio(audioUrl);
  audio.volume = masterVolume;
  audio.play().catch(() => {});
  activeWinAudio = audio;
};

export const stopWinSound = () => {
  if (activeWinAudio) {
    activeWinAudio.pause();
    activeWinAudio.currentTime = 0;
    activeWinAudio = null;
  }
};

export const getAudioCtx = () => audioCtx;
