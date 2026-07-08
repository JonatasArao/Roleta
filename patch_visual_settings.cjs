const fs = require('fs');

const ptPath = './src/i18n/locales/pt-BR.json';
const enPath = './src/i18n/locales/en.json';

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.visualSettings = {
  title: "Aparência Visual",
  wheelFormat: "Formato da Roleta",
  classic: "Clássica",
  slot: "Slot",
  boxes: "Caixas",
  visualTheme: "TEMA VISUAL (Skins)",
  textSize: "Tamanho do Texto",
  centerSize: "Tamanho do Centro",
  centerImage: "Imagem Central (URL)",
  centerImagePlh: "Cole o URL da imagem...",
  centerImageHint: "Dica: Use URLs de imagens transparentes (PNG) para um melhor resultado.",
  colorPalette: "Paleta de Cores",
  add: "Adicionar"
};

en.visualSettings = {
  title: "Visual Appearance",
  wheelFormat: "Wheel Format",
  classic: "Classic",
  slot: "Slot",
  boxes: "Boxes",
  visualTheme: "VISUAL THEME (Skins)",
  textSize: "Text Size",
  centerSize: "Center Size",
  centerImage: "Center Image (URL)",
  centerImagePlh: "Paste image URL...",
  centerImageHint: "Hint: Use transparent image URLs (PNG) for better results.",
  colorPalette: "Color Palette",
  add: "Add"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

const path = './src/components/organisms/settings/VisualSettings.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { Type, Monitor, Palette, X, Plus, Image as ImageIcon } from 'lucide-react';",
  "import { Type, Monitor, Palette, X, Plus, Image as ImageIcon } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
);

content = content.replace(
  "export const VisualSettings = () => {",
  "export const VisualSettings = () => {\n  const { t } = useTranslation();"
);

const replacements = [
  { search: '>Aparência Visual<', replace: ">{t('visualSettings.title')}<" },
  { search: '>Formato da Roleta<', replace: ">{t('visualSettings.wheelFormat')}<" },
  { search: '>Clássica<', replace: ">{t('visualSettings.classic')}<" },
  { search: '>Slot<', replace: ">{t('visualSettings.slot')}<" },
  { search: '>Caixas<', replace: ">{t('visualSettings.boxes')}<" },
  { search: '>TEMA VISUAL (Skins)<', replace: ">{t('visualSettings.visualTheme')}<" },
  { search: '/> Tamanho do Texto<', replace: "/> {t('visualSettings.textSize')}<" },
  { search: '/> Tamanho do Centro<', replace: "/> {t('visualSettings.centerSize')}<" },
  { search: '>Imagem Central (URL)<', replace: ">{t('visualSettings.centerImage')}<" },
  { search: 'placeholder="Cole o URL da imagem..."', replace: 'placeholder={t("visualSettings.centerImagePlh")}' },
  { search: '>Dica: Use URLs de imagens transparentes (PNG) para um melhor resultado.<', replace: ">{t('visualSettings.centerImageHint')}<" },
  { search: '/> Paleta de Cores (', replace: "/> {t('visualSettings.colorPalette')} (" },
  { search: '/> Adicionar', replace: "/> {t('visualSettings.add')}" },
  { search: '>{theme.name}<', replace: ">{t(`themes.${theme.id}`)}<" }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(path, content);
