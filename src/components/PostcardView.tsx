import React, { useState, useRef } from 'react';
import { PostcardEntry, PostcardTheme } from '../types';
import { 
  RotateCw, 
  Download, 
  QrCode, 
  Headphones, 
  MapPin, 
  Calendar, 
  Volume2, 
  Sparkles,
  Share2,
  HeartHandshake,
  Mail,
  Palette,
  Camera,
  Wind,
  Fingerprint,
  Layers,
  Eye,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { PostcardBeautifyStudio } from './PostcardBeautifyStudio';
import { PhysicalOrderModal } from './PhysicalOrderModal';
import { SomaticAwakeningStudio } from './SomaticAwakeningStudio';
import { PostcardScreenshotModal } from './PostcardScreenshotModal';
import { EmotionFingerprint } from './EmotionFingerprint';
import { VoiceFingerprintModal } from './VoiceFingerprintModal';
import { computeFingerprintMetrics } from '../utils/voiceFingerprintHelper';
import { playPaperFlip } from '../utils/audioSynth';
import { somaticHaptics } from '../utils/haptics';

interface PostcardViewProps {
  postcard: PostcardEntry;
  onOpenListenRoom: (entry: PostcardEntry) => void;
  onUpdatePostcard: (updated: PostcardEntry) => void;
  onOpenShop?: () => void;
  onOpenBreathwork?: () => void;
}

export const PostcardView: React.FC<PostcardViewProps> = ({
  postcard,
  onOpenListenRoom,
  onUpdatePostcard,
  onOpenShop,
  onOpenBreathwork,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<PostcardTheme>(postcard.theme || 'warm-paper');
  const [isExporting, setIsExporting] = useState(false);
  const [isBeautifyOpen, setIsBeautifyOpen] = useState(false);
  const [isPhysicalOrderOpen, setIsPhysicalOrderOpen] = useState(false);
  const [isSomaticOpen, setIsSomaticOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [isFingerprintOpen, setIsFingerprintOpen] = useState(false);
  const [photoFilter, setPhotoFilter] = useState('none');

  const isCurrentlyDeveloping = Boolean(
    postcard.isDeveloping && postcard.developedAt && Date.now() < postcard.developedAt
  );
  const remainingMinutes = postcard.developedAt
    ? Math.max(1, Math.ceil((postcard.developedAt - Date.now()) / (60 * 1000)))
    : 0;

  const handleInstantDevelop = () => {
    onUpdatePostcard({
      ...postcard,
      isDeveloping: false,
      developedAt: undefined,
    });
  };

  const themeStyles: Record<PostcardTheme, {
    bg: string;
    text: string;
    subText: string;
    border: string;
    stampBorder: string;
    label: string;
  }> = {
    'warm-paper': {
      bg: 'paper-warm text-[#2a241e]',
      text: 'text-[#2a241e]',
      subText: 'text-[#6e6356]',
      border: 'border-[#dfd5c4]',
      stampBorder: 'border-[#a8957c]',
      label: '暖木信笺',
    },
    'polaroid': {
      bg: 'bg-[#faf8f5] text-[#1f1e1c]',
      text: 'text-[#1a1918]',
      subText: 'text-[#59554d]',
      border: 'border-[#e8e2d5]',
      stampBorder: 'border-[#948774]',
      label: '胶片拍立得',
    },
    'darkroom': {
      bg: 'paper-darkroom text-[#ece5d8]',
      text: 'text-[#f0ebd9]',
      subText: 'text-[#9c9384]',
      border: 'border-[#33312b]',
      stampBorder: 'border-[#7d705c]',
      label: '暗房显影',
    },
    'cool-mist': {
      bg: 'paper-cool text-[#1e293b]',
      text: 'text-[#1e293b]',
      subText: 'text-[#64748b]',
      border: 'border-[#cbd5e1]',
      stampBorder: 'border-[#94a3b8]',
      label: '晨雾微凉',
    },
    'sepia': {
      bg: 'paper-sepia text-[#3b2b1a]',
      text: 'text-[#382818]',
      subText: 'text-[#7d674f]',
      border: 'border-[#d8c3a5]',
      stampBorder: 'border-[#967d5c]',
      label: '琥珀怀旧',
    },
  };

  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPhotoFlipped, setIsPhotoFlipped] = useState(false);
  const [enableTiltPlay, setEnableTiltPlay] = useState(true);
  const currentTheme = themeStyles[selectedTheme];
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    playPaperFlip();
    somaticHaptics.paperTap();
  };

  const handlePhotoFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPhotoFlipped((prev) => !prev);
    playPaperFlip();
    somaticHaptics.paperTap();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTiltPlay || !cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);

    const normX = (x / rect.width) * 2 - 1; // -1 to 1
    const normY = (y / rect.height) * 2 - 1; // -1 to 1

    const maxTilt = 7.5; // degrees of physical tilt
    const rx = -normY * maxTilt;
    const ry = normX * maxTilt;

    setTilt({ rx, ry });
    setGlare({ x: pctX, y: pctY, opacity: 0.22 });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && deltaTime < 600) {
        handleFlip();
      }
    }
  };

  // Compute 3D transform combining flip orientation and spring tilt
  const cardTransform = isFlipped
    ? `perspective(1400px) rotateY(${180 - (isHovered && enableTiltPlay ? tilt.ry : 0)}deg) rotateX(${isHovered && enableTiltPlay ? -tilt.rx : 0}deg)`
    : `perspective(1400px) rotateY(${isHovered && enableTiltPlay ? tilt.ry : 0}deg) rotateX(${isHovered && enableTiltPlay ? tilt.rx : 0}deg)`;

  const handleAudioSaved = (audioUrl: string, duration: number, waveform: number[]) => {
    onUpdatePostcard({
      ...postcard,
      audioUrl,
      audioDuration: duration,
      audioWaveformData: waveform,
    });
  };

  const handleThemeChange = (newTheme: PostcardTheme) => {
    setSelectedTheme(newTheme);
    onUpdatePostcard({
      ...postcard,
      theme: newTheme,
    });
  };

  // Export Postcard as downloadable Canvas image
  const handleExportImage = () => {
    setIsExporting(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = selectedTheme === 'darkroom' ? '#141416' : '#f7f4ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle border
    ctx.strokeStyle = selectedTheme === 'darkroom' ? '#33312b' : '#dfd5c4';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = postcard.imageUrl;
    img.onload = () => {
      // Draw image inside frame
      ctx.drawImage(img, 70, 70, 1060, 800);

      // Draw title
      ctx.fillStyle = selectedTheme === 'darkroom' ? '#f0ebd9' : '#2a241e';
      ctx.font = 'bold 44px "Noto Serif SC", serif';
      ctx.fillText(postcard.title, 80, 930);

      // Draw Date and Location
      ctx.fillStyle = selectedTheme === 'darkroom' ? '#9c9384' : '#6e6356';
      ctx.font = '24px "Noto Serif SC", serif';
      ctx.fillText(`${postcard.date} · ${postcard.location}`, 80, 980);

      // Draw Reflection excerpt
      ctx.font = '28px "Noto Serif SC", serif';
      const lines = [
        postcard.reflectionText.slice(0, 30),
        postcard.reflectionText.slice(30, 60),
        postcard.reflectionText.slice(60, 90),
      ];
      lines.forEach((line, idx) => {
        if (line) ctx.fillText(line, 80, 1050 + idx * 45);
      });

      // Draw Postmark & QR code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = postcard.qrCodeDataUrl || '';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 910, 1200, 200, 200);
        ctx.font = '18px "Noto Serif SC", serif';
        ctx.fillStyle = selectedTheme === 'darkroom' ? '#9c9384' : '#6e6356';
        ctx.fillText('扫码倾听原声感受', 925, 1430);

        // Download trigger
        const link = document.createElement('a');
        link.download = `具身回响明信片-${postcard.date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsExporting(false);
      };
      qrImg.onerror = () => {
        const link = document.createElement('a');
        link.download = `具身回响明信片-${postcard.date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsExporting(false);
      };
    };
    img.onerror = () => {
      setIsExporting(false);
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Toolbar above the card */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif-sc text-[#8f887b]">笺纸质感：</span>
          <div className="flex items-center gap-1.5 p-1 bg-[#18191c] rounded-lg border border-[#2b2a27]">
            {(Object.keys(themeStyles) as PostcardTheme[]).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => handleThemeChange(themeKey)}
                className={`px-2.5 py-1 text-xs font-serif-sc rounded-md transition-all ${
                  selectedTheme === themeKey
                    ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                    : 'text-[#8f8779] hover:text-[#ded8cb]'
                }`}
              >
                {themeStyles[themeKey].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBeautifyOpen(true)}
            className="px-3 py-1.5 text-xs font-serif-sc text-[#edd8b4] bg-[#24211b] hover:bg-[#302b22] border border-[#544837] rounded-lg transition-colors flex items-center gap-1.5"
            title="对随手拍照片进行胶片与艺术滤镜美化"
          >
            <Palette className="w-3.5 h-3.5 text-[#e6c382]" />
            <span>光影美化工坊</span>
          </button>

          <button
            onClick={() => setIsPhysicalOrderOpen(true)}
            className="px-3 py-1.5 text-xs font-serif-sc text-[#f5eedc] bg-[#2a1a1c] hover:bg-[#382225] border border-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5"
            title="冲印真实纸质明信片寄给朋友或年末的自己"
          >
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>慢递实体明信片 (¥9.9)</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-3 py-1.5 text-xs font-serif-sc text-[#e8ded0] bg-[#22211e] hover:bg-[#2c2b27] border border-[#3d3a33] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? '翻回正面（摄影画面）' : '翻至背面（声音与感受）'}</span>
          </button>

          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="px-3 py-1.5 text-xs font-serif-sc text-[#edd8b4] bg-[#22211e] hover:bg-[#2c2a25] border border-[#544837] rounded-lg transition-colors flex items-center gap-1.5"
              title="生成适合分享到朋友圈的9:16竖版诗意画报，自带二维码与具身标语"
            >
              <Share2 className="w-3.5 h-3.5 text-[#e6c382]" />
              <span>朋友圈诗意画报</span>
            </button>
          )}

          <button
            onClick={() => setIsFingerprintOpen(true)}
            className="px-3 py-1.5 text-xs font-serif-sc text-[#edd8b4] bg-[#22211e] hover:bg-[#2c2a25] border border-[#544837] rounded-lg transition-colors flex items-center gap-1.5"
            title="查看此明信片的声音情绪指纹、声学读数并导出专属藏书票"
          >
            <Fingerprint className="w-3.5 h-3.5 text-[#e6c382]" />
            <span>声音情绪指纹</span>
          </button>

          <button
            onClick={() => setIsScreenshotModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-serif-sc text-[#1a1815] bg-[#e6c382] hover:bg-[#edd49d] active:scale-[0.98] rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-sm"
            title="下载印刷级高清明信片（支持正面、背面或双面冲印拼版 PNG）"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载高清明信片 (PNG/双面)</span>
          </button>
        </div>
      </div>

      {/* 3D Interactive Interaction Tips & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between text-xs font-serif-sc text-[#8a8477] mb-3 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#a49d8f]">
            3D 拟物实体把玩已就绪 · 双击卡片或移动端横划翻面 · 伴有特种纸风动与微触感
          </span>
        </div>
        <button
          type="button"
          onClick={() => setEnableTiltPlay(!enableTiltPlay)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
            enableTiltPlay 
              ? 'bg-[#2a241b] text-[#edd4a4] border-[#544837] shadow-sm' 
              : 'bg-[#18191c] text-[#787265] border-[#2b2a27]'
          }`}
          title="开启或关闭光标跟随的3D微重力倾角与纸面反光"
        >
          <Layers className="w-3.5 h-3.5 text-[#e6c382]" />
          <span>{enableTiltPlay ? '3D重力视差把玩 (开启)' : '3D把玩 (已锁定)'}</span>
        </button>
      </div>

      {/* 3D Flip Card Container with ReactBits-Style Tilt, Sheen & Spring Settling */}
      <div 
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleFlip}
        className="perspective-1600 w-full min-h-[620px] select-none cursor-pointer relative"
        title="双击明信片任意处或左右轻划即可 3D 翻面"
      >
        <div
          className={`relative w-full rounded-2xl card-depth-edge preserve-3d border ${currentTheme.border}`}
          style={{
            transform: cardTransform,
            transition: isHovered && enableTiltPlay
              ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease'
              : 'transform 0.72s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.5s ease',
          }}
        >
          {/* Dynamic Specular Sheen (ReactBits Glare) on Front Face */}
          {enableTiltPlay && isHovered && !isFlipped && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl z-30 transition-opacity duration-200"
              style={{
                opacity: glare.opacity,
                background: `radial-gradient(circle 520px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 75%)`,
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* Dynamic Specular Sheen (ReactBits Glare) on Back Face */}
          {enableTiltPlay && isHovered && isFlipped && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl z-30 transition-opacity duration-200"
              style={{
                opacity: glare.opacity,
                background: `radial-gradient(circle 520px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.06) 35%, transparent 75%)`,
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* ================= FRONT SIDE (正面：摄影、信笺排版、二维码、邮戳) ================= */}
          <div
            className={`w-full rounded-2xl p-6 sm:p-9 ${currentTheme.bg} backface-hidden flex flex-col justify-between relative`}
            style={{ minHeight: '620px' }}
          >
            {/* Top Postcard Header */}
            <div className="flex items-start justify-between border-b pb-4 mb-6 border-black/10">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono-data opacity-70 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline" />
                  <span>{postcard.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{postcard.time}</span>
                  <span aria-hidden="true">·</span>
                  <span>{postcard.moodTag}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif-sc font-semibold tracking-tight">
                  {postcard.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1 font-serif-sc">
                  <MapPin className="w-3.5 h-3.5 text-[#a88243]" />
                  <span>{postcard.location}</span>
                </div>
              </div>

              {/* Postmark Seal Stamp */}
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 postmark-seal ${currentTheme.stampBorder} p-1.5 shadow-sm text-center`}>
                  <span className="text-[9px] font-mono-data tracking-wider uppercase opacity-75">EMBODIED</span>
                  <span className="text-[12px] font-mono-data font-bold leading-tight">
                    {postcard.date.slice(5)}
                  </span>
                  <span className="text-[8px] font-serif-sc opacity-75">具身回响</span>
                </div>
              </div>
            </div>

            {/* Middle: Photograph in Fine Art Frame with Micro 3D Flip */}
            <div className="relative group rounded-xl shadow-md bg-black/5 p-2 sm:p-3 border border-black/10 my-auto">
              <div 
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg perspective-1200 cursor-pointer"
                onDoubleClick={handlePhotoFlip}
                title="双击照片或点击左上角可 3D 翻转胶片档案"
              >
                <div 
                  className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                    isPhotoFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* === Photo Front: Postcard Artwork === */}
                  <div className="absolute inset-0 w-full h-full backface-hidden">
                    <img
                      src={postcard.imageUrl}
                      alt={postcard.title}
                      referrerPolicy="no-referrer"
                      style={{ filter: photoFilter }}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02]"
                    />

                    {/* Button to 3D flip photo to raw contact sheet */}
                    <button
                      type="button"
                      onClick={handlePhotoFlip}
                      className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-black/65 hover:bg-black/85 backdrop-blur-md rounded-md text-[11px] font-serif-sc text-[#edd8b4] border border-white/20 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      title="3D翻转查看相机底片、拍摄参数与冲印档案"
                    >
                      <RotateCw className="w-3 h-3 text-[#e6c382]" />
                      <span>3D翻看胶片档案</span>
                    </button>

                    {/* 30-Minute Darkroom Developing Safelight Overlay */}
                    {isCurrentlyDeveloping && (
                      <div className="absolute inset-0 bg-[#120a06]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-[#edd8b4] z-20 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 animate-pulse">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono-data text-amber-400 tracking-wider uppercase">
                            DARKROOM DEVELOPING · 时间暗房
                          </span>
                          <h4 className="text-base font-serif-sc font-semibold text-white mt-1">
                            暗房显影中 · 剩余约 {remainingMinutes} 分钟
                          </h4>
                          <p className="text-xs text-[#a89e8e] font-serif-sc max-w-xs mx-auto mt-1 leading-relaxed">
                            照片与声音正浸在时间的药水中。请放下手机，喝一口温水或看看窗外，让身心回到现实。
                          </p>
                        </div>
                        <button
                          onClick={handleInstantDevelop}
                          className="px-3.5 py-1.5 bg-[#2a241c] hover:bg-[#383024] border border-[#594d3a] rounded-lg text-xs font-serif-sc text-[#f0ebd9] transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-[#e6c382]" />
                          <span>⚡ 提前完成显影 (立即揭开)</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Authentically Stamped Emotion Fingerprint Seal on Photo */}
                    {postcard.fingerprintStamped && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFingerprintOpen(true);
                        }}
                        className="absolute top-3.5 right-3.5 z-20 cursor-pointer transition-transform hover:scale-110 drop-shadow-xl animate-fade-in"
                        title="已加盖声音情绪印章，点击查看情绪指纹藏书票"
                      >
                        <EmotionFingerprint
                          postcard={postcard}
                          size={62}
                          style={postcard.fingerprintStyle || 'seal'}
                          showOuterText={false}
                          transparentBg={true}
                        />
                      </div>
                    )}

                    {/* Floating buttons: beautify, flip, screenshot and fingerprint */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10 flex-wrap">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="px-3 py-1.5 bg-black/70 hover:bg-black/85 backdrop-blur-md text-[#f5eedc] text-xs font-serif-sc rounded-lg border border-white/20 transition-all flex items-center gap-1.5 shadow-lg"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>3D 翻转背面感受</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFingerprintOpen(true);
                        }}
                        className="px-3 py-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md text-[#edd8b4] text-xs font-serif-sc rounded-lg border border-[#e6c382]/40 transition-all flex items-center gap-1.5 shadow-lg"
                        title="查看声音情绪指纹与生化声学读数"
                      >
                        <Fingerprint className="w-3 h-3 text-[#e6c382]" />
                        <span>情绪声纹</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBeautifyOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#e6c382]/90 hover:bg-[#ebd29b] backdrop-blur-md text-[#141416] text-xs font-serif-sc font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-lg"
                      >
                        <Palette className="w-3 h-3" />
                        <span>光影美化</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsScreenshotModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md text-[#f0ebd9] text-xs font-serif-sc rounded-lg border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-lg"
                        title="高分辨率截图下载正面，保留纸张肌理与手写排版"
                      >
                        <Camera className="w-3 h-3 text-[#e6c382]" />
                        <span>高清截图</span>
                      </button>
                    </div>
                  </div>

                  {/* === Photo Back: Darkroom Film Contact & Shooting Metadata === */}
                  <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-[#161719] text-[#e3ded4] p-5 sm:p-6 flex flex-col justify-between border border-[#36342e] rounded-lg shadow-inner">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 animate-pulse" />
                        <span className="text-xs font-mono-data tracking-wider uppercase text-amber-300">
                          FILM ARCHIVE · 拍摄胶片底卡
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePhotoFlip}
                        className="px-2.5 py-1 text-xs font-serif-sc bg-[#24221d] hover:bg-[#302c25] border border-[#524939] rounded text-[#f5eedc] flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCw className="w-3 h-3 text-[#e6c382]" />
                        <span>翻回照片</span>
                      </button>
                    </div>

                    {/* Middle Info */}
                    <div className="grid grid-cols-2 gap-3 my-auto py-2 text-xs font-serif-sc">
                      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[10px] text-[#999182] font-mono-data uppercase block">Camera & Format</span>
                        <p className="font-medium text-[#f0ebe1]">35mm 全画幅人文底片</p>
                        <p className="text-[11px] text-[#b5ac9d]">ISO 200 · f/2.8 · 1/250s</p>
                      </div>

                      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[10px] text-[#999182] font-mono-data uppercase block">Film & Paper</span>
                        <p className="font-medium text-[#f0ebe1]">Kodak Portra 暖调原色</p>
                        <p className="text-[11px] text-[#b5ac9d]">350g 棉柔无酸特种纸</p>
                      </div>

                      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[10px] text-[#999182] font-mono-data uppercase block">Somatic Readings</span>
                        <p className="font-medium text-[#e6c382]">
                          体表 {postcard.somaticAnchors?.skinTemp || 7}° · 呼吸 {postcard.somaticAnchors?.breathState || 7}/10
                        </p>
                        <p className="text-[11px] text-[#b5ac9d]">心跳节律 {postcard.somaticAnchors?.heartRhythm || 5}/10</p>
                      </div>

                      <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[10px] text-[#999182] font-mono-data uppercase block">Acoustic Warmth</span>
                        <p className="font-medium text-[#e6c382]">
                          情绪温感 {computeFingerprintMetrics(postcard).warmthIndex}°
                        </p>
                        <p className="text-[11px] text-[#b5ac9d]">谐波生命力 {computeFingerprintMetrics(postcard).harmonicRichness}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-[#8f887b] font-serif-sc">
                        💡 动感微翻转：在数字介质上还原暗房拍立得触摸与审阅体验
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBeautifyOpen(true);
                        }}
                        className="text-[#e6c382] hover:text-[#f3ddb3] underline underline-offset-2 font-serif-sc shrink-0"
                      >
                        重新调色美化 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Reflection Snippet & Scannable QR Code */}
            <div className="mt-6 pt-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex-1 pr-0 sm:pr-6">
                <p className="text-xs font-serif-sc tracking-wider opacity-60 mb-1">
                  〔 具身感官记录 · {postcard.promptQuestion} 〕
                </p>
                <p className="text-sm font-serif-sc leading-relaxed opacity-90 line-clamp-2">
                  “{postcard.reflectionText}”
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-xs opacity-75">
                  <span className="flex items-center gap-1 font-mono-data">
                    <Headphones className="w-3.5 h-3.5 text-[#a88243]" />
                    <span>{postcard.listenCount} 人已倾听</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-serif-sc">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                    <span>{postcard.resonances.length} 条心绪共鸣</span>
                  </span>
                </div>
              </div>

              {/* Scannable QR Code Section */}
              <div 
                onClick={() => onOpenListenRoom(postcard)}
                className="shrink-0 flex flex-col items-center p-2 rounded-xl bg-white/60 hover:bg-white/90 border border-black/10 cursor-pointer transition-all hover:shadow-md group"
                title="手机扫码或点击倾听这首声音"
              >
                {postcard.qrCodeDataUrl ? (
                  <img
                    src={postcard.qrCodeDataUrl}
                    alt="扫码倾听感受"
                    className="w-20 h-20 object-contain rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-black/10 rounded flex items-center justify-center">
                    <QrCode className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="mt-1 flex items-center gap-1 text-[11px] font-serif-sc text-[#a87d37] font-medium group-hover:text-[#7d5b24]">
                  <Volume2 className="w-3 h-3" />
                  <span>扫码 / 倾听心声</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE (反面：引导词、录音记录、笔录、心绪回声) ================= */}
          <div
            className={`w-full rounded-2xl p-6 sm:p-9 ${currentTheme.bg} rotate-y-180 backface-hidden absolute inset-0 flex flex-col justify-between overflow-y-auto`}
            style={{ minHeight: '620px' }}
          >
            <div>
              {/* Back Header with Vintage Divider */}
              <div className="flex items-center justify-between border-b pb-4 mb-5 border-black/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#a88243]/20 flex items-center justify-center text-[#a88243] text-xs font-serif-sc font-bold">
                    反
                  </div>
                  <div>
                    <h3 className="text-base font-serif-sc font-semibold">
                      明信片背面 · 具身感受回响
                    </h3>
                    <p className="text-xs opacity-70 font-serif-sc">
                      在逻辑与结构之外，记录肉身的真实感知与声调
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScreenshotModalOpen(true)}
                    className="px-2.5 py-1 text-xs font-serif-sc border border-amber-600/30 bg-[#e6c382]/20 hover:bg-[#e6c382]/35 text-[#85571a] rounded-md transition-colors flex items-center gap-1.5"
                    title="下载明信片高清背面或双面冲印拼版"
                  >
                    <Download className="w-3 h-3" />
                    <span>下载明信片 (PNG)</span>
                  </button>
                  <button
                    onClick={handleFlip}
                    className="px-3 py-1 text-xs font-serif-sc border border-black/20 rounded-md hover:bg-black/5 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>翻回正面</span>
                  </button>
                </div>
              </div>

              {/* Guided Prompt Showcase */}
              <div className="bg-black/5 rounded-xl p-4 border border-black/10 mb-5">
                <div className="flex items-center gap-2 text-xs font-serif-sc text-[#a88243] font-medium mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>觉醒感受引导词</span>
                </div>
                <p className="text-base font-serif-sc font-medium leading-snug">
                  {postcard.promptQuestion}
                </p>
                <p className="text-xs opacity-70 mt-1 font-serif-sc">
                  闭上眼睛，深深吸一口气。你的体温、空气流动、心跳脉搏，是什么样的？
                </p>
              </div>

              {/* Somatic Bodily Readings Badge */}
              <div className="bg-black/5 rounded-xl p-3 border border-black/10 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-serif-sc">
                <div className="flex flex-wrap items-center gap-2.5 text-[#332f28]">
                  <span>🌡️ 皮肤: {postcard.somaticAnchors?.skinTemp || 7}°</span>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span>🫁 呼吸: {postcard.somaticAnchors?.breathState || 7}/10</span>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span>💓 心跳: {postcard.somaticAnchors?.heartRhythm || 5}/10</span>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span>🛡️ 袒露: {postcard.somaticAnchors?.vulnerability || 6}/10</span>
                </div>
                <div className="flex items-center gap-2.5 ml-auto">
                  {onOpenBreathwork && (
                    <button
                      type="button"
                      onClick={onOpenBreathwork}
                      className="px-2 py-0.5 rounded bg-[#a88243]/15 text-[#8f6a2b] hover:bg-[#a88243]/25 text-[11px] font-serif-sc flex items-center gap-1 transition-colors"
                      title="打开呼吸光晕与节律引导"
                    >
                      <Wind className="w-3 h-3" />
                      <span>开启呼吸同频</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSomaticOpen(true)}
                    className="text-[11px] font-serif-sc text-[#a88243] hover:text-[#7d5e2d] underline underline-offset-2"
                  >
                    重测身体读数
                  </button>
                </div>
              </div>

              {/* Emotion Fingerprint Interactive Card on Back */}
              <div 
                onClick={() => setIsFingerprintOpen(true)}
                className="p-3.5 bg-black/5 hover:bg-black/10 rounded-xl border border-black/10 flex items-center justify-between transition-all group mb-4 cursor-pointer"
                title="点击展开声音情绪指纹深度透视与藏书票工坊"
              >
                <div className="flex items-center gap-3">
                  <EmotionFingerprint
                    postcard={postcard}
                    size={52}
                    style={postcard.fingerprintStyle || 'rings'}
                    showOuterText={false}
                    transparentBg={true}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-serif-sc font-medium text-[#7d5e2d]">
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>声音情绪指纹图谱</span>
                      {postcard.fingerprintStamped && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600/20 text-[#85571a] font-mono-data border border-amber-600/30">
                          已加盖印章
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-75 font-serif-sc mt-0.5">
                      语调温感 {computeFingerprintMetrics(postcard).warmthIndex}° · 谐波生命力 {computeFingerprintMetrics(postcard).harmonicRichness} · 点击透视与导出藏书票
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-serif-sc text-[#a88243] group-hover:text-[#7d5e2d]">
                  <span>查看藏书票</span>
                  <span className="text-sm">→</span>
                </div>
              </div>

              {/* Voice Recorder Block */}
              <div className="mb-5">
                <VoiceRecorder
                  initialAudioUrl={postcard.audioUrl}
                  initialDuration={postcard.audioDuration}
                  onAudioSaved={handleAudioSaved}
                />
              </div>

              {/* Written Reflection Notes */}
              <div className="mb-5">
                <label className="block text-xs font-serif-sc text-[#85796a] mb-1.5">
                  声音之后的笔录感受（不可被AI替代的肉身体验）：
                </label>
                <textarea
                  value={postcard.reflectionText}
                  onChange={(e) => onUpdatePostcard({ ...postcard, reflectionText: e.target.value })}
                  placeholder="写下那一刻没说出口的话、皮肤的触感，或内心的微小动荡..."
                  className="w-full h-24 p-3 bg-white/50 border border-black/15 rounded-xl text-sm font-serif-sc leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#a88243] transition-all resize-none text-[#2d2924]"
                />
              </div>
            </div>

            {/* Back Footer: Quick listen room launch */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs font-mono-data opacity-60">
                POSTCARD NO. {postcard.id.toUpperCase()}
              </span>
              <button
                onClick={() => onOpenListenRoom(postcard)}
                className="px-4 py-2 bg-[#2d2822] text-[#ecd8b5] hover:bg-[#3d372e] rounded-lg text-xs font-serif-sc transition-colors flex items-center gap-2"
              >
                <Headphones className="w-3.5 h-3.5 text-[#e6c382]" />
                <span>进入沉浸倾听室</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Postcard Beautification & Pro Filter Studio */}
      <PostcardBeautifyStudio
        postcard={postcard}
        isOpen={isBeautifyOpen}
        onClose={() => setIsBeautifyOpen(false)}
        onApplyPhotoFilter={(filterCss) => setPhotoFilter(filterCss)}
      />

      {/* Physical Print & Slow Mail Service Modal */}
      <PhysicalOrderModal
        postcard={postcard}
        isOpen={isPhysicalOrderOpen}
        onClose={() => setIsPhysicalOrderOpen(false)}
      />

      {/* Somatic Awakening Studio Modal */}
      <SomaticAwakeningStudio
        isOpen={isSomaticOpen}
        onClose={() => setIsSomaticOpen(false)}
        initialAnchors={postcard.somaticAnchors}
        onApplyAnchors={(anchors) => onUpdatePostcard({ ...postcard, somaticAnchors: anchors })}
      />

      {/* High-Resolution Screenshot & Texture Exporter Modal */}
      <PostcardScreenshotModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        postcard={postcard}
        currentTheme={selectedTheme}
        photoFilter={photoFilter}
      />

      {/* Voice Emotion Fingerprint Inspector & Ex-Libris Modal */}
      <VoiceFingerprintModal
        postcard={postcard}
        isOpen={isFingerprintOpen}
        onClose={() => setIsFingerprintOpen(false)}
        onUpdatePostcard={onUpdatePostcard}
      />
    </div>
  );
};
