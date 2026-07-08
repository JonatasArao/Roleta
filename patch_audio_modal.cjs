const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.addAudioModal = {
  title: "Adicionar Áudio Personalizado",
  whereToUse: "Onde deseja usar este áudio?",
  spin: "Giro da Roleta",
  win: "Vitória",
  selectOption: "Selecione pelo menos uma opção.",
  behavior: "Comportamento (Giro da Roleta)",
  tickMode: "Bate e Volta (Ponteiro)",
  musicMode: "Música de Fundo",
  audioName: "Nome do Áudio",
  audioNamePlh: "Ex: Efeito Super Mario",
  uploadFile: "Enviar Arquivo",
  copyURL: "Copiar URL Direta",
  clickToSelect: "Clique para selecionar MP3 / WAV",
  cancel: "Cancelar",
  add: "Adicionar",
  alertNoCategory: "Por favor, selecione onde o áudio será usado (Roleta, Vitória ou Ambos).",
  alertNoFile: "Por favor, selecione um arquivo.",
  alertNoURL: "Por favor, cole uma URL válida."
};

en.addAudioModal = {
  title: "Add Custom Audio",
  whereToUse: "Where do you want to use this audio?",
  spin: "Wheel Spin",
  win: "Win",
  selectOption: "Select at least one option.",
  behavior: "Behavior (Wheel Spin)",
  tickMode: "Tick (Pointer)",
  musicMode: "Background Music",
  audioName: "Audio Name",
  audioNamePlh: "Ex: Super Mario Effect",
  uploadFile: "Upload File",
  copyURL: "Copy Direct URL",
  clickToSelect: "Click to select MP3 / WAV",
  cancel: "Cancel",
  add: "Add",
  alertNoCategory: "Please select where the audio will be used (Spin, Win or Both).",
  alertNoFile: "Please select a file.",
  alertNoURL: "Please paste a valid URL."
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/settings/AddAudioModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { Music, X, Upload } from 'lucide-react';",
  "import { Music, X, Upload } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const AddAudioModal = ({ isOpen, onClose }: AddAudioModalProps) => {",
  "export const AddAudioModal = ({ isOpen, onClose }: AddAudioModalProps) => {\n  const { t } = useTranslation();"
);

// Alerts
content = content.replace(
  'alert("Por favor, selecione onde o áudio será usado (Roleta, Vitória ou Ambos).");',
  'alert(t("addAudioModal.alertNoCategory"));'
);
content = content.replace(
  'alert("Por favor, selecione um arquivo.");',
  'alert(t("addAudioModal.alertNoFile"));'
);
content = content.replace(
  'alert("Por favor, cole uma URL válida.");',
  'alert(t("addAudioModal.alertNoURL"));'
);

// Texts
const replacements = [
  { search: 'Adicionar Áudio Personalizado', replace: "{t('addAudioModal.title')}" },
  { search: 'Onde deseja usar este áudio?', replace: "{t('addAudioModal.whereToUse')}" },
  { search: '>Giro da Roleta<', replace: ">{t('addAudioModal.spin')}<" },
  { search: '>Vitória<', replace: ">{t('addAudioModal.win')}<" },
  { search: '>Selecione pelo menos uma opção.<', replace: ">{t('addAudioModal.selectOption')}<" },
  { search: 'Comportamento (Giro da Roleta)', replace: "{t('addAudioModal.behavior')}" },
  { search: '>Bate e Volta (Ponteiro)<', replace: ">{t('addAudioModal.tickMode')}<" },
  { search: '>Música de Fundo<', replace: ">{t('addAudioModal.musicMode')}<" },
  { search: '>Nome do Áudio<', replace: ">{t('addAudioModal.audioName')}<" },
  { search: 'placeholder="Ex: Efeito Super Mario"', replace: "placeholder={t('addAudioModal.audioNamePlh')}" },
  { search: 'Enviar Arquivo', replace: "{t('addAudioModal.uploadFile')}" },
  { search: 'Copiar URL Direta', replace: "{t('addAudioModal.copyURL')}" },
  { search: '>Clique para selecionar MP3 / WAV<', replace: ">{t('addAudioModal.clickToSelect')}<" },
  { search: '>Cancelar<', replace: ">{t('addAudioModal.cancel')}<" },
  { search: '>Adicionar<', replace: ">{t('addAudioModal.add')}<" }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(path, content);
