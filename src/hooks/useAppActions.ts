import { useAppStore } from '../store/useAppStore';

export const useAudioActions = () => {
  const addCustomAudio = (
    categories: ("tick" | "win")[],
    fileOrUrl: File | string,
    name: string,
    isFile = false,
    mode: "tick" | "continuous" = "tick"
  ) => {
    const { 
      setCustomTickAudios, setTickSoundType,
      setCustomWinAudios, setWinSoundType
    } = useAppStore.getState();

    const newId = crypto.randomUUID();
    const url = isFile
      ? URL.createObjectURL(fileOrUrl as File)
      : (fileOrUrl as string);

    const audioObj = new Audio(url);
    const newAudio = { id: newId, url, name, audioObj, isFile, mode };

    if (categories.includes("tick")) {
      setCustomTickAudios((prev) => [...prev, newAudio]);
      setTickSoundType(newId);
    }
    if (categories.includes("win")) {
      setCustomWinAudios((prev) => [...prev, newAudio]);
      setWinSoundType(newId);
    }
  };

  const removeCustomAudio = (type: "tick" | "win", idToRemove: string) => {
    const state = useAppStore.getState();
    if (type === "tick") {
      const audioToRem = state.customTickAudios.find((a) => a.id === idToRemove);
      if (audioToRem && audioToRem.isFile) URL.revokeObjectURL(audioToRem.url);
      state.setCustomTickAudios((prev) => prev.filter((a) => a.id !== idToRemove));
      if (state.tickSoundType === idToRemove) state.setTickSoundType("click");
    } else {
      const audioToRem = state.customWinAudios.find((a) => a.id === idToRemove);
      if (audioToRem && audioToRem.isFile) URL.revokeObjectURL(audioToRem.url);
      state.setCustomWinAudios((prev) => prev.filter((a) => a.id !== idToRemove));
      if (state.winSoundType === idToRemove) state.setWinSoundType("tada");
    }
  };

  return { addCustomAudio, removeCustomAudio };
};

export const useAppActions = () => {
  const exportWheel = () => {
    const state = useAppStore.getState();
    const wheelData = {
      wheels: [
        {
          wheelConfig: {
            title: state.title,
            entries: state.items.map((item) => ({
              text: item.text,
              weight: item.weight,
              enabled: item.enabled,
              color: item.color,
              message: item.message,
              sound: item.sound,
              image: item.image,
            })),
            colorSettings: state.colors.map((color) => ({ color, enabled: true })),
            spinTime: state.spinTime,
            winnerMessage: state.winMessage,
            autoRemoveWinner: state.autoRemoveWinner,
            launchConfetti: state.showConfetti,
            customPictureDataUri: state.centerImage,
            duringSpinSoundVolume: state.masterVolume,
            afterSpinSoundVolume: state.masterVolume,
            type: "color",
            allowDuplicates: true,
            animateWinner: true,
            displayHideButton: true,
            displayRemoveButton: true,
            displayWinnerDialog: true,
            drawOutlines: false,
            drawShadow: true,
            isAdvanced: true,
            maxNames: 1000,
            pageBackgroundColor: "#FFFFFF",
            pictureType: "uploaded",
            playClickWhenWinnerRemoved: false,
            showTitle: true,
            slowSpin: false,
            pointerChangesColor: true,
            pageGradient: true,
            hubSize: "S",
          },
          path: "",
          shareMode: null,
        },
      ],
    };

    const dataStr = JSON.stringify(wheelData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.title || "roleta"}.wheel`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importWheel = (file: File) => {
    const reader = new FileReader();
    const state = useAppStore.getState();

    reader.onload = (e) => {
      try {
        const jsonStr = e.target?.result as string;
        const data = JSON.parse(jsonStr);
        if (data.wheels && data.wheels[0] && data.wheels[0].wheelConfig) {
          const config = data.wheels[0].wheelConfig;
          if (config.title !== undefined) state.setTitle(config.title);
          if (config.entries && Array.isArray(config.entries)) {
            state.setItems(
              config.entries.map((ent: any) => ({
                id: crypto.randomUUID(),
                text: ent.text || "",
                weight: ent.weight !== undefined ? Number(ent.weight) : 1,
                enabled: ent.enabled !== undefined ? Boolean(ent.enabled) : true,
                color: ent.color,
                message: ent.message,
                sound: ent.sound,
                image: ent.image,
              })),
            );
          }
          if (config.colorSettings && Array.isArray(config.colorSettings)) {
            state.setColors(
              config.colorSettings
                .filter((c: any) => c.enabled !== false)
                .map((c: any) => c.color),
            );
          }
          if (config.spinTime !== undefined) state.setSpinTime(config.spinTime);
          if (config.winnerMessage !== undefined) state.setWinMessage(config.winnerMessage);
          if (config.autoRemoveWinner !== undefined) state.setAutoRemoveWinner(config.autoRemoveWinner);
          if (config.launchConfetti !== undefined) state.setShowConfetti(config.launchConfetti);
          if (config.customPictureDataUri !== undefined) state.setCenterImage(config.customPictureDataUri);
          if (config.duringSpinSoundVolume !== undefined) state.setMasterVolume(config.duringSpinSoundVolume);
        }
      } catch (err) {
        console.error("Erro ao importar o arquivo .wheel", err);
        alert("O arquivo fornecido não é um `.wheel` válido.");
      }
    };
    reader.readAsText(file);
  };

  return { exportWheel, importWheel };
};
