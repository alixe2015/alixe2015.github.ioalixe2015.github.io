/**
 * Handraw Art Styles Engine (inspired by yang0/handraw-style)
 * Curated 6 iconic hand-drawn art styles with canvas shaders and CSS filters.
 */

export interface HandrawStyle {
  id: string;
  code: string; // e.g. #012
  name: string;
  category: string;
  tagline: string;
  desc: string;
  paperType: string;
  filterCss: string;
  canvasFilter: string;
  paperTextureOverlay: string; // CSS background or blend
  accentColor: string;
  badge: string;
}

export const HANDRAW_STYLES: HandrawStyle[] = [
  {
    id: 'watercolor-bleed',
    code: '#012',
    name: '湿画漫染 · 空气呼吸',
    category: '水彩水痕',
    tagline: '英国湿画法水彩 · 冷压纯棉纸自然晕染',
    desc: '轻柔融化背景杂质，保留主体轮廓，边缘产生天然水渍与水彩颗粒沉淀，带来清透的空气感。',
    paperType: '300g 德国哈内姆勒冷压纯棉水彩纸',
    filterCss: 'saturate(130%) contrast(108%) brightness(105%) blur(0.4px)',
    canvasFilter: 'saturate(130%) contrast(108%) brightness(105%)',
    paperTextureOverlay: 'radial-gradient(#d4c8b4 1px, transparent 1px)',
    accentColor: '#5c92ad',
    badge: '最受欢迎'
  },
  {
    id: 'risograph-print',
    code: '#047',
    name: '复古孔版 · 粗粝油墨',
    category: '孔版木刻',
    tagline: '昭和 Risograph · 双色叠印与粗粝网点',
    desc: '提取暗红与灰靛两种经典复古油墨，叠印产生细腻点阵与轻微错位美感，充满昭和独立出版物的人文温度。',
    paperType: '280g 日本风华古木米白棉卡',
    filterCss: 'sepia(35%) contrast(135%) saturate(140%) hue-rotate(-12deg) brightness(98%)',
    canvasFilter: 'sepia(35%) contrast(135%) saturate(140%) hue-rotate(-12deg)',
    paperTextureOverlay: 'radial-gradient(#ab6f52 1.2px, transparent 1.2px)',
    accentColor: '#c95b38',
    badge: '文艺收藏'
  },
  {
    id: 'chinese-inkwash',
    code: '#108',
    name: '宣纸写意 · 极简留白',
    category: '东方水墨',
    tagline: '宋画淡彩水墨 · 澄江远岫与洗练笔墨',
    desc: '洗练去除多余杂色，仅留墨色深浅与一抹淡花青，将琐碎现实升华为东方禅意留白。',
    paperType: '350g 手工造纸安徽宣纸裱卡',
    filterCss: 'grayscale(85%) contrast(130%) brightness(106%) sepia(15%)',
    canvasFilter: 'grayscale(85%) contrast(130%) brightness(106%) sepia(15%)',
    paperTextureOverlay: 'radial-gradient(#3a4047 1px, transparent 1px)',
    accentColor: '#708696',
    badge: '东方禅意'
  },
  {
    id: 'ghibli-gouache',
    code: '#165',
    name: '暖阳绘本 · 治愈温存',
    category: '温润水粉',
    tagline: '吉卜力吉光片羽 · 暖阳色铅笔与水粉涂绘',
    desc: '午后微风穿过窗帘的温暖色调，柔和的高光与温润的粉彩质感，唤醒童年绘本般的安心感。',
    paperType: '300g 意大利阿诗水粉绘本质感纸',
    filterCss: 'sepia(20%) saturate(145%) contrast(104%) brightness(108%) hue-rotate(-6deg)',
    canvasFilter: 'sepia(20%) saturate(145%) contrast(104%) brightness(108%)',
    paperTextureOverlay: 'radial-gradient(#e0c598 1px, transparent 1px)',
    accentColor: '#dca44b',
    badge: '治愈首选'
  },
  {
    id: 'copperplate-etching',
    code: '#214',
    name: '铜版蚀刻 · 时光标本',
    category: '复古蚀刻',
    tagline: '19世纪植物学手稿 · 羽状细密线稿与赭黄',
    desc: '如同一张保存在标本室里的百年前博物学蚀刻画，细致的单色排线让普通的日常物件充满历史沉淀。',
    paperType: '320g 英国重磅牛皮羊皮纸卡',
    filterCss: 'sepia(65%) contrast(140%) brightness(95%) grayscale(40%)',
    canvasFilter: 'sepia(65%) contrast(140%) brightness(95%) grayscale(40%)',
    paperTextureOverlay: 'radial-gradient(#6e5538 1px, transparent 1px)',
    accentColor: '#966d43',
    badge: '古典庄重'
  },
  {
    id: 'oil-pastel-impasto',
    code: '#271',
    name: '蜡彩重涂 · 纯真肉身',
    category: '重彩厚涂',
    tagline: '粗颗粒油画棒 · 饱满触感与厚涂笔触',
    desc: '肉身对色彩最直白的渴望，浓烈饱满的油画棒颗粒覆于纸面，用质朴而真诚的色块击穿理性防御。',
    paperType: '350g 法国康颂重纹理粗面卡',
    filterCss: 'saturate(165%) contrast(125%) brightness(102%)',
    canvasFilter: 'saturate(165%) contrast(125%) brightness(102%)',
    paperTextureOverlay: 'radial-gradient(#c23b2b 1.5px, transparent 1.5px)',
    accentColor: '#d64534',
    badge: '纯真浓烈'
  }
];

/**
 * Apply procedural artistic canvas handraw stylization on an image
 */
export function renderHandrawCanvas(
  sourceImg: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  style: HandrawStyle,
  callback?: () => void
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  // 1. Draw base photo with filter
  ctx.save();
  ctx.filter = style.canvasFilter;
  ctx.drawImage(sourceImg, 0, 0, w, h);
  ctx.restore();

  // 2. Procedural artistic overlays
  if (style.id === 'watercolor-bleed') {
    // Water bleed edge vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.55);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(0.8, 'rgba(240, 235, 225, 0.15)');
    grad.addColorStop(1, 'rgba(215, 205, 190, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (style.id === 'risograph-print') {
    // Duotone ink tint overlay
    ctx.fillStyle = 'rgba(201, 91, 56, 0.12)';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  } else if (style.id === 'chinese-inkwash') {
    // Rice paper soft wash
    ctx.fillStyle = 'rgba(247, 244, 236, 0.2)';
    ctx.fillRect(0, 0, w, h);
  } else if (style.id === 'copperplate-etching') {
    // Aged parchment vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.6);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(110, 85, 56, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (callback) callback();
}
