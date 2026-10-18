import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Gift, 
  Mail, 
  BookOpen, 
  HeartHandshake, 
  Building2, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  DollarSign, 
  Calculator,
  ArrowRight,
  Share2,
  Download,
  QrCode,
  Copy,
  Image as ImageIcon,
  Palette,
  Volume2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Radio,
  Eye,
  Camera,
  Layers,
  Brush,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostcardEntry } from '../types';
import { INITIAL_POSTCARDS } from '../data/seedData';
import { generatePostcardQR } from '../utils/qrHelper';
import { HANDRAW_STYLES, HandrawStyle } from '../utils/handrawStyles';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ShopProduct {
  id: string;
  category: 'physical' | 'book' | 'capsule' | 'b2b' | 'pro' | 'handraw';
  name: string;
  tagline: string;
  price: string;
  cost: string;
  margin: string;
  image: string;
  features: string[];
  specs: string;
  actionText: string;
}

const PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-handraw-art-box',
    category: 'handraw',
    name: '278号艺术画廊 · 手绘原画明信片装裱礼盒',
    tagline: '将日常照片转化为水彩/版画/蚀刻艺术原作，配德国哈内姆勒棉纸与北美黑胡桃木磁吸展架',
    price: '¥128 / 套',
    cost: '¥28.0 (特种纯棉水彩纸+黑胡桃木底座+定制皮质信封)',
    margin: '78% 极高客单',
    image: '/src/assets/images/daily_bonfire_spark_1792074478702.jpg',
    features: [
      '基于 yang0/handraw-style 278 种手绘艺术风格专属重构',
      '德国哈内姆勒 350g 冷压纯棉特种水彩纸微喷',
      '附赠永久原声二维码、情绪指纹藏书票与北美黑胡桃木展架',
      '支持选择 12 张年度精选生活切片装订成套',
    ],
    specs: '纯棉水彩卡 105×148mm · 黑胡桃木底座 120mm · 烫金皮质礼盒',
    actionText: '定制手绘艺术礼盒',
  },
  {
    id: 'prod-single-mail',
    category: 'physical',
    name: '单张慢递精装明信片',
    tagline: '日本 350g 特种风华棉卡，背面凸版压印你的专属原声二维码',
    price: '¥9.9 / 张',
    cost: '¥2.4 (纸张+冲印+邮费)',
    margin: '75% 高毛利',
    image: '/src/assets/images/daily_sunset_hands_leaf_1792073758668.jpg',
    features: [
      '特种棉纸温润肌理，触感沉甸甸',
      '永久保存的原声二维码，微信一扫即听',
      '手工火漆封印与城市当日邮戳',
      '支持寄给朋友、伴侣或未来的自己',
    ],
    specs: '尺寸 105×148mm · 350g 无酸棉卡 · 全国平邮/挂号',
    actionText: '模拟定制寄出',
  },
  {
    id: 'prod-wooden-box',
    category: 'physical',
    name: '季度/年度生活切片原木画盒',
    tagline: '精选 12 张声音明信片，配北美黑胡桃木磁吸桌面展架',
    price: '¥69 / 盒',
    cost: '¥18.0 (实木展架+12张卡片+定制礼盒)',
    margin: '74% 高毛利',
    image: '/src/assets/images/daily_morning_kitchen_light_1792073759655.jpg',
    features: [
      '每盒含 12 个月份的具身生活切片与原声',
      '北美黑胡桃木纯手工打磨桌面磁吸底座',
      '每月翻动一张，作为桌面治愈声音台历',
      '伴手礼高档天地盖烫金收纳盒',
    ],
    specs: '实木磁吸底座 120×40mm · 12张加厚卡 · 烫金牛皮盒',
    actionText: '定制原木展架盒',
  },
  {
    id: 'prod-annual-book',
    category: 'book',
    name: '《我的肉身年鉴》年度布面典藏书',
    tagline: '年中/年末将一整年的心潮、雷达图与原声波形装订成书',
    price: '¥199 / 本',
    cost: '¥45.0 (锁线布面精装+特种内页)',
    margin: '77% 极高客单',
    image: '/src/assets/images/daily_coffee_rain_window_1792073757711.jpg',
    features: [
      '收录全年所有摄影、五感微读数与心境笔录',
      '特别排版年度情感雷达图与心绪温度波动曲线',
      '每个页面内嵌原声波形流体金线与专属二维码',
      '天然亚麻布面封面，手工压印烫金书名',
    ],
    specs: '大16开精装 · 140g 东方书纸 · 锁线胶装 100% 平摊',
    actionText: '预约年末典藏册',
  },
  {
    id: 'prod-dual-capsule',
    category: 'capsule',
    name: '双人私密「声音暗房胶囊」',
    tagline: '情侣与密友专属的双向加密明信片，必须录下原声才能解锁',
    price: '¥29.9 / 对',
    cost: '¥0.5 (云端信令服务)',
    margin: '98% 纯软件高利润',
    image: '/src/assets/images/daily_bonfire_spark_1792074478702.jpg',
    features: [
      '你发出一张带锁的摄影正面与微弱心跳声波',
      '对方必须用自己的麦克风录下真实心声方可双向解锁',
      '杜绝打字敷衍，专为异地恋情侣与至交好友打造',
      '永久保存于专属双人星轨私密空间',
    ],
    specs: '双端点对点加密 · 专属音频波形证书',
    actionText: '开启双人胶囊',
  },
  {
    id: 'prod-cafe-station',
    category: 'b2b',
    name: '城市空间慢邮角落（B2B合作套件）',
    tagline: '为独立书店、精品咖啡馆定制「具身回响木质互动展架」',
    price: '¥1,680 / 季度',
    cost: '¥380.0 (展架+200套特制空白邮资卡)',
    margin: '77% 高毛利B端收入',
    image: '/src/assets/images/daily_night_rain_lights_1792074479528.jpg',
    features: [
      '提供北欧复古原木桌面投递信箱与陈列架',
      '专属店铺定制邮戳与 200 张专属品牌明信片',
      '顾客现场扫码录音，提升店内停留时长与社交打卡率',
      '每月定期协助咖啡馆向顾客寄送实体声音信件',
    ],
    specs: '实木信箱 320×240mm · 200份初始耗材 · 店铺专属后台',
    actionText: '申请空间联名套件',
  },
  {
    id: 'prod-pro-sub',
    category: 'pro',
    name: 'Pro 美学暗房年费会员',
    tagline: '解锁活版印刷凹凸压印、宣纸水墨质感与无损母带级声波',
    price: '¥68 / 年',
    cost: '¥1.0 (存储与带宽)',
    margin: '98% SaaS循环订阅',
    image: '/src/assets/images/daily_seaside_steps_dusk_1792073758759.jpg',
    features: [
      '解锁 12 款独家艺术胶片与湿版火棉胶调色滤镜',
      '高清无损 FLAC 格式留存你的原始声调颗粒',
      '不限量生成 4K 印刷级明信片与自定义邮戳设计',
      '优先享受实体冲印 8 折与专属快速慢递通道',
    ],
    specs: '多端云端自动同步 · 专属 Pro 邮戳印章 · 会员专享折扣',
    actionText: '开通 Pro 年卡',
  },
];

