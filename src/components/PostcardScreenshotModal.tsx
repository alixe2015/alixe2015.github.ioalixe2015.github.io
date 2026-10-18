import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Camera, 
  Layers, 
  Palette, 
  Sliders, 
  Eye, 
  Share2, 
  QrCode, 
  MapPin, 
  Calendar,
  Volume2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import confetti from 'canvas-confetti';
import { PostcardEntry, PostcardTheme } from '../types';
import { EmotionFingerprint } from './EmotionFingerprint';
import { computeFingerprintMetrics } from '../utils/voiceFingerprintHelper';

interface PostcardScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  postcard: PostcardEntry;
  currentTheme: PostcardTheme;
  photoFilter?: string;
}

export const PostcardScreenshotModal: React.FC<PostcardScreenshotModalProps> = ({
  isOpen,
  onClose,
  postcard,
  currentTheme: initialTheme,
  photoFilter: initialFilter = 'none',
}) => {
  const [theme, setTheme] = useState<PostcardTheme>(initialTheme || 'warm-paper');
  const [filter, setFilter] = useState<string>(initialFilter);
  const [exportFace, setExportFace] = useState<'front' | 'back' | 'both'>('front');
  const [aspectRatio, setAspectRatio] = useState<'postcard' | 'square' | 'story'>('postcard');
  const [resolutionScale, setResolutionScale] = useState<number>(2.5); // 2.5x retina quality (~2400px)
  const [enablePaperTexture, setEnablePaperTexture] = useState<boolean>(true);
  const [enableVignette, setEnableVignette] = useState<boolean>(true);
  const [enableStamp, setEnableStamp] = useState<boolean>(true);
  const [enableBranding, setEnableBranding] = useState<boolean>(true);
  const [enableQR, setEnableQR] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const captureCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  if (!isOpen) return null;

  const themeConfig: Record<PostcardTheme, {
    bgClass: string;
    bgColor: string;
    textColor: string;
    subTextColor: string;
    borderColor: string;
    stampBorder: string;
    stampColor: string;
    label: string;
    accentColor: string;
  }> = {
    'warm-paper': {
      bgClass: 'paper-warm',
      bgColor: '#f7f4ed',
      textColor: '#2a241e',
      subTextColor: '#6e6356',
      borderColor: '#dfd5c4',
      stampBorder: 'border-[#a8957c]',
      stampColor: '#a8957c',
      label: '暖木信笺',
      accentColor: '#a88243',
    },
    'polaroid': {
      bgClass: 'bg-[#faf8f5]',
      bgColor: '#faf8f5',
      textColor: '#1a1918',
      subTextColor: '#59554d',
      borderColor: '#e8e2d5',
      stampBorder: 'border-[#948774]',
      stampColor: '#948774',
      label: '胶片拍立得',
      accentColor: '#c29d59',
    },
    'darkroom': {
      bgClass: 'paper-darkroom',
      bgColor: '#141416',
      textColor: '#f0ebd9',
      subTextColor: '#9c9384',
      borderColor: '#33312b',
      stampBorder: 'border-[#7d705c]',
      stampColor: '#7d705c',
      label: '暗房显影',
      accentColor: '#d4af37',
    },
    'cool-mist': {
      bgClass: 'paper-cool',
      bgColor: '#f4f6f8',
      textColor: '#1e293b',
      subTextColor: '#64748b',
      borderColor: '#cbd5e1',
      stampBorder: 'border-[#94a3b8]',
      stampColor: '#94a3b8',
      label: '晨雾微凉',
      accentColor: '#475569',
    },
    'sepia': {
      bgClass: 'paper-sepia',
      bgColor: '#f5eedc',
      textColor: '#382818',
      subTextColor: '#7d674f',
      borderColor: '#d8c3a5',
      stampBorder: 'border-[#967d5c]',
      stampColor: '#967d5c',
      label: '琥珀怀旧',
      accentColor: '#a16207',
    },
  };

  const currentConfig = themeConfig[theme] || themeConfig['warm-paper'];

  // Handle direct screenshot download using html-to-image
  const handleDownloadScreenshot = async () => {
    if (!captureCardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Small pause to ensure layout paint
      await new Promise((resolve) => setTimeout(resolve, 80));

      const dataUrl = await toPng(captureCardRef.current, {
        quality: 0.98,
        pixelRatio: resolutionScale,
        cacheBust: true,
        backgroundColor: currentConfig.bgColor,
        style: {
          transform: 'none',
          boxShadow: 'none',
        },
      });

      const downloadLink = document.createElement('a');
      const faceTag = exportFace === 'front' ? '正面' : exportFace === 'back' ? '背面' : '正反双面冲印拼版';
      const filename = `具身回响_明信片${faceTag}_${postcard.title.replace(/\s+/g, '_')}_${postcard.date}.png`;
      downloadLink.download = filename;
      downloadLink.href = dataUrl;
      downloadLink.click();

      setExportSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#e6c382', '#eed49f', '#d4af37'],
        });
      } catch {}

      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Screenshot download failed', error);
      // Fallback: alert user or handle fallback
    } finally {
      setIsExporting(false);
    }
  };

  // Handle copying image screenshot directly to clipboard
  const handleCopyToClipboard = async () => {
    if (!captureCardRef.current) return;
    setIsExporting(true);
    setCopySuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const blob = await toBlob(captureCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: currentConfig.bgColor,
        style: {
          transform: 'none',
          boxShadow: 'none',
        },
      });

      if (!blob) throw new Error('Failed to create image blob');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } else {
        // If ClipboardItem not supported, fallback to download
        handleDownloadScreenshot();
      }
    } catch (error) {
      console.error('Clipboard copy failed', error);
      // Fallback to download
      handleDownloadScreenshot();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#141517] border border-[#33312b] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6c382]/10 border border-[#e6c382]/30 flex items-center justify-center text-[#e6c382]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif-sc font-semibold text-[#f0ebd9] flex items-center gap-2">
                <span>导出与下载明信片</span>
                <span className="px-2 py-0.5 text-[10px] font-mono-data bg-[#e6c382]/20 text-[#edd49d] border border-[#e6c382]/40 rounded-full">
                  Ultra HD PNG · 印刷级精细度
                </span>
              </h3>
              <p className="text-[11px] text-[#8f887b] font-serif-sc">
                支持下载正面摄影、背面笔录声纹，或正反双面实体冲印拼版（350g 特种纸规范）
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body: Split Left (Preview) and Right (Options Toolbar) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 overflow-y-auto min-h-0 bg-[#0e0f11]">
          {/* LEFT: Live Preview Canvas (7 cols on large screens) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-3 sm:p-5 bg-[#17181c] border border-[#2b2925] rounded-xl overflow-hidden relative group">
            <div className="text-[11px] font-mono-data text-[#888173] mb-3 flex items-center justify-between w-full px-1">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#e6c382]" />
                <span>实时截图渲染视窗 (所见即所得)</span>
              </span>
              <span className="text-[10px] bg-[#222328] px-2 py-0.5 rounded border border-[#373531]">
                {resolutionScale === 2.5 ? '2.5x 视网膜超清 (~2400px)' : '3.0x 极度细腻 (~2880px)'}
              </span>
            </div>

            {/* Scaled Preview Wrapper to guarantee it fits cleanly on screen */}
            <div className="w-full flex items-center justify-center overflow-auto py-2 max-h-[58vh]">
              {/* THE ELEMENT THAT GETS CAPTURED BY html-to-image */}
              <div
                ref={captureCardRef}
                style={{
                  width: exportFace === 'both' ? '960px' : aspectRatio === 'square' ? '560px' : aspectRatio === 'story' ? '460px' : '580px',
                  backgroundColor: currentConfig.bgColor,
                  color: currentConfig.textColor,
                }}
                className={`relative rounded-2xl transition-all duration-300 shadow-2xl p-6 sm:p-7 border ${
                  enablePaperTexture ? currentConfig.bgClass : ''
                }`}
              >
                {/* Vintage Border Inset Line */}
                <div 
                  className="absolute inset-3 rounded-xl pointer-events-none border opacity-40"
                  style={{ borderColor: currentConfig.accentColor }}
                />

                {/* Subtle Paper Vignette & Lighting */}
                {enableVignette && (
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-multiply opacity-25"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 60%, rgba(60, 45, 30, 0.45) 100%)',
                    }}
                  />
                )}

                {/* Render Front, Back or Double-Sided Combined */}
                {exportFace === 'both' ? (
                  <div className="flex flex-col md:flex-row gap-6 items-stretch w-full relative z-10">
                    {/* Front Card Column */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Top Header */}
                      <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-black/10">
                        <div className="pr-4">
                          <div className="flex items-center gap-2 text-[11px] font-mono-data opacity-75 mb-1">
                            <Calendar className="w-3 h-3 inline" />
                            <span>{postcard.date}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold">{postcard.moodTag}</span>
                          </div>
                          <h2 className="text-xl font-serif-sc font-bold tracking-tight">
                            {postcard.title}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1 font-serif-sc">
                            <MapPin className="w-3 h-3" style={{ color: currentConfig.accentColor }} />
                            <span>{postcard.location}</span>
                          </div>
                        </div>

                        {enableStamp && (
                          <div className="shrink-0 flex flex-col items-center">
                            <div 
                              className={`w-14 h-14 postmark-seal ${currentConfig.stampBorder} p-1 shadow-sm text-center`}
                              style={{ color: currentConfig.stampColor }}
                            >
                              <span className="text-[7.5px] font-mono-data uppercase opacity-80">EMBODIED</span>
                              <span className="text-[10px] font-mono-data font-bold my-0.5">
                                {postcard.date.slice(5)}
                              </span>
                              <span className="text-[7px] font-serif-sc opacity-80">具身正面</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Photo Frame */}
                      <div className="relative rounded-xl overflow-hidden shadow-md bg-black/5 p-2 border border-black/10 my-1">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                          <img
                            src={postcard.imageUrl}
                            alt={postcard.title}
                            referrerPolicy="no-referrer"
                            style={{ filter: filter }}
                            className="w-full h-full object-cover"
                          />
                          {postcard.fingerprintStamped && (
                            <div className="absolute top-2 right-2 drop-shadow-md">
                              <EmotionFingerprint
                                postcard={postcard}
                                size={44}
                                style={postcard.fingerprintStyle || 'seal'}
                                showOuterText={false}
                                transparentBg={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[10px] font-serif-sc opacity-75">
                        <span>〔 {postcard.promptQuestion} 〕</span>
                        <span>正面摄影画面</span>
                      </div>
                    </div>

                    {/* Perforation Fold / Cut Line */}
                    <div className="hidden md:flex items-center justify-center px-1">
                      <div className="border-l-2 border-dashed border-black/25 h-full min-h-[320px] flex items-center justify-center">
                        <span className="text-[8.5px] font-mono-data opacity-50 -rotate-90 whitespace-nowrap tracking-widest my-auto">
                          ✂️ 350g 特种纸对折与裁切线
                        </span>
                      </div>
                    </div>

                    {/* Back Card Column */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-black/10">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono-data opacity-75 mb-1">
                            <span className="px-1.5 py-0.2 rounded bg-black/10 font-bold text-[10px]">反面</span>
                            <span>{postcard.date}</span>
                          </div>
                          <h3 className="text-xl font-serif-sc font-bold tracking-tight">
                            明信片背面 · 具身笔录
                          </h3>
                        </div>

                        {enableStamp && (
                          <div className="w-13 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-1 text-center opacity-70"
                               style={{ borderColor: currentConfig.stampColor }}>
                            <span className="text-[7px] font-mono-data uppercase">POSTAGE</span>
                            <span className="text-[9px] font-serif-sc font-bold mt-0.5">具身邮戳</span>
                            <span className="text-[7px] font-mono-data opacity-60">慢递</span>
                          </div>
                        )}
                      </div>

                      {/* Reflection */}
                      <div className="bg-black/5 rounded-xl p-3.5 border border-black/10 mb-3 flex-1 flex flex-col justify-center">
                        <p className="text-xs font-serif-sc leading-relaxed opacity-95 italic whitespace-pre-wrap">
                          “{postcard.reflectionText}”
                        </p>
                      </div>

                      {/* Somatic Badges */}
                      <div className="bg-black/5 rounded-lg p-2.5 border border-black/10 mb-3 flex flex-wrap items-center justify-between text-[11px] font-serif-sc">
                        <span>🌡️ 皮肤: {postcard.somaticAnchors?.skinTemp || 7}°</span>
                        <span>🫁 呼吸: {postcard.somaticAnchors?.breathState || 7}/10</span>
                        <span>💓 心跳: {postcard.somaticAnchors?.heartRhythm || 5}/10</span>
                      </div>

                      {/* QR and Fingerprint */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/10">
                        <div className="flex items-center gap-2">
                          <EmotionFingerprint
                            postcard={postcard}
                            size={44}
                            style={postcard.fingerprintStyle || 'seal'}
                            showOuterText={false}
                            transparentBg={true}
                          />
                          <div className="text-[10px] font-serif-sc">
                            <p className="font-medium" style={{ color: currentConfig.accentColor }}>声音情绪指纹</p>
                            <p className="opacity-70">温感 {computeFingerprintMetrics(postcard).warmthIndex}°</p>
                          </div>
                        </div>

                        {enableQR && (
                          <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded border border-black/10">
                            {postcard.qrCodeDataUrl ? (
                              <img src={postcard.qrCodeDataUrl} alt="扫码听心声" className="w-10 h-10 object-contain rounded" />
                            ) : (
                              <QrCode className="w-8 h-8 opacity-40" />
                            )}
                            <span className="text-[8px] font-serif-sc leading-tight" style={{ color: currentConfig.accentColor }}>
                              扫码<br/>听心声
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : exportFace === 'back' ? (
                  /* ================= BACK SIDE ONLY ================= */
                  <div className="relative z-10 flex flex-col justify-between min-h-[460px]">
                    <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-black/10">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono-data opacity-75 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-black/10 font-bold text-[10px]">反面</span>
                          <span>{postcard.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{postcard.time}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold">{postcard.moodTag}</span>
                        </div>
                        <h2 className="text-2xl font-serif-sc font-bold tracking-tight">
                          明信片背面 · 具身感官手写笔录
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1 font-serif-sc">
                          <MapPin className="w-3 h-3" style={{ color: currentConfig.accentColor }} />
                          <span>{postcard.location} · 私密原声存档</span>
                        </div>
                      </div>

                      {enableStamp && (
                        <div className="shrink-0 flex flex-col items-center">
                          <div 
                            className="w-16 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-1 text-center opacity-70"
                            style={{ borderColor: currentConfig.stampColor }}
                          >
                            <span className="text-[7.5px] font-mono-data uppercase tracking-wider">POSTAGE</span>
                            <span className="text-[9.5px] font-serif-sc font-bold mt-1">具身邮票</span>
                            <span className="text-[7.5px] font-mono-data mt-1 opacity-70">¥9.9 慢递</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/5 rounded-xl p-4 border border-black/10 mb-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-serif-sc font-medium mb-1.5" style={{ color: currentConfig.accentColor }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>觉醒感受引导词 · {postcard.promptQuestion}</span>
                      </div>
                      <p className="text-sm font-serif-sc leading-relaxed opacity-95 whitespace-pre-wrap italic">
                        “{postcard.reflectionText}”
                      </p>
                    </div>

                    <div className="bg-black/5 rounded-xl p-3 border border-black/10 mb-4 flex flex-wrap items-center justify-between text-xs font-serif-sc gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>🌡️ 皮肤: {postcard.somaticAnchors?.skinTemp || 7}°</span>
                        <span className="opacity-40">·</span>
                        <span>🫁 呼吸: {postcard.somaticAnchors?.breathState || 7}/10</span>
                        <span className="opacity-40">·</span>
                        <span>💓 心跳: {postcard.somaticAnchors?.heartRhythm || 5}/10</span>
                        <span className="opacity-40">·</span>
                        <span>🛡️ 袒露: {postcard.somaticAnchors?.vulnerability || 6}/10</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-black/5 rounded-xl border border-black/10 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <EmotionFingerprint
                          postcard={postcard}
                          size={52}
                          style={postcard.fingerprintStyle || 'seal'}
                          showOuterText={false}
                          transparentBg={true}
                        />
                        <div>
                          <div className="text-xs font-serif-sc font-medium" style={{ color: currentConfig.accentColor }}>
                            声音情绪指纹图谱
                          </div>
                          <p className="text-[10px] opacity-75 font-serif-sc mt-0.5">
                            语调温感 {computeFingerprintMetrics(postcard).warmthIndex}° · 谐波生命力 {computeFingerprintMetrics(postcard).harmonicRichness}
                          </p>
                        </div>
                      </div>

                      {enableQR && (
                        <div className="shrink-0 flex flex-col items-center p-1.5 rounded-lg bg-white/70 border border-black/10 shadow-sm">
                          {postcard.qrCodeDataUrl ? (
                            <img
                              src={postcard.qrCodeDataUrl}
                              alt="微信扫码倾听"
                              className="w-13 h-13 object-contain rounded"
                            />
                          ) : (
                            <div className="w-13 h-13 bg-black/10 rounded flex items-center justify-center">
                              <QrCode className="w-5 h-5 opacity-40" />
                            </div>
                          )}
                          <div className="mt-0.5 flex items-center gap-1 text-[8.5px] font-serif-sc font-medium" style={{ color: currentConfig.accentColor }}>
                            <Volume2 className="w-2.5 h-2.5" />
                            <span>扫码听心声</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {enableBranding && (
                      <div className="mt-3.5 pt-2 border-t border-dashed border-black/10 flex items-center justify-between text-[9px] font-mono-data opacity-50">
                        <span>EMBODIED ECHO · ANTI-ALGORITHM SENSORY LOG</span>
                        <span>350g COTTON PRINT EDITION</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= FRONT SIDE ONLY ================= */
                  <div className="relative z-10 flex flex-col justify-between">
                    {/* Top Header: Date, Mood, Title and Postmark Stamp */}
                    <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-black/10">
                      <div className="pr-4">
                        <div className="flex items-center gap-2 text-[11px] font-mono-data opacity-75 mb-1">
                          <Calendar className="w-3 h-3 inline" />
                          <span>{postcard.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{postcard.time}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold">{postcard.moodTag}</span>
                        </div>

                        <h2 className="text-2xl font-serif-sc font-bold tracking-tight">
                          {postcard.title}
                        </h2>

                        <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1 font-serif-sc">
                          <MapPin className="w-3 h-3" style={{ color: currentConfig.accentColor }} />
                          <span>{postcard.location}</span>
                        </div>
                      </div>

                      {/* Circular Postmark Stamp */}
                      {enableStamp && (
                        <div className="shrink-0 flex flex-col items-center">
                          <div 
                            className={`w-16 h-16 postmark-seal ${currentConfig.stampBorder} p-1 shadow-sm text-center`}
                            style={{ color: currentConfig.stampColor }}
                          >
                            <span className="text-[8px] font-mono-data tracking-wider uppercase opacity-80">EMBODIED</span>
                            <span className="text-[11px] font-mono-data font-bold leading-none my-0.5">
                              {postcard.date.slice(5)}
                            </span>
                            <span className="text-[7.5px] font-serif-sc opacity-80">具身回响</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main Photograph with Frame and Filter */}
                    <div className="relative rounded-xl overflow-hidden shadow-md bg-black/5 p-2 border border-black/10 my-1">
                      <div className={`relative overflow-hidden rounded-lg ${
                        aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'story' ? 'aspect-[4/5]' : 'aspect-[4/3]'
                      } w-full`}>
                        <img
                          src={postcard.imageUrl}
                          alt={postcard.title}
                          referrerPolicy="no-referrer"
                          style={{ filter: filter }}
                          className="w-full h-full object-cover"
                        />

                        {/* Sensor dimension badge on photo */}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[#f0ebd9] text-[10px] font-serif-sc rounded border border-white/15">
                          感官切片 · {postcard.sensoryDimension === 'tactile' ? '触觉' : postcard.sensoryDimension === 'scent' ? '气味' : postcard.sensoryDimension === 'breath' ? '呼吸' : postcard.sensoryDimension === 'unspoken' ? '未尽之言' : '微探险'}
                        </div>

                        {/* Stamped Emotion Fingerprint Seal if applied */}
                        {postcard.fingerprintStamped && (
                          <div className="absolute top-2.5 right-2.5 drop-shadow-lg">
                            <EmotionFingerprint
                              postcard={postcard}
                              size={52}
                              style={postcard.fingerprintStyle || 'seal'}
                              showOuterText={false}
                              transparentBg={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Reflection Quote and Scannable QR Code */}
                    <div className="mt-4 pt-3.5 border-t border-black/10 flex items-center justify-between gap-4">
                      <div className="flex-1 pr-3">
                        <p className="text-[10.5px] font-serif-sc tracking-wide opacity-65 mb-1">
                          〔 {postcard.promptQuestion} 〕
                        </p>
                        <p className="text-xs font-serif-sc leading-relaxed opacity-90 line-clamp-2 italic">
                          “{postcard.reflectionText}”
                        </p>
                      </div>

                      {/* Scannable QR code */}
                      {enableQR && (
                        <div className="shrink-0 flex flex-col items-center p-1.5 rounded-lg bg-white/70 border border-black/10 shadow-sm">
                          {postcard.qrCodeDataUrl ? (
                            <img
                              src={postcard.qrCodeDataUrl}
                              alt="微信扫码倾听"
                              className="w-14 h-14 object-contain rounded"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-black/10 rounded flex items-center justify-center">
                              <QrCode className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                          <div className="mt-0.5 flex items-center gap-1 text-[9px] font-serif-sc font-medium" style={{ color: currentConfig.accentColor }}>
                            <Volume2 className="w-2.5 h-2.5" />
                            <span>扫码听心声</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Brand Watermark */}
                    {enableBranding && (
                      <div className="mt-3.5 pt-2 border-t border-dashed border-black/10 flex items-center justify-between text-[9px] font-mono-data opacity-50">
                        <span>EMBODIED ECHO · ANTI-ALGORITHM SENSORY LOG</span>
                        <span>350g COTTON PRINT EDITION</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Export Customization Options & Download Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Face Choice Selector */}
              <div>
                <label className="text-xs font-serif-sc text-[#a89e8e] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e6c382]" />
                  <span>下载导出板式</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#18191c] rounded-xl border border-[#2e2d29]">
                  <button
                    type="button"
                    onClick={() => setExportFace('front')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-serif-sc transition-all text-center ${
                      exportFace === 'front'
                        ? 'bg-[#2e2a22] text-[#f2e2be] font-medium shadow-sm border border-[#e6c382]/40'
                        : 'text-[#8e8779] hover:text-[#ded8cb]'
                    }`}
                  >
                    正面 (摄影画)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFace('back')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-serif-sc transition-all text-center ${
                      exportFace === 'back'
                        ? 'bg-[#2e2a22] text-[#f2e2be] font-medium shadow-sm border border-[#e6c382]/40'
                        : 'text-[#8e8779] hover:text-[#ded8cb]'
                    }`}
                  >
                    背面 (笔录声纹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFace('both')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-serif-sc transition-all text-center ${
                      exportFace === 'both'
                        ? 'bg-[#2e2a22] text-[#f2e2be] font-medium shadow-sm border border-[#e6c382]/40'
                        : 'text-[#8e8779] hover:text-[#ded8cb]'
                    }`}
                  >
                    双面冲印拼版
                  </button>
                </div>
              </div>

              {/* Theme Texture Selection */}
              <div>
                <label className="text-xs font-serif-sc text-[#a89e8e] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#e6c382]" />
                  <span>笺纸质感与色调</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(themeConfig) as PostcardTheme[]).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={`px-2 py-1.5 text-xs font-serif-sc rounded-lg border text-left transition-all flex flex-col justify-between ${
                        theme === themeKey
                          ? 'bg-[#29261f] border-[#e6c382] text-[#f2e2be] shadow-sm font-medium'
                          : 'bg-[#1b1c20] border-[#31302d] text-[#8e8779] hover:text-[#d8d2c4] hover:border-[#474540]'
                      }`}
                    >
                      <span className="text-[11px]">{themeConfig[themeKey].label}</span>
                      <span className="text-[9px] font-mono-data opacity-60 mt-0.5">
                        {themeKey}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Filter Selection */}
              <div>
                <label className="text-xs font-serif-sc text-[#a89e8e] mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#e6c382]" />
                  <span>照片胶片滤镜</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'none', label: '原图无滤镜' },
                    { id: 'sepia(0.35) contrast(1.05)', label: '温润暖调' },
                    { id: 'grayscale(1) contrast(1.15)', label: '黑白胶卷' },
                    { id: 'contrast(1.1) saturate(1.2)', label: '鲜活日光' },
                    { id: 'sepia(0.6) brightness(0.95)', label: '复古岁月' },
                    { id: 'hue-rotate(-15deg) contrast(1.05)', label: '日系清冷' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-serif-sc transition-all ${
                        filter === f.id
                          ? 'bg-[#29261f] border-[#e6c382] text-[#f2e2be] font-medium'
                          : 'bg-[#1b1c20] border-[#31302d] text-[#8e8779] hover:text-[#ded8cb]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="text-xs font-serif-sc text-[#a89e8e] mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#e6c382]" />
                  <span>画幅比例 (适配不同社交平台)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'postcard', label: '经典明信片', desc: '小红书 / 微博横图' },
                    { id: 'square', label: '1:1 正方形', desc: '朋友圈 / Instagram' },
                    { id: 'story', label: '9:16 竖版画报', desc: '朋友圈海报 / 快手' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        aspectRatio === ratio.id
                          ? 'bg-[#2a261f] border-[#e6c382] text-[#f0ebd9]'
                          : 'bg-[#1b1c20] border-[#31302d] text-[#878074] hover:text-[#ded8cb]'
                      }`}
                    >
                      <div className="text-xs font-serif-sc font-medium">{ratio.label}</div>
                      <div className="text-[10px] font-mono-data opacity-60 mt-0.5">{ratio.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles for details */}
              <div className="p-3 bg-[#191a1e] border border-[#2b2a26] rounded-xl space-y-2.5">
                <div className="text-xs font-serif-sc text-[#a89e8e] mb-1">细节与纹理开关</div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-serif-sc">
                  <label className="flex items-center gap-2 cursor-pointer text-[#ccc4b5]">
                    <input
                      type="checkbox"
                      checked={enablePaperTexture}
                      onChange={(e) => setEnablePaperTexture(e.target.checked)}
                      className="rounded border-[#444] text-[#e6c382] focus:ring-0 bg-[#222]"
                    />
                    <span>特种棉纸微粒</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#ccc4b5]">
                    <input
                      type="checkbox"
                      checked={enableVignette}
                      onChange={(e) => setEnableVignette(e.target.checked)}
                      className="rounded border-[#444] text-[#e6c382] focus:ring-0 bg-[#222]"
                    />
                    <span>复古暗角光影</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#ccc4b5]">
                    <input
                      type="checkbox"
                      checked={enableStamp}
                      onChange={(e) => setEnableStamp(e.target.checked)}
                      className="rounded border-[#444] text-[#e6c382] focus:ring-0 bg-[#222]"
                    />
                    <span>具身激光邮戳</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#ccc4b5]">
                    <input
                      type="checkbox"
                      checked={enableQR}
                      onChange={(e) => setEnableQR(e.target.checked)}
                      className="rounded border-[#444] text-[#e6c382] focus:ring-0 bg-[#222]"
                    />
                    <span>原声试听二维码</span>
                  </label>
                </div>
              </div>

              {/* Quality & Resolution Selection */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#191a1e] border border-[#2b2a26] rounded-xl text-xs font-serif-sc">
                <span className="text-[#a89e8e]">分辨率缩放：</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setResolutionScale(2.0)}
                    className={`px-2 py-1 rounded text-xs font-mono-data transition-colors ${
                      resolutionScale === 2.0 ? 'bg-[#e6c382] text-black font-bold' : 'text-[#888] hover:text-white'
                    }`}
                  >
                    2.0x (1600px)
                  </button>
                  <button
                    onClick={() => setResolutionScale(2.5)}
                    className={`px-2 py-1 rounded text-xs font-mono-data transition-colors ${
                      resolutionScale === 2.5 ? 'bg-[#e6c382] text-black font-bold' : 'text-[#888] hover:text-white'
                    }`}
                  >
                    2.5x (推荐 2400px)
                  </button>
                  <button
                    onClick={() => setResolutionScale(3.0)}
                    className={`px-2 py-1 rounded text-xs font-mono-data transition-colors ${
                      resolutionScale === 3.0 ? 'bg-[#e6c382] text-black font-bold' : 'text-[#888] hover:text-white'
                    }`}
                  >
                    3.0x (印刷级)
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Download & Copy to Clipboard */}
            <div className="pt-2 space-y-2.5">
              {exportSuccess && (
                <div className="p-2.5 bg-emerald-950/90 border border-emerald-600/50 rounded-xl text-emerald-300 text-xs font-serif-sc flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>已成功生成并下载高清 PNG 图片！欢迎分享到朋友圈或小红书。</span>
                </div>
              )}

              {copySuccess && (
                <div className="p-2.5 bg-amber-950/90 border border-amber-600/50 rounded-xl text-amber-300 text-xs font-serif-sc flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>已将高分辨率截图复制到系统剪贴板！可直接在微信/Slack中 Ctrl+V 粘贴发送。</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-[#252420] hover:bg-[#322f28] active:scale-[0.98] border border-[#524a3c] rounded-xl text-xs font-serif-sc text-[#eed8b4] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  title="直接复制图片数据，可随时在微信聊天框粘贴"
                >
                  <Copy className="w-4 h-4 text-[#e6c382]" />
                  <span>{copySuccess ? '已复制到剪贴板！' : '复制图片到剪贴板'}</span>
                </button>

                <button
                  onClick={handleDownloadScreenshot}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-[#e6c382] hover:bg-[#edd89e] active:scale-[0.98] text-[#141416] rounded-xl text-xs font-serif-sc font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在渲染高清截图...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>下载高清 PNG 图片</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-[10.5px] font-serif-sc text-[#7e7668]">
                💡 导出的 PNG 图片完全保留特种纸肌理与手写排版，手机长按二维码可直接试听原声
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
