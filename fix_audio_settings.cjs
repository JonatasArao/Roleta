const fs = require('fs');

const path = 'src/components/organisms/settings/AudioSettings.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("useTranslation } from")) {
  content = content.replace(
    /import \{ playTickSound, playWinSound, playFailureSound \} from ['"]\.\.\/\.\.\/\.\.\/utils\/audioEngine['"];?/,
    "import { playTickSound, playWinSound, playFailureSound } from '../../../utils/audioEngine';\nimport { useTranslation } from 'react-i18next';"
  );
  fs.writeFileSync(path, content);
}
