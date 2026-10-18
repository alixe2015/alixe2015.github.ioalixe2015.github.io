import React, { useState, useRef, useEffect } from 'react';
import { PostcardEntry } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Download, 
  Stamp, 
  Sparkles, 
  Volume2, 
  Layers, 
  Sliders, 
  Check, 
  Share2, 
  Copy,
  Info,
  Calendar,
  MapPin,
  Heart
} from 'lucide-react';
import { EmotionFingerprint } from './EmotionFingerprint';
import { computeFingerprintMetrics, drawFingerprintOnCanvas } from '../utils/voiceFingerprintHelper';
import { ambientPlayer } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface VoiceFingerprintModalProps {
  postcard: PostcardEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePostcard?: (updated: PostcardEntry) => void;
}

export const VoiceFingerprintModal: React.FC<VoiceFingerprintModalProps> = ({
  postcard,
  isOpen,
  onClose,
  onUpdatePostcard
}) => {
  if (!isOpen || !postcard) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [style, setStyle] = useState<'rings' | 'waves' | 'seal'>(postcard.fingerprintStyle || 'rings');
  const [isExporting, setIsExporting] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const metrics = computeFingerprintMetrics(postcard);
  const totalDuration = postcard.audioDuration || 20;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      ambientPlayer.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      ambientPlayer.stop();
    } else {
      setIsPlaying(true);
      const audioUrl = postcard.audioUrl;
      if (audioUrl && audioUrl.startsWith('data:audio')) {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(audioUrl);
        } else {
          audioElementRef.current.src = audioUrl;
        }

        audioElementRef.current.ontimeupdate = () => {
          if (audioElementRef.current) {
            setCurrentSeconds(Math.floor(audioElementRef.current.currentTime));
          }
        };

        audioElementRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentSeconds(0);
        };

        audioElementRef.current.play().catch(() => {
          // fallback
          startSynthTimer();
        });
      } else {
        startSynthTimer();
      }
    }
  };

  const startSynthTimer = () => {
    ambientPlayer.playAmbient('warmth', totalDuration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stamp onto the current postcard
  const handleApplyStamp = () => {
    if (!onUpdatePostcard) return;
    const updated: PostcardEntry = {
      ...postcard,
      fingerprintStamped: true,
      fingerprintStyle: style
    };
    onUpdatePostcard(updated);
    setStampedSuccess(true);

    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.7 },
        colors: [metrics.dominantColor, '#e6c382', '#ffffff']
      });
    } catch {}

    setTimeout(() => setStampedSuccess(false), 2400);
  };

  // Export high-resolution Ex-Libris Bookmark / Card
  const handleExportExLibris = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const dpr = 2.5; // High-res retina
      const w = 540;
      const h = 880;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      // 1. Dark vintage paper background
      ctx.fillStyle = '#111215';
      ctx.fillRect(0, 0, w, h);

      // Subtle textured border frame
      ctx.strokeStyle = '#2d2c28';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      ctx.strokeStyle = `${metrics.dominantColor}40`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(26, 26, w - 52, h - 52);

      // 2. Header: Embodied Echo Brand & Date
      ctx.font = '600 11px "Space Mono", monospace';
      ctx.fillStyle = '#8a8376';
      ctx.letterSpacing = '2px';
      ctx.fillText('EMBODIED ECHO · ACOUSTIC EX-LIBRIS', 42, 54);

      ctx.font = '12px "Noto Serif SC", serif';
      ctx.fillStyle = metrics.dominantColor;
      ctx.fillText(`【${metrics.dimensionName}】`, w - 110, 54);

      // Title & Postcard info
      ctx.font = 'bold 22px "Noto Serif SC", serif';
      ctx.fillStyle = '#ede8de';
      ctx.fillText(postcard.title, 42, 92);

      ctx.font = '12px "Noto Serif SC", serif';
      ctx.fillStyle = '#9c9586';
      ctx.fillText(`${postcard.date} · ${postcard.location} · ${postcard.moodTag}`, 42, 114);

      // 3. Central Fingerprint drawing
      const fpCanvas = document.createElement('canvas');
      drawFingerprintOnCanvas(fpCanvas, postcard, {
        size: 300,
        style,
        showOuterText: true,
        transparentBg: true
      });
      ctx.drawImage(fpCanvas, (w - 300) / 2, 140, 300, 300);

      // 4. Acoustic metrics cards
      const cardY = 460;
      const cardW = 105;
      const cardH = 68;
      const metricsList = [
        { label: '语调温感', val: `${metrics.warmthIndex}°`, sub: '低频温润度' },
        { label: '心率微颤', val: `${metrics.jitterIndex}%`, sub: '迷走神经共振' },
        { label: '沉思留白', val: `${metrics.silenceRatio}%`, sub: '呼吸停顿率' },
        { label: '谐波生命', val: `${metrics.harmonicRichness}`, sub: '泛音饱满度' }
      ];

      metricsList.forEach((m, idx) => {
        const mx = 42 + idx * (cardW + 12);
        ctx.fillStyle = '#18191d';
        ctx.fillRect(mx, cardY, cardW, cardH);
        ctx.strokeStyle = '#2b2a26';
        ctx.strokeRect(mx, cardY, cardW, cardH);

        ctx.font = '10px "Noto Serif SC", serif';
        ctx.fillStyle = '#8a8376';
        ctx.fillText(m.label, mx + 10, cardY + 20);

        ctx.font = 'bold 16px "Space Mono", monospace';
        ctx.fillStyle = metrics.dominantColor;
        ctx.fillText(m.val, mx + 10, cardY + 44);

        ctx.font = '9px "Noto Serif SC", serif';
        ctx.fillStyle = '#6e695e';
        ctx.fillText(m.sub, mx + 10, cardY + 59);
      });

      // 5. Guided Prompt & Reflection snippet
      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillStyle = '#bda579';
      ctx.fillText(`当时感知：“${postcard.promptQuestion}”`, 42, 560);

      // Multi-line reflection
      ctx.font = '13px "Noto Serif SC", serif';
      ctx.fillStyle = '#cfc8be';
      const text = postcard.reflectionText || '肉身是灵魂唯一的锚点，声音是时间留下的拓印。';
      const maxTextWidth = w - 84;
      const words = text.split('');
      let line = '';
      let curY = 590;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metricsW = ctx.measureText(testLine).width;
        if (metricsW > maxTextWidth && n > 0) {
          ctx.fillText(line, 42, curY);
          line = words[n];
          curY += 22;
          if (curY > 700) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 42, curY);

      // 6. Footer stamp & slogan
      ctx.strokeStyle = '#282724';
      ctx.beginPath();
      ctx.moveTo(42, 750);
      ctx.lineTo(w - 42, 750);
      ctx.stroke();

      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillStyle = '#8a8376';
      ctx.fillText('具身回响 · 声音情绪指纹藏书票 (VOICE FINGERPRINT EX-LIBRIS)', 42, 780);

      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = '#6b665c';
      ctx.fillText(`RECORDED DURATION: ${postcard.audioDuration || 20}S · AUTHENTIC BIO-ACOUSTIC STAMP`, 42, 800);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `具身回响_声音情绪指纹_${postcard.title}_${postcard.date}.png`;
      a.click();
    } catch (e) {
      console.error('Export ex-libris error', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy textual summary
  const handleCopySummary = () => {
    const text = `【具身回响 · 声音情绪指纹】\n明信片：《${postcard.title}》 (${postcard.date} · ${postcard.location})\n感官维度：${metrics.dimensionName} (印记: ${metrics.glyph})\n语调温感指数：${metrics.warmthIndex}/10\n心率微颤共振：${metrics.jitterIndex}%\n沉思留白比例：${metrics.silenceRatio}%\n谐波生命力：${metrics.harmonicRichness}\n感悟回忆：“${postcard.reflectionText || postcard.promptQuestion}”`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121316] border border-[#2d2c28] rounded-3xl shadow-2xl overflow-hidden my-auto text-[#ede8de] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22211e] bg-[#0c0d0f]">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-serif-sc font-bold"
              style={{ borderColor: `${metrics.dominantColor}60`, color: metrics.dominantColor, background: '#1c1b18' }}
            >
              {metrics.glyph}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-serif-sc font-medium text-[#ede8de]">
                <span>声音情绪指纹图谱 · Soundscape & Emotion Fingerprint</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#d4af37] border border-white/10 font-mono-data">
                  {postcard.date}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8779] font-serif-sc">
                从生物声学波纹与身体温度中提炼出的不可复制的生命拓印
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e8779] hover:text-[#ede8de] hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visual & Style Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Center Stage: Emotion Fingerprint with Pulse */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#0e0f11] rounded-2xl border border-[#22211e] relative group">
              <EmotionFingerprint
                postcard={postcard}
                size={260}
                isPlaying={isPlaying}
                style={style}
                showOuterText={true}
              />

              {/* Play / Pause Overlay Button */}
              <button
                onClick={handleTogglePlay}
                className={`mt-4 px-4 py-2 rounded-xl text-xs font-serif-sc font-medium flex items-center gap-2 transition-all shadow-md ${
                  isPlaying
                    ? 'bg-[#e6c382] text-[#141517]'
                    : 'bg-[#1e1f24] text-[#cfc8bd] hover:bg-[#282a32]'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? `回响中 (${currentSeconds}s/${totalDuration}s)` : '倾听声纹脉冲'}</span>
              </button>

              <span className="text-[10px] text-[#736e63] font-serif-sc mt-2">
                {isPlaying ? '声纹正随音频频率实时震荡旋转' : '点击播放，观察年轮共振变化'}
              </span>
            </div>

            {/* Right Pane: Style & Bio-Acoustic Metrics */}
            <div className="space-y-4">
              {/* Style selector */}
              <div>
                <span className="text-[11px] font-mono-data text-[#8a8376] uppercase tracking-wider block mb-2">
                  FINGERPRINT RENDER STYLE · 声纹呈现形态
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rings', label: '年轮密纹', sub: '树木与唱片', icon: '🌀' },
                    { id: 'waves', label: '声波粒子', sub: '频谱频率射线', icon: '⚡' },
                    { id: 'seal', label: '朱砂印章', sub: '传统藏书金石', icon: '🔴' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        style === s.id
                          ? 'bg-[#201d17] border-[#e6c382]/60 text-[#f5efe4]'
                          : 'bg-[#16171b] border-white/5 text-[#8c8577] hover:border-white/10'
                      }`}
                    >
                      <div className="text-base">{s.icon}</div>
                      <div className="text-xs font-serif-sc font-medium mt-1">{s.label}</div>
                      <div className="text-[10px] text-[#736e63] truncate">{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Bio-Acoustic Metrics */}
              <div>
                <span className="text-[11px] font-mono-data text-[#8a8376] uppercase tracking-wider block mb-2">
                  SOMATIC ACOUSTIC READINGS · 感官声学读数
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Metric 1 */}
                  <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8e8779] font-serif-sc">
                      <span>语调温感指数</span>
                      <span className="text-xs">🌡️</span>
                    </div>
                    <div className="text-lg font-mono-data font-semibold text-[#e6c382]">
                      {metrics.warmthIndex}<span className="text-xs font-normal opacity-60">/10</span>
                    </div>
                    <p className="text-[10px] text-[#6e685c] leading-tight">
                      {metrics.warmthIndex >= 7 ? '丰盈热烈，声波谐波丰富' : metrics.warmthIndex <= 3.8 ? '清冽凝练，抽离沉着' : '自洽温润，中频平稳'}
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8e8779] font-serif-sc">
                      <span>心率微颤率</span>
                      <span className="text-xs">💓</span>
                    </div>
                    <div className="text-lg font-mono-data font-semibold text-[#e6c382]">
                      {metrics.jitterIndex}<span className="text-xs font-normal opacity-60">%</span>
                    </div>
                    <p className="text-[10px] text-[#6e685c] leading-tight">
                      记录说话时下意识的心潮搏动微颤
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8e8779] font-serif-sc">
                      <span>沉思留白比例</span>
                      <span className="text-xs">🍃</span>
                    </div>
                    <div className="text-lg font-mono-data font-semibold text-[#e6c382]">
                      {metrics.silenceRatio}<span className="text-xs font-normal opacity-60">%</span>
                    </div>
                    <p className="text-[10px] text-[#6e685c] leading-tight">
                      言语之间的安静间歇与深长呼吸
                    </p>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8e8779] font-serif-sc">
                      <span>谐波生命力</span>
                      <span className="text-xs">🔔</span>
                    </div>
                    <div className="text-lg font-mono-data font-semibold text-[#e6c382]">
                      {metrics.harmonicRichness}<span className="text-xs font-normal opacity-60">/100</span>
                    </div>
                    <p className="text-[10px] text-[#6e685c] leading-tight">
                      真实肉身声带振动的特异性与厚度
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt and Quote Context */}
          <div className="p-4 bg-[#16171b] rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif-sc text-[#d4af37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>唤醒感受：“{postcard.promptQuestion}”</span>
            </div>
            <p className="text-xs font-serif-sc text-[#cfc8bd] italic leading-relaxed">
              “{postcard.reflectionText || '肉身是灵魂唯一的锚点，声音是时间留下的拓印。'}”
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0c0d0f] border-t border-[#201f1c] flex flex-wrap items-center justify-between gap-3">
          {/* Left: Copy details */}
          <button
            onClick={handleCopySummary}
            className="px-3 py-2 bg-[#191a1e] hover:bg-[#23242a] text-[#8e8779] hover:text-[#ede8de] rounded-xl text-xs font-serif-sc transition-colors flex items-center gap-1.5 border border-white/5"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? '已复制声纹数据' : '复制声纹读数'}</span>
          </button>

          {/* Right: Apply Stamp & Export Ex-Libris */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleApplyStamp}
              disabled={postcard.fingerprintStamped}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif-sc transition-all flex items-center gap-1.5 border ${
                postcard.fingerprintStamped
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300 cursor-default'
                  : 'bg-[#1d1b17] border-[#e6c382]/40 text-[#e6c382] hover:bg-[#29261f]'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>{postcard.fingerprintStamped ? '已加盖于明信片' : '加盖声纹印章到明信片'}</span>
            </button>

            <button
              onClick={handleExportExLibris}
              disabled={isExporting}
              className="px-4 py-2 bg-[#e6c382] hover:bg-[#ebd29b] active:scale-95 text-[#141517] font-serif-sc font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '正在生成藏书票...' : '导出情绪指纹藏书票 (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
