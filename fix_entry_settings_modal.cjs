const fs = require('fs');

const path = 'src/components/organisms/EntrySettingsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("const { t } = useTranslation()")) {
  content = content.replace(
    "export const EntrySettingsModal = () => {",
    "export const EntrySettingsModal = () => {\n  const { t } = useTranslation();"
  );
  fs.writeFileSync(path, content);
}
