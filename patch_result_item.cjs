const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.resultItem = {
  winner: "Vencedor",
  eliminated: "Eliminado",
  grandChampion: "Grande Campeão"
};

en.resultItem = {
  winner: "Winner",
  eliminated: "Eliminated",
  grandChampion: "Grand Champion"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/molecules/ResultItem.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { Result } from '../../types';",
  "import { Result } from '../../types';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const ResultItem: React.FC<ResultItemProps> = ({ result, index }) => {",
  "export const ResultItem: React.FC<ResultItemProps> = ({ result, index }) => {\n  const { t } = useTranslation();"
);

content = content.replace(
  'let label = "Vencedor";',
  'let label = t("resultItem.winner");'
);
content = content.replace(
  'label = "Eliminado";',
  'label = t("resultItem.eliminated");'
);
content = content.replace(
  'label = "Grande Campeão";',
  'label = t("resultItem.grandChampion");'
);

fs.writeFileSync(path, content);