interface EmbodiedShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  postcards?: PostcardEntry[];
}

export const EmbodiedShopModal: React.FC<EmbodiedShopModalProps> = ({
  isOpen,
  onClose,
  postcards,
}) => {
  if (!isOpen) return null;

  const availablePostcards = (postcards && postcards.length > 0) ? postcards : INITIAL_POSTCARDS;
  const [activeTab, setActiveTab] = useState<'poster' | 'handraw' | 'all' | 'physical' | 'book' | 'capsule' | 'b2b' | 'calc'>('poster');
  const [successItem, setSuccessItem] = useState<string | null>(null);

  // Poetic Moments Poster state
  const [selectedPostcardId, setSelectedPostcardId] = useState<string>(availablePostcards[0]?.id || '');
  const [posterTheme, setPosterTheme] = useState<'noir' | 'parchment' | 'twilight'>('noir');
  const [isDownloadingPoster, setIsDownloadingPoster] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedMomentsCopy, setCopiedMomentsCopy] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrTargetMode, setQrTargetMode] = useState<'listen' | 'home'>('listen');

  const selectedPostcard = availablePostcards.find((p) => p.id === selectedPostcardId) || availablePostcards[0];

  // Refresh or generate QR code when selected postcard changes or QR target mode changes
  useEffect(() => {
    let isMounted = true;
    const updateQR = async () => {
      if (!selectedPostcard) return;
      if (qrTargetMode === 'listen' && selectedPostcard.qrCodeDataUrl) {
        setQrDataUrl(selectedPostcard.qrCodeDataUrl);
      } else {
        const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://embodied-echo.app';
        const url = qrTargetMode === 'listen'
          ? `${origin}?listen=${selectedPostcard.id}#listen-room`
          : origin;
        const qr = await generatePostcardQR(selectedPostcard.id, url);
        if (isMounted) setQrDataUrl(qr);
      }
    };
    updateQR();
    return () => { isMounted = false; };
  }, [selectedPostcard, qrTargetMode]);

  // Handraw art gallery customization state
  const [selectedShopHandrawStyle, setSelectedShopHandrawStyle] = useState<HandrawStyle>(HANDRAW_STYLES[0]);

  // Revenue model calculator state
  const [calcMonthlyPostcards, setCalcMonthlyPostcards] = useState(200);
  const [calcYearBooks, setCalcYearBooks] = useState(30);
  const [calcPartnerCafes, setCalcPartnerCafes] = useState(6);
  const [calcProSubs, setCalcProSubs] = useState(80);

  const estimatedRevenue = 
    calcMonthlyPostcards * 9.9 + 
    (calcYearBooks * 199) / 12 + 
    (calcPartnerCafes * 1680) / 12 + 
    (calcPartnerCafes * 150 * 5) +
    (calcProSubs * 68) / 12;

  const estimatedProfit = 
    calcMonthlyPostcards * (9.9 - 2.4) + 
    (calcYearBooks * (199 - 45)) / 12 + 
    (calcPartnerCafes * (1680 - 380)) / 12 + 
    (calcPartnerCafes * 150 * 2.5) +
    (calcProSubs * 65) / 12;

  const handleSimulatePurchase = (productName: string) => {
    setSuccessItem(productName);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e6c382', '#f3d9a8', '#d4af37', '#e11d48'],
      });
    } catch {}
    setTimeout(() => setSuccessItem(null), 3000);
  };

  // One-click Moments copy text
  const handleCopyMomentsText = () => {
    if (!selectedPostcard) return;
    const textToCopy = `【具身回响 · 诗意画报】${selectedPostcard.date}
📍 ${selectedPostcard.location}
“${selectedPostcard.reflectionText.slice(0, 70)}...”

当AI能替你写好一切，谁来替你感受风的冷热？
扫描画报中的专属二维码，可以倾听我按下快门那一刻未被算法修剪的原声心潮 🎙️💫
#具身回响 #每日生活切片 #人类肉身的温度`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMomentsCopy(true);
      setTimeout(() => setCopiedMomentsCopy(false), 2500);
    });
  };

  // Copy Direct Link
  const handleCopyDirectLink = () => {
    if (!selectedPostcard) return;
    const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://embodied-echo.app';
    const listenUrl = `${origin}?listen=${selectedPostcard.id}#listen-room`;
    navigator.clipboard.writeText(listenUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Canvas High-Res 9:16 Poetic Poster Generator & Downloader
  const handleDownloadPoster = async () => {
    if (!selectedPostcard) return;
    setIsDownloadingPoster(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');

      // Theme settings
      let bgGradStart = '#131418';
      let bgGradEnd = '#0b0c0e';
      let frameColor = '#24252a';
      let titleColor = '#f5eedc';
      let subColor = '#9e9484';
      let goldColor = '#d4af37';
      let cardBg = '#191b20';

      if (posterTheme === 'parchment') {
        bgGradStart = '#faf7f2';
        bgGradEnd = '#ece5d8';
        frameColor = '#ded5c5';
        titleColor = '#241f19';
        subColor = '#6b6153';
        goldColor = '#9a6b3d';
        cardBg = '#ffffff';
      } else if (posterTheme === 'twilight') {
        bgGradStart = '#121826';
        bgGradEnd = '#0b101c';
        frameColor = '#23324d';
        titleColor = '#edf2f7';
        subColor = '#94a3b8';
        goldColor = '#38bdf8';
        cardBg = '#162033';
      }

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, bgGradStart);
      bgGrad.addColorStop(1, bgGradEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle border
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 1020, 1860);

      // Hairline inner border
      ctx.strokeStyle = goldColor;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 990, 1830);
      ctx.globalAlpha = 1.0;

      // 2. Top Header Brand & Date
      ctx.fillStyle = goldColor;
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('EMBODIED MOMENT · 每日具身切片', 540, 105);

      ctx.fillStyle = titleColor;
      ctx.font = 'bold 38px "Noto Serif SC", serif';
      ctx.fillText('具身回响 · 诗意画报', 540, 155);

      // Fine separator
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(340, 180);
      ctx.lineTo(740, 180);
      ctx.stroke();

      // 3. Draw Postcard Image (Thumbnail)
      const photoWidth = 920;
      const photoHeight = 720;
      const photoX = 80;
      const photoY = 215;

      // Shadow behind photo
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = cardBg;
      ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
      ctx.shadowColor = 'transparent';

      // Load image
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedPostcard.imageUrl;
        img.onload = () => {
          // Draw image cropped to fit
          ctx.drawImage(img, photoX + 16, photoY + 16, photoWidth - 32, photoHeight - 32);
          resolve();
        };
        img.onerror = () => {
          // Fallback if image load fails
          ctx.fillStyle = '#222';
          ctx.fillRect(photoX + 16, photoY + 16, photoWidth - 32, photoHeight - 32);
          resolve();
        };
      });

      // Photo frame overlay
      ctx.strokeStyle = goldColor;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX + 16, photoY + 16, photoWidth - 32, photoHeight - 32);
      ctx.globalAlpha = 1.0;

      // Photo caption strip (Location & Time)
      ctx.fillStyle = 'rgba(15, 15, 18, 0.75)';
      ctx.fillRect(photoX + 24, photoY + photoHeight - 70, photoWidth - 48, 46);

      ctx.fillStyle = '#f5eedc';
      ctx.font = '500 22px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.fillText(`📍 ${selectedPostcard.location}`, photoX + 44, photoY + photoHeight - 40);

      ctx.textAlign = 'right';
      ctx.fillStyle = goldColor;
      ctx.font = '600 22px "Plus Jakarta Sans", monospace';
      ctx.fillText(`${selectedPostcard.time}`, photoX + photoWidth - 44, photoY + photoHeight - 40);

      // 4. Date & Sensory/Mood Badge
      const textStartY = 1000;
      ctx.textAlign = 'left';
      ctx.fillStyle = goldColor;
      ctx.font = '600 28px "Plus Jakarta Sans", monospace';
      ctx.fillText(selectedPostcard.date, 85, textStartY);

      ctx.fillStyle = subColor;
      ctx.font = '500 24px "Noto Serif SC", serif';
      ctx.fillText(`【${selectedPostcard.moodTag} · 心绪温度 ${selectedPostcard.moodTemperature || 7}°】`, 280, textStartY);

      // 5. Title & Reflection Text
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 52px "Noto Serif SC", serif';
      ctx.fillText(selectedPostcard.title, 85, textStartY + 68);

      // Multi-line Reflection text
      ctx.fillStyle = subColor;
      ctx.font = 'normal 30px "Noto Serif SC", serif';
      const maxTextWidth = 910;
      const lineHeight = 50;
      const words = selectedPostcard.reflectionText;
      let line = '';
      let currentY = textStartY + 140;
      let linesCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line, 85, currentY);
          line = words[n];
          currentY += lineHeight;
          linesCount++;
          if (linesCount >= 4) {
            line = line + '...';
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 85, currentY);

      // 6. Audio Waveform Visualizer on the poster
      const waveY = currentY + 65;
      ctx.fillStyle = goldColor;
      ctx.font = '600 22px "Noto Serif SC", serif';
      ctx.fillText(`🎙️ ${selectedPostcard.audioDuration || 22}s 原声心潮波形`, 85, waveY);

      // Draw wave bars
      const waveData = selectedPostcard.audioWaveformData || [20, 45, 75, 55, 90, 80, 40, 65, 85, 70, 45, 30, 60, 85, 65, 40, 25];
      const startX = 350;
      const barWidth = 8;
      const barGap = 12;
      ctx.fillStyle = goldColor;
      waveData.forEach((val, i) => {
        const barHeight = Math.max(10, (val / 100) * 44);
        ctx.fillRect(startX + i * (barWidth + barGap), waveY - barHeight / 2 - 4, barWidth, barHeight);
      });

      // 7. QR Code & Scan Prompt Card at Bottom
      const qrBoxY = 1420;
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 2;
      ctx.fillRect(80, qrBoxY, 920, 260);
      ctx.strokeRect(80, qrBoxY, 920, 260);

      // Load QR code image
      if (qrDataUrl) {
        await new Promise<void>((resolve) => {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          qrImg.onload = () => {
            // Draw QR code with white padding
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(100, qrBoxY + 20, 220, 220);
            ctx.drawImage(qrImg, 105, qrBoxY + 25, 210, 210);
            resolve();
          };
          qrImg.onerror = () => resolve();
        });
      }

      // QR Instruction Text
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 36px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.fillText('微信扫码 · 倾听真实原声', 350, qrBoxY + 75);

      ctx.fillStyle = subColor;
      ctx.font = 'normal 26px "Noto Serif SC", serif';
      ctx.fillText('用手机扫码，即可直达暗房聆听按下快门时的心潮与呼吸', 350, qrBoxY + 125);

      ctx.fillStyle = goldColor;
      ctx.font = '500 24px "Noto Serif SC", serif';
      ctx.fillText('✨ 声音中的叹息与温差，是无法被算法压缩的高维人类信号', 350, qrBoxY + 175);

      // 8. Brand Slogan Footer (CRITICAL REQUIREMENT)
      const footerY = 1750;
      ctx.textAlign = 'center';
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 32px "Noto Serif SC", serif';
      ctx.fillText('具身回响 · 在AI与算力时代，守护人类肉身的温度与心潮', 540, footerY);

      ctx.fillStyle = subColor;
      ctx.font = 'italic 26px "Noto Serif SC", serif';
      ctx.fillText('“当 AI 能替你写好一切，谁来替你感受风的冷热？”', 540, footerY + 48);

      ctx.fillStyle = goldColor;
      ctx.font = '600 20px "Plus Jakarta Sans", monospace';
      ctx.letterSpacing = '3px';
      ctx.fillText('2026 EMBODIED ECHO · ALL RIGHTS PRESERVED', 540, footerY + 95);

      // Download triggered
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `具身回响_朋友圈诗意画报_${selectedPostcard.date}.png`;
      link.href = dataUrl;
      link.click();

      // Confetti
      try {
        confetti({
          particleCount: 70,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#e6c382', '#f3d9a8', '#d4af37', '#e11d48'],
        });
      } catch {}

    } catch (err) {
      console.error('Failed to generate poster', err);
    } finally {
      setIsDownloadingPoster(false);
    }
  };

  const filteredProducts = activeTab === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#141517] border border-[#33312c] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <ShoppingBag className="w-4 h-4 text-[#e6c382]" />
            <span>具身心绪商店 · 朋友圈裂变与商业增值生态</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 pt-4 border-b border-[#242321] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'poster', label: '✨ 朋友圈诗意画报 (裂变神器)' },
            { id: 'handraw', label: '🎨 278号手绘原画礼盒 (¥128)' },
            { id: 'all', label: '全部增值项目' },
            { id: 'physical', label: '实体纸质慢递 (¥9.9)' },
            { id: 'book', label: '年度典藏画册 (¥199)' },
            { id: 'capsule', label: '双人声音胶囊 (¥29.9)' },
            { id: 'b2b', label: '空间联名角 (¥1680)' },
            { id: 'calc', label: '💰 商业收益测算器' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 text-xs font-serif-sc whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
                activeTab === tab.id ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8475] hover:text-[#ded8cb]'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e6c382]" />}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
          {successItem && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600/40 rounded-xl text-emerald-300 text-xs font-serif-sc flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>已成功模拟【{successItem}】的定制体验！真实的支付与生产链可直接无缝对接。</span>
            </div>
          )}

          {/* ================= TAB 1: 朋友圈诗意画报 (Moments Poetic Poster) ================= */}
          {activeTab === 'poster' && selectedPostcard && (
            <div className="space-y-6 animate-fade-in">
              {/* Intro Banner */}
              <div className="p-4 bg-[#1b1c20] border border-[#38332a] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono-data bg-[#d4af37]/20 text-[#e6c382] border border-[#d4af37]/40 rounded">
                      VIRAL MOMENTS POSTER
                    </span>
                    <span className="text-xs font-serif-sc font-medium text-[#f0ebd9]">
                      一键排版 9:16 朋友圈诗意画报
                    </span>
                  </div>
                  <p className="text-xs text-[#a89e8e] font-serif-sc">
                    自动嵌入明信片精选切片、日期标签、原声二维码及「具身回响」品牌标语，支持一键下载超清画报或单独生成/导出分享二维码。
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyMomentsText}
                    className="px-3 py-1.5 bg-[#252422] hover:bg-[#302e29] border border-[#453e32] text-[#ded8cb] text-xs font-serif-sc rounded-lg transition-colors flex items-center gap-1.5"
                    title="复制适配朋友圈格式的诗意配文"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#e6c382]" />
                    <span>{copiedMomentsCopy ? '已复制文案 ✓' : '复制朋友圈配文'}</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-3 py-1.5 bg-[#252422] hover:bg-[#302e29] border border-[#453e32] text-[#ded8cb] text-xs font-serif-sc rounded-lg transition-colors flex items-center gap-1.5"
                    title="查看并生成专属分享二维码"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#e6c382]" />
                    <span>生成分享二维码</span>
                  </button>
                </div>
              </div>

              {/* Main Layout: Left Controls + Right Live Canvas Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Postcard Selector & Customizer (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Step 1: Select Postcard */}
                  <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif-sc font-medium text-[#f0ebe1] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#e6c382]" />
                        <span>1. 选择要制作画报的明信片</span>
                      </span>
                      <span className="text-[11px] font-mono-data text-[#8c8475]">
                        {availablePostcards.length} 张已收纳
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {availablePostcards.map((card) => {
                        const isSelected = card.id === selectedPostcardId;
                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedPostcardId(card.id)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between text-left group ${
                              isSelected
                                ? 'bg-[#28241d] border-[#e6c382] shadow-md ring-1 ring-[#e6c382]/50'
                                : 'bg-[#121315] border-[#262522] hover:border-[#474136]'
                            }`}
                          >
                            <div className="relative aspect-4/3 rounded overflow-hidden mb-1.5 bg-black/40">
                              <img
                                src={card.imageUrl}
                                alt={card.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e6c382] text-black flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </div>
                              )}
                              <span className="absolute bottom-1 left-1 px-1 py-0.5 text-[9px] font-mono-data bg-black/70 text-[#ecd6b0] rounded">
                                {card.date.slice(5)}
                              </span>
                            </div>
                            <span className="text-xs font-serif-sc font-medium text-[#ded8cb] truncate">
                              {card.title}
                            </span>
                            <span className="text-[10px] text-[#8c8475] truncate mt-0.5">
                              {card.moodTag} · {card.location.split('·')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Choose Style */}
                  <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-3">
                    <span className="text-xs font-serif-sc font-medium text-[#f0ebe1] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#e6c382]" />
                      <span>2. 画报视觉质感</span>
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'noir', name: '极简暗房', desc: '黑金深邃 · 电影感', bg: 'bg-[#121315] border-[#38332a]' },
                        { id: 'parchment', name: '暖木信笺', desc: '米白温润 · 手作感', bg: 'bg-[#f7f4ed] text-[#222] border-[#ded5c5]' },
                        { id: 'twilight', name: '暮色青峦', desc: '黛蓝空灵 · 诗意感', bg: 'bg-[#121826] border-[#283852]' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setPosterTheme(style.id as any)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            posterTheme === style.id
                              ? 'border-[#e6c382] ring-1 ring-[#e6c382] shadow-sm'
                              : 'border-[#262522] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-full h-3 rounded mb-1.5 ${style.bg}`} />
                          <div className="text-xs font-serif-sc font-medium text-[#f0ebe1]">
                            {style.name}
                          </div>
                          <div className="text-[10px] text-[#8c8475] mt-0.5">
                            {style.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Key Download & Action buttons */}
                  <div className="p-4 bg-[#1e1c18] border border-[#4a4030] rounded-xl space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-serif-sc font-medium text-[#edd8b4]">
                        3. 导出与社交裂变
                      </span>
                      <p className="text-[11px] text-[#a89e8e] font-serif-sc">
                        生成的画报为 1080×1920 竖版超清无压缩格式，微信朋友圈、小红书与快手/抖音图文可直接发布。
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleDownloadPoster}
                        disabled={isDownloadingPoster}
                        className="w-full py-2.5 bg-[#e6c382] hover:bg-[#edd49d] active:scale-[0.99] text-[#141416] font-serif-sc font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isDownloadingPoster ? '正在绘制 9:16 高清画报...' : '一键下载朋友圈诗意画报 (PNG)'}</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCopyMomentsText}
                          className="py-2 bg-[#252422] hover:bg-[#302e29] border border-[#3d382e] text-[#ded8cb] text-xs font-serif-sc rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#e6c382]" />
                          <span>{copiedMomentsCopy ? '文案已复制 ✓' : '复制朋友圈配文'}</span>
                        </button>

                        <button
                          onClick={() => setShowQrModal(true)}
                          className="py-2 bg-[#252422] hover:bg-[#302e29] border border-[#3d382e] text-[#ded8cb] text-xs font-serif-sc rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#e6c382]" />
                          <span>分享二维码</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live 9:16 Visual Poster Preview (7 cols) */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="text-[11px] font-mono-data text-[#8c8475] mb-2 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>9:16 朋友圈画报实时预览 · 自动嵌入标语与二维码</span>
                  </div>

                  {/* 9:16 Poster Card Container */}
                  <div
                    className={`w-full max-w-sm aspect-9/16 rounded-2xl p-5 border shadow-2xl flex flex-col justify-between transition-colors relative overflow-hidden select-none ${
                      posterTheme === 'parchment'
                        ? 'bg-[#f7f4ed] text-[#241f19] border-[#ded5c5]'
                        : posterTheme === 'twilight'
                        ? 'bg-[#121826] text-[#edf2f7] border-[#283852]'
                        : 'bg-[#111215] text-[#f5eedc] border-[#38332a]'
                    }`}
                  >
                    {/* Subtle aesthetic outer frame */}
                    <div className="absolute inset-2 border border-current opacity-10 rounded-xl pointer-events-none" />

                    {/* Top Brand Header */}
                    <div className="text-center space-y-0.5 pt-1 relative z-10">
                      <span className="text-[9px] font-mono-data tracking-widest uppercase opacity-70 block">
                        EMBODIED MOMENT · 每日具身切片
                      </span>
                      <h3 className="text-sm font-serif-sc font-bold tracking-tight">
                        具身回响 · 诗意画报
                      </h3>
                      <div className="w-12 h-0.5 bg-[#d4af37]/60 mx-auto mt-1" />
                    </div>

                    {/* Image Area with Location & Stamp */}
                    <div className="my-2 relative z-10">
                      <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-black/20 shadow-md bg-black/40">
                        <img
                          src={selectedPostcard.imageUrl}
                          alt={selectedPostcard.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Location Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-white text-[10px] font-serif-sc">
                          <span className="truncate pr-2">📍 {selectedPostcard.location}</span>
                          <span className="font-mono-data text-[#ecd6b0] shrink-0">{selectedPostcard.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date, Mood Tag & Reflection */}
                    <div className="space-y-1.5 relative z-10 px-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono-data text-[#d4af37] font-semibold">
                          {selectedPostcard.date}
                        </span>
                        <span className="text-[10px] opacity-75 font-serif-sc">
                          【{selectedPostcard.moodTag} · {selectedPostcard.moodTemperature || 7}°】
                        </span>
                      </div>

                      <h4 className="text-base font-serif-sc font-semibold leading-snug">
                        {selectedPostcard.title}
                      </h4>

                      <p className="text-[11px] font-serif-sc opacity-85 leading-relaxed line-clamp-3">
                        “{selectedPostcard.reflectionText}”
                      </p>

                      {/* Mini Waveform visualization */}
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[10px] font-serif-sc text-[#d4af37] flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>{selectedPostcard.audioDuration || 22}s 原声心潮</span>
                        </span>
                        <div className="flex items-center gap-0.5 h-3 flex-1">
                          {(selectedPostcard.audioWaveformData || [30, 60, 90, 50, 75, 85, 40, 65, 80, 50, 30]).map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-[#d4af37] rounded-full"
                              style={{ height: `${Math.max(3, (h / 100) * 12)}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom QR Code & Brand Slogan Bar */}
                    <div className="pt-2 border-t border-current/15 relative z-10 space-y-2">
                      <div className="flex items-center justify-between gap-3 bg-black/10 p-2 rounded-lg">
                        <div className="space-y-0.5 flex-1 text-left">
                          <span className="text-[11px] font-serif-sc font-semibold block text-[#d4af37]">
                            微信扫码 · 倾听原声
                          </span>
                          <span className="text-[9px] font-serif-sc opacity-80 block leading-tight">
                            声音中的叹息与温差，是无法被算法压缩的高维人类信号
                          </span>
                        </div>
                        {qrDataUrl && (
                          <div className="w-13 h-13 p-1 bg-white rounded shadow shrink-0">
                            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Brand Slogan (CRITICAL REQUIREMENT) */}
                      <div className="text-center pt-1 border-t border-current/10">
                        <div className="text-[10px] font-serif-sc font-bold tracking-tight">
                          具身回响 · 在AI与算力时代，守护人类肉身的温度与心潮
                        </div>
                        <div className="text-[8px] font-serif-sc opacity-70 italic mt-0.5">
                          “当 AI 能替你写好一切，谁来替你感受风的冷热？”
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: 手绘原画定制礼盒 (Handraw Art Gallery Box) ================= */}
          {activeTab === 'handraw' && (
            <div className="space-y-6 animate-fade-in">
              {/* Hero Banner */}
              <div className="p-5 bg-[#1b1c21] border border-[#3e392f] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono-data bg-[#e6c382]/20 text-[#e6c382] border border-[#e6c382]/40 rounded">
                      EXCLUSIVE ARTISTRY
                    </span>
                    <h3 className="text-base font-serif-sc font-semibold text-[#f5eedc]">
                      278号艺术画廊 · 专属手绘重构装裱礼盒
                    </h3>
                  </div>
                  <p className="text-xs text-[#9e9686] font-serif-sc leading-relaxed max-w-2xl">
                    将您的日常生活快照，转化为英国湿画水彩、昭和孔版或19世纪铜版蚀刻原作。配德国哈内姆勒 350g 冷压纯棉纸立体冲印，附北美黑胡桃木磁吸桌面展架。
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-[#8c8577] block font-serif-sc">定制礼盒定价</span>
                    <span className="text-2xl font-mono-data font-bold text-[#e6c382]">¥128</span>
                  </div>
                  <button
                    onClick={() => handleSimulatePurchase('278号画廊 · 手绘艺术原画明信片装裱礼盒 (¥128)')}
                    className="px-5 py-2.5 bg-[#e6c382] hover:bg-[#edd29b] active:scale-95 text-[#141517] font-serif-sc font-medium text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                  >
                    <Brush className="w-4 h-4" />
                    <span>立即定制礼盒</span>
                  </button>
                </div>
              </div>

              {/* Main Interactive Stage: Postcard Selector + Before/After Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (7 cols): Interactive Split Slider */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs font-serif-sc text-[#a69e90]">
                    <span className="flex items-center gap-1.5 text-[#ede8de]">
                      <Sliders className="w-3.5 h-3.5 text-[#e6c382]" />
                      <span>拖动滑块查看实拍与【{selectedShopHandrawStyle.name}】冲印对比：</span>
                    </span>
                    <span className="font-mono-data text-[#d4af37] text-[11px]">
                      {selectedShopHandrawStyle.code}
                    </span>
                  </div>

                  <BeforeAfterSlider
                    originalImage={selectedPostcard ? selectedPostcard.imageUrl : (availablePostcards[0]?.imageUrl || '')}
                    style={selectedShopHandrawStyle}
                    aspectRatio="aspect-[4/3]"
                  />

                  {/* Pick which postcard to preview */}
                  <div className="pt-2">
                    <span className="text-[11px] font-serif-sc text-[#8c8577] block mb-1.5">
                      选择要预览的生活切片明信片：
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availablePostcards.map((card) => {
                        const isSelected = selectedPostcard?.id === card.id;
                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedPostcardId(card.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                              isSelected
                                ? 'bg-[#24211a] border-[#e6c382]'
                                : 'bg-[#151619] border-white/5 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="pr-1">
                              <div className="text-[11px] font-serif-sc font-medium text-[#ede8de] truncate max-w-[90px]">
                                {card.title}
                              </div>
                              <span className="text-[9px] font-mono-data text-[#8c8577]">
                                {card.date.slice(5)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right (5 cols): 6 Handraw Style Picker & Hardware Specs */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-xs font-serif-sc font-medium text-[#ede8de] block mb-2">
                      选择手绘艺术画派与纸张：
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {HANDRAW_STYLES.map((st) => {
                        const isSelected = selectedShopHandrawStyle.id === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setSelectedShopHandrawStyle(st)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#221f18] border-[#e6c382] text-[#f5efe4] shadow-md ring-1 ring-[#e6c382]/30'
                                : 'bg-[#17181c] border-white/5 text-[#8c8577] hover:border-white/10 hover:text-[#ded8cb]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono-data text-[#e6c382]">
                                {st.code}
                              </span>
                              <span className="text-[9px] text-[#bda579] font-serif-sc">
                                {st.category}
                              </span>
                            </div>
                            <div className="text-xs font-serif-sc font-medium text-[#ede8de]">
                              {st.name}
                            </div>
                            <p className="text-[10px] text-[#736e63] mt-1 line-clamp-1">
                              {st.tagline.split('·')[1] || st.tagline}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hardware & Material Specs */}
                  <div className="p-4 bg-[#18191e] border border-white/5 rounded-xl space-y-2 text-xs font-serif-sc">
                    <span className="text-xs font-medium text-[#e6c382] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>礼盒内含硬件与手工配置清单：</span>
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-[#9c9586]">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#e6c382]" />
                        <span>纸张：{selectedShopHandrawStyle.paperType}（纯棉微喷，触感凹凸有致）</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#e6c382]" />
                        <span>展架：北美黑胡桃木纯铜磁吸桌面底座（120×40mm）</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#e6c382]" />
                        <span>声音：背面凸版加盖永久原声二维码与【{selectedShopHandrawStyle.name.split(' ')[0]}】情绪指纹</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#e6c382]" />
                        <span>封印：专属手工火漆封蜡 + 烫金牛皮礼盒包装</span>
                      </li>
                    </ul>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-[#787265] font-mono-data">PRODUCTION: 2-3 DAYS</span>
                      <button
                        onClick={() => handleSimulatePurchase(`278号画廊 · 【${selectedShopHandrawStyle.name}】装裱礼盒`)}
                        className="text-xs text-[#e6c382] hover:underline font-medium"
                      >
                        立即定制此风格礼盒 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: 全部增值项目 & 列表 ================= */}
          {activeTab !== 'poster' && activeTab !== 'handraw' && activeTab !== 'calc' && (
            <div className="space-y-6">
              {/* Highlight Banner to discover the Poetic Poster */}
              <div 
                onClick={() => setActiveTab('poster')}
                className="p-4 bg-gradient-to-r from-[#211e17] via-[#2a241b] to-[#1c1a16] border border-[#a88243]/50 hover:border-[#e6c382] rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e6c382]/20 border border-[#e6c382]/40 flex items-center justify-center text-[#e6c382] shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif-sc font-semibold text-[#f5eedc] group-hover:text-white">
                      社交裂变神器：朋友圈「诗意画报」已上线
                    </h4>
                    <p className="text-xs text-[#bcb5a7] font-serif-sc mt-0.5">
                      选择已发布的每日切片，一键生成 9:16 诗意竖版画报，自带缩略图、日期与具身品牌标语，扫码直达原声倾听。
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-serif-sc text-[#e6c382] font-medium shrink-0">
                  <span>立即制作画报</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#18191c] border border-[#2b2a26] hover:border-[#a88243] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl group"
                  >
                    <div className="p-5 space-y-3">
                      {/* Header Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono-data text-[#d4af37] uppercase tracking-wider block">
                            {product.margin}
                          </span>
                          <h4 className="text-base font-serif-sc font-semibold text-[#f5eedc] mt-0.5">
                            {product.name}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-mono-data font-bold text-[#e6c382]">
                            {product.price}
                          </span>
                          <span className="text-[10px] text-[#8c8475] block mt-0.5">
                            成本 {product.cost}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#bcb5a7] font-serif-sc leading-relaxed">
                        {product.tagline}
                      </p>

                      {/* Features List */}
                      <div className="space-y-1.5 pt-2 border-t border-[#242321]">
                        {product.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-serif-sc text-[#ded8cb]">
                            <Check className="w-3.5 h-3.5 text-[#e6c382] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-[11px] font-mono-data text-[#8c8475]">
                        规格：{product.specs}
                      </div>
                    </div>

                    <div className="p-4 bg-[#141517] border-t border-[#242321] flex items-center justify-between">
                      <span className="text-[11px] font-serif-sc text-[#8c8475]">
                        支持真实顺丰慢递/冷链/加密信令
                      </span>
                      <button
                        onClick={() => handleSimulatePurchase(product.name)}
                        className="px-4 py-1.5 bg-[#e6c382] hover:bg-[#edd49d] active:scale-[0.98] text-[#141416] text-xs font-serif-sc font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{product.actionText}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: 收益测算器 ================= */}
          {activeTab === 'calc' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#1b1c20] border border-[#2b2a26] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif-sc font-semibold text-[#f5eedc]">
                    具身回响 · 极简轻资产商业模型测算
                  </h4>
                  <p className="text-xs text-[#8c8475] font-serif-sc mt-0.5">
                    拖动滑块，估算在不同用户规模与咖啡馆合作下的月流水与净利润。
                  </p>
                </div>
                <Calculator className="w-5 h-5 text-[#e6c382]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif-sc">
                    <span className="text-[#ded8cb]">单张实体慢递冲印量</span>
                    <span className="font-mono-data text-[#e6c382]">{calcMonthlyPostcards} 张/月</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={calcMonthlyPostcards}
                    onChange={(e) => setCalcMonthlyPostcards(Number(e.target.value))}
                    className="w-full accent-[#e6c382]"
                  />
                  <span className="text-[10px] text-[#8c8475] font-serif-sc block">
                    每张定价 ¥9.9，毛利 ¥7.5
                  </span>
                </div>

                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif-sc">
                    <span className="text-[#ded8cb]">年末典藏精装声音书</span>
                    <span className="font-mono-data text-[#e6c382]">{calcYearBooks} 本/年</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={calcYearBooks}
                    onChange={(e) => setCalcYearBooks(Number(e.target.value))}
                    className="w-full accent-[#e6c382]"
                  />
                  <span className="text-[10px] text-[#8c8475] font-serif-sc block">
                    每本定价 ¥199，毛利 ¥154
                  </span>
                </div>

                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif-sc">
                    <span className="text-[#ded8cb]">合作独立咖啡馆/书店</span>
                    <span className="font-mono-data text-[#e6c382]">{calcPartnerCafes} 家</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={calcPartnerCafes}
                    onChange={(e) => setCalcPartnerCafes(Number(e.target.value))}
                    className="w-full accent-[#e6c382]"
                  />
                  <span className="text-[10px] text-[#8c8475] font-serif-sc block">
                    套件费用 ¥1,680 + 每家每月冲印分成
                  </span>
                </div>

                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif-sc">
                    <span className="text-[#ded8cb]">Pro 暗房高级会员订阅</span>
                    <span className="font-mono-data text-[#e6c382]">{calcProSubs} 人/年</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="20"
                    value={calcProSubs}
                    onChange={(e) => setCalcProSubs(Number(e.target.value))}
                    className="w-full accent-[#e6c382]"
                  />
                  <span className="text-[10px] text-[#8c8475] font-serif-sc block">
                    年费 ¥68，毛利率接近 98%
                  </span>
                </div>
              </div>

              {/* Total Revenue & Profit Result Card */}
              <div className="p-6 bg-[#1a1916] border border-[#d4af37]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <span className="text-xs font-mono-data text-[#d4af37] tracking-wider uppercase block mb-1">
                    ESTIMATED MONTHLY PROFIT · 预估月度净利润
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono-data font-bold text-[#f5eedc] tabular-nums">
                    ¥{Math.round(estimatedProfit).toLocaleString()} <span className="text-sm font-serif-sc text-[#8c8475]">/ 月</span>
                  </div>
                  <span className="text-xs text-[#a89e8e] font-serif-sc mt-1 block">
                    预估月总流水收入：¥{Math.round(estimatedRevenue).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs font-serif-sc text-[#d4cbbe] space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-[#3a3328] pt-3 sm:pt-0 sm:pl-6">
                  <div className="text-[#e6c382] font-semibold">💡 商业健康度极高：</div>
                  <div>• 无需重资产库存，采用柔性按需冲印</div>
                  <div>• 实体纸张+声音二维码具有极强的礼品属性</div>
                  <div>• 线下咖啡馆天然提供精准高净值人文客流</div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Close */}
          <div className="pt-2 border-t border-[#242321] flex items-center justify-between">
            <span className="text-xs font-serif-sc text-[#8c8475]">
              用美好有体温的产品盈利，是让这件事持续运转最好的保障
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#252422] hover:bg-[#302e29] border border-[#423d33] text-[#f0ebd9] rounded-lg text-xs font-serif-sc transition-colors"
            >
              返回我的具身空间
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Share QR Code Modal */}
      {showQrModal && selectedPostcard && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#16171a] border border-[#3d382e] rounded-2xl p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 text-[#8c8475] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono-data text-[#d4af37] tracking-wider uppercase">
                SCANNABLE SHARE QR CODE
              </span>
              <h4 className="text-base font-serif-sc font-bold text-[#f5eedc]">
                专属原声分享二维码
              </h4>
              <p className="text-xs text-[#8c8475] font-serif-sc">
                {selectedPostcard.date} · {selectedPostcard.title}
              </p>
            </div>

            {/* Target mode switch */}
            <div className="flex items-center justify-center gap-2 p-1 bg-[#202126] rounded-lg border border-[#2b2a26] text-xs font-serif-sc">
              <button
                onClick={() => setQrTargetMode('listen')}
                className={`px-3 py-1 rounded transition-colors ${
                  qrTargetMode === 'listen' ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium' : 'text-[#8c8475]'
                }`}
              >
                直达原声暗房
              </button>
              <button
                onClick={() => setQrTargetMode('home')}
                className={`px-3 py-1 rounded transition-colors ${
                  qrTargetMode === 'home' ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium' : 'text-[#8c8475]'
                }`}
              >
                直达主页体验
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-xl shadow-inner max-w-[220px] mx-auto">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Postcard QR Code" className="w-full h-auto" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-500">
                  生成中...
                </div>
              )}
            </div>

            <p className="text-xs font-serif-sc text-[#a89e8e]">
              用微信扫描二维码，可随时随地倾听此切片的真实原声
            </p>

            {/* Copy link & Download QR */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyDirectLink}
                className="w-full py-2 bg-[#252422] hover:bg-[#302e29] border border-[#3d382e] text-[#ded8cb] text-xs font-serif-sc rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#e6c382]" />
                <span>{copiedLink ? '直达试听链接已复制 ✓' : '复制直达试听链接'}</span>
              </button>

              <button
                onClick={() => {
                  if (!qrDataUrl) return;
                  const a = document.createElement('a');
                  a.href = qrDataUrl;
                  a.download = `具身回响_专属二维码_${selectedPostcard.date}.png`;
                  a.click();
                }}
                className="w-full py-2 bg-[#e6c382] hover:bg-[#edd49d] text-[#141416] text-xs font-serif-sc font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存二维码图片 (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
