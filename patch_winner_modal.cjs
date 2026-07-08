const fs = require('fs');

const path = './src/components/organisms/WinnerModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useWheelActions } from '../../hooks/useWheelActions';",
  "import { useWheelActions } from '../../hooks/useWheelActions';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const WinnerModal = () => {",
  "export const WinnerModal = () => {\n  const { t } = useTranslation();"
);

content = content.replace(
  ">REJEITAR<",
  ">{t('winnerModal.reject').toUpperCase()}<"
);
content = content.replace(
  ">ACEITAR<",
  ">{t('winnerModal.accept').toUpperCase()}<"
);
content = content.replace(
  ">REJEITO<",
  ">{t('winnerModal.reject').toUpperCase()}<"
);
content = content.replace(
  ">ACEITO<",
  ">{t('winnerModal.accept').toUpperCase()}<"
);

fs.writeFileSync(path, content);
