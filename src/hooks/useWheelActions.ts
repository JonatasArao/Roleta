import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getSecureRandom, secureShuffle } from '../utils/cryptoRandom';
import { getAudioCtx, playTickSound, playWinSound, playFailureSound, stopWinSound } from '../utils/audioEngine';
import { useWheelData } from './useWheelData';
import {
  FULL_CIRCLE_DEG,
  WHEEL_TOP_OFFSET_DEG,
  SLICE_RANDOM_OFFSET_MULTIPLIER,
  SLICE_RANDOM_OFFSET_SUBTRACTOR,
  MIN_EXTRA_SPINS,
  TICK_BASE_DELAY_MS,
  TICK_DELAY_MULTIPLIER,
  SPIN_COMPLETION_SOUND_THRESHOLD_MS
} from '../constants';

export const updateContinuousAudioVolume = () => {
  const state = useAppStore.getState();
  const { continuousAudioRef } = state;
  if (continuousAudioRef) {
    const actualVolume = state.soundEnabled ? state.masterVolume / 100 : 0;
    continuousAudioRef.volume = actualVolume;
  }
};

export const useWheelActions = () => {

  const { slices } = useWheelData();

  const clearTimeouts = () => {
    const state = useAppStore.getState();
    if (state.spinTimeoutRef) clearTimeout(state.spinTimeoutRef);
    state.tickTimeoutsRef.forEach(clearTimeout);
    state.setSpinTimeoutRef(null);
    state.setTickTimeoutsRef([]);
  };

  const stopContinuousAudio = () => {
    const state = useAppStore.getState();
    const { continuousAudioRef } = state;
    if (continuousAudioRef) {
      continuousAudioRef.pause();
      continuousAudioRef.currentTime = 0;
      state.setContinuousAudioRef(null);
    }
  };

  const handleAddEmptyItem = () => {
    const { isSpinning, setItems } = useAppStore.getState();
    if (!isSpinning) {
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: "", weight: 1, enabled: true },
      ]);
    }
  };

  const handleUpdateItem = (id: string, updates: any) => {
    useAppStore.getState().setItems((prev: any[]) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    const { isSpinning, setItems } = useAppStore.getState();
    if (!isSpinning) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveItem = (id: string, dir: "up" | "down") => {
    const { isSpinning, setItems } = useAppStore.getState();
    if (isSpinning) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      if (dir === "up" && idx > 0) {
        const newItems = [...prev];
        [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
        return newItems;
      }
      if (dir === "down" && idx < prev.length - 1) {
        const newItems = [...prev];
        [newItems[idx + 1], newItems[idx]] = [newItems[idx], newItems[idx + 1]];
        return newItems;
      }
      return prev;
    });
  };

  const handleShuffle = () => {
    const { isSpinning, setItems } = useAppStore.getState();
    if (!isSpinning) setItems((prev) => secureShuffle(prev));
  };

  const handleSort = () => {
    const { isSpinning, setItems } = useAppStore.getState();
    if (!isSpinning) {
      setItems((prev) =>
        [...prev].sort((a, b) => a.text.localeCompare(b.text))
      );
    }
  };

  const handleAddColor = () => {
    const { newColor, setColors } = useAppStore.getState();
    setColors((prev) => [...prev, newColor]);
  };

  const handleRemoveColor = (indexToRemove: number) => {
    useAppStore.getState().setColors((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const spinWheel = useCallback((fastSpin: boolean = false) => {
    const state = useAppStore.getState();
    const currentItems = state.items;
    const currentValidItems = currentItems.filter((i) => i.enabled && i.text.trim() !== "");
    
    if (state.isSpinning || currentValidItems.length < 2) return;
    const ctx = getAudioCtx();
    if (ctx && ctx.state === "suspended") ctx.resume();

    state.setIsSpinning(true);
    if (!state.autoContinueElimination || !state.eliminationMode) {
      state.setWinner(null);
    }
    clearTimeouts();

    const getActualWeight = (item: any) => {
      const baseWeight = item.weight || 1;
      let extraWeight = 0;
      if (state.pitySystemEnabled && !state.eliminationMode) {
        const idx = state.results.findIndex((r) => 
          r.id === item.id || r.text.trim().toLowerCase() === item.text.trim().toLowerCase()
        );
        extraWeight = idx === -1 ? state.results.length : idx;
      }
      return baseWeight + extraWeight;
    };

    let totalWeight = currentValidItems.reduce(
      (acc, item) => acc + getActualWeight(item),
      0,
    );
    if (totalWeight <= 0) totalWeight = currentValidItems.length;

    const pickWinnerIndex = () => {
      let randomWeight = getSecureRandom() * totalWeight;
      let currentWeight = 0;
      for (let i = 0; i < currentValidItems.length; i++) {
        currentWeight += getActualWeight(currentValidItems[i]);
        if (randomWeight < currentWeight) {
          return i;
        }
      }
      return 0;
    };

    let winIndex = pickWinnerIndex();

    const winSlice = slices[winIndex];
    if (!winSlice) {
      state.setIsSpinning(false);
      state.setExpectedWinnerId(undefined);
      return;
    }

    state.setExpectedWinnerId(currentValidItems[winIndex].id);

    const randomOffset = state.wheelType === 'horizon' 
      ? 0 
      : getSecureRandom() * (winSlice.angle * SLICE_RANDOM_OFFSET_MULTIPLIER) - winSlice.angle * SLICE_RANDOM_OFFSET_SUBTRACTOR;
    const sliceCenter = winSlice.startAngle + winSlice.angle / 2;
    const targetAngle = FULL_CIRCLE_DEG + WHEEL_TOP_OFFSET_DEG - sliceCenter + randomOffset;

    const isFinalRound = state.eliminationMode && currentValidItems.length === 2;
    const actualSpinTime = isFinalRound 
      ? state.spinTime 
      : (state.eliminationMode ? state.eliminationSpinTime : state.spinTime);

    const isMysteryBox = state.wheelType === 'mystery_box';
    const isInstantSpin = isMysteryBox && fastSpin;
    const spinDurationMs = isInstantSpin ? 50 : actualSpinTime * 1000;
    // adding a highly random range of extra rotations to add more chaos to the wheel
    const randomExtraRotations = Math.floor(getSecureRandom() * 15) + 6;
    const extraSpins = isMysteryBox ? 0 : FULL_CIRCLE_DEG * (Math.max(MIN_EXTRA_SPINS, Math.floor(actualSpinTime)) + randomExtraRotations);
    
    // Add micro variations to the target angle to jitter the final resting place
    const finalTargetAngle = targetAngle + (getSecureRandom() * 4 - 2); 
    
    // make base current rotation entirely detached from any predictable cadence by picking current base safely
    const currentBase = state.rotation;
    const currentModulo = currentBase % FULL_CIRCLE_DEG;
    const newRotation = currentBase - currentModulo + extraSpins + finalTargetAngle;

    state.setRotation(newRotation);

    const actualVolume = state.soundEnabled ? state.masterVolume / 100 : 0;
    const selectedCustomTick = state.customTickAudios.find((a) => a.id === state.tickSoundType);
    const selectedCustomWin = state.customWinAudios.find((a) => a.id === state.winSoundType)?.audioObj || null;

    if (actualVolume > 0 && !isInstantSpin) {
      if (selectedCustomTick && selectedCustomTick.mode === "continuous" && selectedCustomTick.audioObj) {
        selectedCustomTick.audioObj.volume = actualVolume;
        selectedCustomTick.audioObj.loop = true;
        
        if (state.continuousAudioRef !== selectedCustomTick.audioObj || selectedCustomTick.audioObj.paused) {
          selectedCustomTick.audioObj.currentTime = 0;
          selectedCustomTick.audioObj.play().catch(() => {});
        }
        state.setContinuousAudioRef(selectedCustomTick.audioObj);
      } else {
        let delay = TICK_BASE_DELAY_MS;
        let currentTime = 0;

        const playNextTickTimer = () => {
          if (currentTime >= spinDurationMs - SPIN_COMPLETION_SOUND_THRESHOLD_MS) return;
          playTickSound(0.5, state.tickSoundType, selectedCustomTick?.audioObj || null, actualVolume);

          const progress = currentTime / spinDurationMs;
          delay = TICK_BASE_DELAY_MS + Math.pow(progress, 3) * TICK_DELAY_MULTIPLIER;
          currentTime += delay;
          const timeout = setTimeout(playNextTickTimer, delay);
          
          useAppStore.getState().setTickTimeoutsRef(prev => [...prev, timeout]);
        };
        playNextTickTimer();
      }
    }

    const newSpinTimeout = setTimeout(() => {
      const currentState = useAppStore.getState();
      currentState.setIsSpinning(false);

      const winningItem = currentValidItems[winIndex];
      const isFinalRound = currentState.eliminationMode && currentValidItems.length === 2;

      if (!currentState.eliminationMode || isFinalRound) {
        stopContinuousAudio();
      }

      const drawId = crypto.randomUUID();
      const type = isFinalRound ? 'grand_winner' : (currentState.eliminationMode ? 'eliminated' : 'winner');

      if (currentState.eliminationMode && !isFinalRound) {
        currentState.setWinner({ ...winningItem, isEliminated: true, type: 'eliminated' });
      } else if (isFinalRound) {
        currentState.setWinner({ ...winningItem, isEliminated: false, type: 'grand_winner', drawId });
        // Disable the OTHER item magically to clean state since game is over
        const otherItem = currentValidItems.find(i => i.id !== winningItem.id);
        if (otherItem) {
           currentState.setItems(prev => prev.map(i => i.id === otherItem.id ? { ...i, enabled: false } : i));
        }
      } else {
        currentState.setWinner({ ...winningItem, type: 'winner', drawId });
      }
      
      if (type !== 'eliminated') {
        currentState.setResults((prev) => [
          { ...winningItem, drawId, type },
          ...prev,
        ]);
      }

      // Pity system weights are now computed dynamically from results history, no state update needed here.

      if (actualVolume > 0) {
        if (currentState.eliminationMode && !isFinalRound) {
          const genericCustomFail = currentState.customWinAudios.find(a => a.id === currentState.eliminationSoundType)?.audioObj || null;
          playFailureSound(actualVolume, currentState.eliminationSoundType, genericCustomFail);
        } else {
          const customSound = winningItem.sound;
          if (customSound && customSound !== "") {
            const foundCustomAudio =
              currentState.customWinAudios.find((a) => a.id === customSound)?.audioObj || null;
            playWinSound(0.6, customSound, foundCustomAudio, actualVolume);
          } else {
            const genericCustomWin = currentState.customWinAudios.find(a => a.id === currentState.winSoundType)?.audioObj || null;
            playWinSound(0.6, currentState.winSoundType, genericCustomWin, actualVolume);
          }
        }
      }
    }, spinDurationMs);

    state.setSpinTimeoutRef(newSpinTimeout);
  }, [slices]);

  return {
    handleAddEmptyItem,
    handleUpdateItem,
    handleRemoveItem,
    handleMoveItem,
    handleShuffle,
    handleSort,
    handleAddColor,
    handleRemoveColor,
    spinWheel,
    clearTimeouts,
    stopContinuousAudio,
    stopWinSound
  };
};
