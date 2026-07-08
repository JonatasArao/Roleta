const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.sidebar = {
  ...pt.sidebar,
  hidePanel: "Ocultar Painel",
  showPanel: "Mostrar Painel"
};

en.sidebar = {
  ...en.sidebar,
  hidePanel: "Hide Panel",
  showPanel: "Show Panel"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useAppStore } from '../../store/useAppStore';",
  "import { useAppStore } from '../../store/useAppStore';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const Sidebar = () => {",
  "export const Sidebar = () => {\n  const { t } = useTranslation();"
);

content = content.replace(
  'title={isSidebarOpen ? "Ocultar Painel" : "Mostrar Painel"}',
  'title={isSidebarOpen ? t("sidebar.hidePanel") : t("sidebar.showPanel")}'
);

fs.writeFileSync(path, content);
