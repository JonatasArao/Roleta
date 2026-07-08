const fs = require('fs');

const path = 'src/components/organisms/ResultsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("const { t, i18n } = useTranslation()")) {
  content = content.replace(
    "const { t } = useTranslation();",
    "const { t, i18n } = useTranslation();"
  );
  fs.writeFileSync(path, content);
}
