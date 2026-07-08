const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.audioSettings = {
  title: "Som do Sorteio",
  masterVolume: "Volume Principal",
  tabWheel: "Roleta",
  tabWin: "Vitória",
  tabElimination: "Eliminação",
  defaultTickSounds: "Sons Padrão de Giro",
  customAudios: "Áudios Personalizados",
  newAudio: "Novo Áudio",
  noCustomAudio: "Nenhum áudio personalizado adicionado.",
  defaultWinSounds: "Sons Padrão de Vitória",
  defaultEliminationSounds: "Sons Padrão de Eliminação",
  customAudiosShared: "Áudios Personalizados (Partilhados com Vitória)",
  noAudioConfigured: "Nenhum áudio configurado.",
  localFile: "Arquivo Local",
  externalURL: "URL Externa",
  continuousMusicMode: "Música Contínua",
  tickMode: "Tick"
};

en.audioSettings = {
  title: "Draw Sound",
  masterVolume: "Master Volume",
  tabWheel: "Wheel",
  tabWin: "Win",
  tabElimination: "Elimination",
  defaultTickSounds: "Default Spin Sounds",
  customAudios: "Custom Audios",
  newAudio: "New Audio",
  noCustomAudio: "No custom audio added.",
  defaultWinSounds: "Default Win Sounds",
  defaultEliminationSounds: "Default Elimination Sounds",
  customAudiosShared: "Custom Audios (Shared with Win)",
  noAudioConfigured: "No audio configured.",
  localFile: "Local File",
  externalURL: "External URL",
  continuousMusicMode: "Continuous Music",
  tickMode: "Tick"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/settings/AudioSettings.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { playTickSound, playWinSound, playFailureSound } from '../../../utils/audioEngine';",
  "import { playTickSound, playWinSound, playFailureSound } from '../../../utils/audioEngine';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const AudioSettings = () => {",
  "export const AudioSettings = () => {\n  const { t } = useTranslation();"
);

const replacements = [
  { search: '>Som do Sorteio<', replace: ">{t('audioSettings.title')}<" },
  { search: '>Volume Principal<', replace: ">{t('audioSettings.masterVolume')}<" },
  { search: '>Roleta<', replace: ">{t('audioSettings.tabWheel')}<" },
  { search: '>Vitória<', replace: ">{t('audioSettings.tabWin')}<" },
  { search: '>Eliminação<', replace: ">{t('audioSettings.tabElimination')}<" },
  { search: '>Sons Padrão de Giro<', replace: ">{t('audioSettings.defaultTickSounds')}<" },
  { search: '>Áudios Personalizados<', replace: ">{t('audioSettings.customAudios')}<" },
  { search: '> Novo Áudio<', replace: "> {t('audioSettings.newAudio')}<" },
  { search: '>Nenhum áudio personalizado adicionado.<', replace: ">{t('audioSettings.noCustomAudio')}<" },
  { search: '>Sons Padrão de Vitória<', replace: ">{t('audioSettings.defaultWinSounds')}<" },
  { search: '>Sons Padrão de Eliminação<', replace: ">{t('audioSettings.defaultEliminationSounds')}<" },
  { search: '>Áudios Personalizados (Partilhados com Vitória)<', replace: ">{t('audioSettings.customAudiosShared')}<" },
  { search: '>Nenhum áudio configurado.<', replace: ">{t('audioSettings.noAudioConfigured')}<" },
  { search: "'Arquivo Local' : 'URL Externa'", replace: "t('audioSettings.localFile') : t('audioSettings.externalURL')" }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(new RegExp(search, 'g'), replace);
});

fs.writeFileSync(path, content);
