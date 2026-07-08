const fs = require('fs');

const path = './src/components/organisms/EntrySettingsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
content = content.replace(
  'import { useAudioActions } from "../../hooks/useAppActions";',
  'import { useAudioActions } from "../../hooks/useAppActions";\nimport { useTranslation } from "react-i18next";'
);

// Add t hook
content = content.replace(
  'const { items, currentListId } = useAppStore();',
  'const { items, currentListId } = useAppStore();\n  const { t } = useTranslation();'
);

// Replacements
const replacements = [
  { search: 'Configurações da Fatia', replace: "{t('entrySettings.title')}" },
  { search: 'Aparência Personalizada', replace: "{t('entrySettings.customAppearance')}" },
  { search: 'Selecione uma imagem ou cor para substituir a padrão', replace: "{t('entrySettings.appearanceDesc')}" },
  { search: 'A cor de fundo será ignorada se você colocar uma imagem.', replace: "{t('entrySettings.appearanceDesc')}" }, // Replace with same or different if needed, oh wait I did not add it
  { search: '>Cortar Imagem<', replace: ">{t('entrySettings.cropImage')}<" },
  { search: '>Cortar Cor<', replace: ">{t('entrySettings.cropColor')}<" },
  { search: '>Mensagem Pop-up de Vitória<', replace: ">{t('entrySettings.winMessage')}<" },
  { search: 'placeholder="Mensagem quando ganhar (opicional)"', replace: 'placeholder={t("entrySettings.winMessagePlh")}' },
  { search: '>Som Personalizado ao Vencer<', replace: ">{t('entrySettings.customSound')}<" },
  { search: '>Usar som padrão geral<', replace: ">{t('entrySettings.useDefaultSound')}<" },
  { search: '>Áudios Enviados<', replace: ">{t('entrySettings.uploadedAudios')}<" },
  { search: '> Novo Áudio<', replace: "> {t('entrySettings.newAudio')}<" },
  { search: '>Nenhum áudio enviado ainda.<', replace: ">{t('entrySettings.noAudio')}<" },
  { search: '>Cancelar<', replace: ">{t('entrySettings.cancel')}<" },
  { search: '>Salvar<', replace: ">{t('entrySettings.save')}<" },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(path, content);
