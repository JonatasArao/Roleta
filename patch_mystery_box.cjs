const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.mysteryBox = {
  mixing: "Misturando...",
  chosen: "A Escolhida!",
  choose: "Escolher",
  clickBoxOr: "Clique em uma caixa ou",
  shuffling: "Embaralhando...",
  randomChoice: "Escolha Aleatória"
};

en.mysteryBox = {
  mixing: "Mixing...",
  chosen: "The Chosen One!",
  choose: "Choose",
  clickBoxOr: "Click a box or",
  shuffling: "Shuffling...",
  randomChoice: "Random Choice"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/MysteryBoxDisplay.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useWheelActions } from '../../hooks/useAppActions';",
  "import { useWheelActions } from '../../hooks/useAppActions';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const MysteryBoxDisplay = () => {",
  "export const MysteryBoxDisplay = () => {\n  const { t } = useTranslation();"
);

const replacements = [
  { search: 'isSpinning ? "Misturando..." : (winner ? "A Escolhida!" : "Escolher")', replace: 'isSpinning ? t("mysteryBox.mixing") : (winner ? t("mysteryBox.chosen") : t("mysteryBox.choose"))' },
  { search: '>Clique em uma caixa ou<', replace: ">{t('mysteryBox.clickBoxOr')}<" },
  { search: "isSpinning ? 'Embaralhando...' : 'Escolha Aleatória'", replace: "isSpinning ? t('mysteryBox.shuffling') : t('mysteryBox.randomChoice')" }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(path, content);
