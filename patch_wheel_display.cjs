const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.wheelDisplay = {
  clickToSpin: "clique para girar",
  orPressCtrlEnter: "ou pressione ctrl+enter",
  ariaLabelSpin: "Girar roleta"
};

en.wheelDisplay = {
  clickToSpin: "click to spin",
  orPressCtrlEnter: "or press ctrl+enter",
  ariaLabelSpin: "Spin wheel"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/WheelDisplay.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useWheelActions } from '../../hooks/useAppActions';",
  "import { useWheelActions } from '../../hooks/useAppActions';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const WheelDisplay = () => {",
  "export const WheelDisplay = () => {\n  const { t } = useTranslation();"
);

content = content.replace(
  'aria-label="Girar roleta"',
  'aria-label={t("wheelDisplay.ariaLabelSpin")}'
);
content = content.replace(
  '>clique para girar<',
  '>{t("wheelDisplay.clickToSpin")}<'
);
content = content.replace(
  '>ou pressione ctrl+enter<',
  '>{t("wheelDisplay.orPressCtrlEnter")}<'
);

fs.writeFileSync(path, content);
