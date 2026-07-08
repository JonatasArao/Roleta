const fs = require('fs');

const filesToFix = [
  'src/components/organisms/MysteryBoxDisplay.tsx',
  'src/components/organisms/HorizonDisplay.tsx',
  'src/components/organisms/WheelDisplay.tsx',
  'src/components/organisms/WinnerModal.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("import { useTranslation }")) {
    content = content.replace(
      "import { useWheelActions } from '../../hooks/useWheelActions';",
      "import { useWheelActions } from '../../hooks/useWheelActions';\nimport { useTranslation } from 'react-i18next';"
    );
    fs.writeFileSync(file, content);
  }
});

const audioSettingsPath = 'src/components/organisms/settings/AudioSettings.tsx';
let audioSettingsContent = fs.readFileSync(audioSettingsPath, 'utf8');
if (!audioSettingsContent.includes("import { useTranslation }")) {
  audioSettingsContent = audioSettingsContent.replace(
    "import { playTickSound, playWinSound, playFailureSound } from '../../../utils/audioEngine';",
    "import { playTickSound, playWinSound, playFailureSound } from '../../../utils/audioEngine';\nimport { useTranslation } from 'react-i18next';"
  );
  fs.writeFileSync(audioSettingsPath, audioSettingsContent);
}

const visualSettingsPath = 'src/components/organisms/settings/VisualSettings.tsx';
let visualSettingsContent = fs.readFileSync(visualSettingsPath, 'utf8');
if (!visualSettingsContent.includes("import { useTranslation }")) {
  visualSettingsContent = visualSettingsContent.replace(
    "import { useAppStore } from '../../../store/useAppStore';",
    "import { useAppStore } from '../../../store/useAppStore';\nimport { useTranslation } from 'react-i18next';"
  );
  fs.writeFileSync(visualSettingsPath, visualSettingsContent);
}

