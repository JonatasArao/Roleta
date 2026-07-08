const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.header = {
  ...pt.header,
  mute: "Desativar Som",
  unmute: "Ativar Som",
  history: "Histórico de Vencedores"
};

en.header = {
  ...en.header,
  mute: "Mute",
  unmute: "Unmute",
  history: "Winners History"
};

pt.resultsModal = {
  ...pt.resultsModal,
  draw: "Sorteio"
};
en.resultsModal = {
  ...en.resultsModal,
  draw: "Draw"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const headerPath = './src/components/organisms/Header.tsx';
let headerContent = fs.readFileSync(headerPath, 'utf8');

headerContent = headerContent.replace(
  'title={soundEnabled ? "Desativar Som" : "Ativar Som"}',
  'title={soundEnabled ? t("header.mute") : t("header.unmute")}'
);
headerContent = headerContent.replace(
  'title="Histórico de Vencedores"',
  'title={t("header.history")}'
);

fs.writeFileSync(headerPath, headerContent);

const resultsPath = './src/components/organisms/ResultsModal.tsx';
let resultsContent = fs.readFileSync(resultsPath, 'utf8');
resultsContent = resultsContent.replace(
  'title={`Sorteio ${index}: ${res.text}`}',
  'title={`${t("resultsModal.draw")} ${index}: ${res.text}`}'
);
fs.writeFileSync(resultsPath, resultsContent);
