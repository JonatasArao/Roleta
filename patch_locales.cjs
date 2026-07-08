const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// EntryItem additions
pt.entryItem = {
  ...pt.entryItem,
  placeholderCompact: "Digite um nome...",
  placeholderFull: "Nome do participante...",
  weight: "Peso",
  changeColor: "Mudar cor",
  sliceSettings: "Configurações da Fatia",
  effectiveWeight: "Peso Efetivo",
  adjustedByBalance: "Ajustado pelo balanceamento.\\nBase",
  current: "Atual",
  disable: "Desativar",
  enable: "Ativar"
};

en.entryItem = {
  ...en.entryItem,
  placeholderCompact: "Enter a name...",
  placeholderFull: "Participant's name...",
  weight: "Weight",
  changeColor: "Change color",
  sliceSettings: "Slice Settings",
  effectiveWeight: "Effective Weight",
  adjustedByBalance: "Adjusted by balance.\\nBase",
  current: "Current",
  disable: "Disable",
  enable: "Enable"
};

// EntrySettings additions
pt.entrySettings = {
  ...pt.entrySettings,
  title: "Configurações da Fatia",
  customAppearance: "Aparência Personalizada",
  appearanceDesc: "Selecione uma imagem ou cor para substituir a padrão",
  cropImage: "Cortar Imagem",
  cropColor: "Cortar Cor",
  winMessage: "Mensagem Pop-up de Vitória",
  winMessagePlh: "Mensagem quando ganhar (opcional)",
  customSound: "Som Personalizado ao Vencer",
  useDefaultSound: "Usar som padrão geral",
  uploadedAudios: "Áudios Enviados",
  newAudio: "Novo Áudio",
  noAudio: "Nenhum áudio enviado ainda.",
  cancel: "Cancelar",
  save: "Salvar Alterações"
};

en.entrySettings = {
  ...en.entrySettings,
  title: "Slice Settings",
  customAppearance: "Custom Appearance",
  appearanceDesc: "Select an image or color to replace the default",
  cropImage: "Crop Image",
  cropColor: "Crop Color",
  winMessage: "Win Pop-up Message",
  winMessagePlh: "Message when winning (optional)",
  customSound: "Custom Win Sound",
  useDefaultSound: "Use general default sound",
  uploadedAudios: "Uploaded Audios",
  newAudio: "New Audio",
  noAudio: "No audio uploaded yet.",
  cancel: "Cancel",
  save: "Save Changes"
};

pt.horizonDisplay = {
  ...pt.horizonDisplay,
  clickToSpin: "clique para girar"
};

en.horizonDisplay = {
  ...en.horizonDisplay,
  clickToSpin: "click to spin"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
