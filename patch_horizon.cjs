const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.horizonDisplay = {
  ...pt.horizonDisplay,
  spin: "Girar Roleta",
  spinning: "Sorteando...",
  grandWinner: "GRANDE VENCEDOR!",
  winner: "TEMOS UM VENCEDOR!",
  reject: "Rejeitar",
  accept: "Aceitar"
};

en.horizonDisplay = {
  ...en.horizonDisplay,
  spin: "Spin Wheel",
  spinning: "Spinning...",
  grandWinner: "GRAND WINNER!",
  winner: "WE HAVE A WINNER!",
  reject: "Reject",
  accept: "Accept"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/HorizonDisplay.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useWheelActions } from '../../hooks/useAppActions';",
  "import { useWheelActions } from '../../hooks/useAppActions';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const HorizonDisplay = () => {",
  "export const HorizonDisplay = () => {\n  const { t } = useTranslation();"
);

const replacements = [
  { search: '>Girar Roleta<', replace: ">{t('horizonDisplay.spin')}<" },
  { search: '>ou pressione ctrl+enter<', replace: ">{t('horizonDisplay.pressEnter')}<" },
  { search: '>Sorteando...<', replace: ">{t('horizonDisplay.spinning')}<" },
  { search: "winner.type === 'grand_winner' ? 'GRANDE VENCEDOR!' : 'TEMOS UM VENCEDOR!'", replace: "winner.type === 'grand_winner' ? t('horizonDisplay.grandWinner') : t('horizonDisplay.winner')" },
  { search: '>Rejeitar<', replace: ">{t('horizonDisplay.reject')}<" },
  { search: '>Aceitar<', replace: ">{t('horizonDisplay.accept')}<" }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(path, content);
