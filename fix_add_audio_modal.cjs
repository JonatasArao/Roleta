const fs = require('fs');

const path = 'src/components/organisms/settings/AddAudioModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("useTranslation")) {
  content = content.replace(
    "import { useAudioActions } from \"../../../hooks/useAppActions\";",
    "import { useAudioActions } from \"../../../hooks/useAppActions\";\nimport { useTranslation } from \"react-i18next\";"
  );
  content = content.replace(
    "export const AddAudioModal: React.FC<AddAudioModalProps> = ({ isOpen, onClose }) => {",
    "export const AddAudioModal: React.FC<AddAudioModalProps> = ({ isOpen, onClose }) => {\n  const { t } = useTranslation();"
  );
  fs.writeFileSync(path, content);
}
