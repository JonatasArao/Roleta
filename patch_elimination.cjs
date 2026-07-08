const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.eliminationFeed = {
  ...pt.eliminationFeed,
  eliminated: "Eliminado"
};

en.eliminationFeed = {
  ...en.eliminationFeed,
  eliminated: "Eliminated"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/EliminationFeed.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useAppStore } from '../../store/useAppStore';",
  "import { useAppStore } from '../../store/useAppStore';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const EliminationFeed = () => {",
  "export const EliminationFeed = () => {\n  const { t } = useTranslation();"
);

content = content.replace(
  "const eliminationMessage = useAppStore(s => s.eliminationMessage) || 'Eliminado';",
  "const eliminationMessage = useAppStore(s => s.eliminationMessage) || t('eliminationFeed.eliminated');"
);

fs.writeFileSync(path, content);
