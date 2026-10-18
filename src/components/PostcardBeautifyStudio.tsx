import React, { useState } from 'react';
import { PostcardEntry } from '../types';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Download, 
  Check, 
  Layers, 
  Sun, 
  Eye, 
  RotateCcw,
  Palette,
  Brush,
  Camera,
  Info
} from 'lucide-react';
import { HANDRAW_STYLES, HandrawStyle } from '../utils/handrawStyles';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface FilterPreset {
  id: string;
  name: string;
  desc: string;
  filterStyle: string;
  vignette: number;
  contrast: number;
  brightness: number;
  temperature: number; // -10 (cool) to 10 (warm)
}

const PRESET_FILTERS: FilterPreset[] = [
  {
    id: 'original',
    name: '原色写实',
    desc: '保留相机原生态未经修饰的日常质感',
    filterStyle: 'none',
    vignette: 0,
    contrast: 100,
    brightness: 100,
    temperature: 0,
  },
  {
    id: 'fuji-classic',
    name: '富士胶片',
    desc: '温润微青的绿色调、怀旧颗粒感与经典胶片反差',
    filterStyle: 'sepia(12%) saturate(115%) contrast(105%) brightness(102%)',
    vignette: 15,
    contrast: 108,
    brightness: 102,
    temperature: 4,
  },
  {
    id: 'darkroom-bw',
    name: '暗房银盐',
    desc: '经典徕卡黑白高反差，剔除杂色直击画面骨骼',
    filterStyle: 'grayscale(100%) contrast(125%) brightness(96%)',
    vignette: 25,
    contrast: 125,
    brightness: 96,
    temperature: 0,
  },
  {
    id: 'amber-sunset',
    name: '琥珀余晖',
    desc: '深秋黄昏的漫射金光，为普通快照披上一层诗意',
    filterStyle: 'sepia(30%) saturate(125%) hue-rotate(-8deg) contrast(106%)',
    vignette: 20,
    contrast: 106,
    brightness: 104,
    temperature: 8,
  },
  {
    id: 'morning-mist',
    name: '晨曦柔光',
    desc: '日系柔焦清透，阴影提亮，带来静谧的呼吸感',
    filterStyle: 'brightness(108%) contrast(92%) saturate(95%)',
    vignette: 10,
    contrast: 92,
    brightness: 108,
    temperature: 1,
  },
  {
    id: 'cinematic-dusk',
    name: '暮色电影蓝',
    desc: '冷冽青蓝阴影搭配暖光点缀，王家卫式的孤岛情绪',
    filterStyle: 'hue-rotate(185deg) saturate(110%) contrast(110%) brightness(95%)',
    vignette: 30,
    contrast: 110,
    brightness: 95,
    temperature: -6,
  },
];

interface PostcardBeautifyStudioProps {
  postcard: PostcardEntry;
  isOpen: boolean;
  onClose: () => void;
  onApplyPhotoFilter: (filterStyle: string) => void;
}

export const PostcardBeautifyStudio: React.FC<PostcardBeautifyStudioProps> = ({
  postcard,
  isOpen,
  onClose,
  onApplyPhotoFilter,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'handraw' | 'filters'>('handraw');
  const [selectedHandraw, setSelectedHandraw] = useState<HandrawStyle>(HANDRAW_STYLES[0]);
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(PRESET_FILTERS[1]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute active CSS filter depending on active tab
  const currentFilterCss = activeTab === 'handraw' ? selectedHandraw.filterCss : selectedFilter.filterStyle;

  const handleApply = () => {
    onApplyPhotoFilter(currentFilterCss);
    onClose();
  };

  // HD Export with filter applied
  const handleExportBeautified = () => {
    setIsExporting(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card background
    ctx.fillStyle = postcard.theme === 'darkroom' ? '#141416' : '#f8f5ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame
    ctx.strokeStyle = postcard.theme === 'darkroom' ? '#2e2c26' : '#ded5c5';
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = postcard.imageUrl;
    img.onload = () => {
      // Apply canvas filter
      if (activeTab === 'handraw') {
        ctx.filter = selectedHandraw.canvasFilter;
      } else {
        if (selectedFilter.id === 'darkroom-bw') {
          ctx.filter = 'grayscale(100%) contrast(125%)';
        } else if (selectedFilter.id === 'amber-sunset') {
          ctx.filter = 'sepia(30%) saturate(125%) contrast(106%)';
        } else if (selectedFilter.id === 'fuji-classic') {
          ctx.filter = 'sepia(15%) saturate(115%) contrast(105%)';
        } else {
          ctx.filter = 'none';
        }
      }

      // Draw photo
      ctx.drawImage(img, 80, 80, 1240, 960);
      ctx.filter = 'none';

      // Typography
      ctx.fillStyle = postcard.theme === 'darkroom' ? '#f0ebd9' : '#2a241e';
      ctx.font = 'bold 50px "Noto Serif SC", serif';
      ctx.fillText(postcard.title, 90, 1120);

      ctx.fillStyle = postcard.theme === 'darkroom' ? '#9c9384' : '#6e6356';
      ctx.font = '28px "Noto Serif SC", serif';
      const styleLabel = activeTab === 'handraw' ? `手绘重构【${selectedHandraw.name}】` : `滤镜【${selectedFilter.name}】`;
      ctx.fillText(`${postcard.date} · ${postcard.location} · ${styleLabel}`, 90, 1180);

      // Reflection
      ctx.font = '32px "Noto Serif SC", serif';
      const lines = [
        postcard.reflectionText.slice(0, 32),
        postcard.reflectionText.slice(32, 64),
      ];
      lines.forEach((line, idx) => {
        if (line) ctx.fillText(line, 90, 1260 + idx * 50);
      });

      // QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = postcard.qrCodeDataUrl || '';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 1060, 1460, 240, 240);
        ctx.font = '22px "Noto Serif SC", serif';
        ctx.fillStyle = postcard.theme === 'darkroom' ? '#9c9384' : '#6e6356';
        ctx.fillText('扫码倾听原声回响', 1080, 1735);

        const link = document.createElement('a');
        link.download = `具身美化明信片-${postcard.date}-${activeTab === 'handraw' ? selectedHandraw.id : selectedFilter.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsExporting(false);
      };
      qrImg.onerror = () => {
        const link = document.createElement('a');
        link.download = `具身美化明信片-${postcard.date}.png`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#141517] border border-[#33312c] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <Sparkles className="w-4 h-4 text-[#e6c382]" />
            <span>生活切片美化工坊 · 手绘艺术重构与暗房光影</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#201f1c] bg-[#131417] text-xs font-serif-sc">
          <button
            onClick={() => setActiveTab('handraw')}
            className={`flex-1 py-3 text-center transition-colors relative flex items-center justify-center gap-2 ${
              activeTab === 'handraw' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8577] hover:text-[#ded8cb]'
            }`}
          >
            <Brush className="w-3.5 h-3.5 text-[#e6c382]" />
            <span>手绘艺术风格 (yang0/handraw-style 编号画廊)</span>
            <span className="px-1.5 py-0.2 rounded bg-[#e6c382]/20 text-[#e6c382] font-mono-data text-[10px] border border-[#e6c382]/40">
              NEW
            </span>
            {activeTab === 'handraw' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e6c382]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-3 text-center transition-colors relative flex items-center justify-center gap-2 ${
              activeTab === 'filters' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8577] hover:text-[#ded8cb]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 opacity-80" />
            <span>经典暗房光影调色 (Darkroom Filters)</span>
            {activeTab === 'filters' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e6c382]" />
            )}
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[76vh] overflow-y-auto">
          {/* TAB 1: Handraw Art Styles with Before/After Slider */}
          {activeTab === 'handraw' ? (
            <div className="space-y-6">
              {/* Interactive Before/After Split Comparison Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc text-[#9c9485]">
                  <span className="flex items-center gap-1.5 text-[#ede8de]">
                    <Sliders className="w-3.5 h-3.5 text-[#e6c382]" />
                    <span>左右拖动中轴，对比原片与【{selectedHandraw.name}】艺术手绘效果：</span>
                  </span>
                  <span className="font-mono-data text-[#d4af37] text-[11px]">
                    STYLE CODE: {selectedHandraw.code}
                  </span>
                </div>

                <BeforeAfterSlider
                  originalImage={postcard.imageUrl}
                  style={selectedHandraw}
                  aspectRatio="aspect-[16/10]"
                  className="max-w-2xl mx-auto"
                />
              </div>

              {/* Handraw Style Selection Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc text-[#c7bead]">
                  <span className="font-medium">精选 6 大标志性手绘艺术谱系（提取日常照片杂质，提炼艺术肌理）：</span>
                  <span className="text-[10px] text-[#8a8376] font-mono-data">278 STYLES CATALOG</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {HANDRAW_STYLES.map((style) => {
                    const isSelected = selectedHandraw.id === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedHandraw(style)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#e6c382] bg-[#221f1a] text-[#f0ebd9] shadow-lg ring-1 ring-[#e6c382]/30'
                            : 'border-[#2d2a24] bg-[#16171a] text-[#8c8475] hover:text-[#ded8cb] hover:border-[#423d34]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-black/40 text-[#e6c382] border border-white/5">
                              {style.code}
                            </span>
                            <span className="text-[10px] text-[#c99b53] font-serif-sc">
                              {style.badge}
                            </span>
                          </div>
                          <div className="text-xs font-serif-sc font-medium text-[#ede8de] mt-1">
                            {style.name}
                          </div>
                          <p className="text-[10px] font-serif-sc opacity-70 mt-1 line-clamp-2 leading-relaxed">
                            {style.tagline}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-white/5 text-[9px] font-serif-sc text-[#a69e90] truncate">
                          📄 {style.paperType.split(' ')[1] || '特种纸'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style Feature & Print Upgrade Value Card */}
              <div className="p-4 bg-[#191a1e] border border-[#2e2d27] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-serif-sc">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#e6c382] font-medium">
                    <Brush className="w-3.5 h-3.5" />
                    <span>实体冲印专属适配 · {selectedHandraw.paperType}</span>
                  </div>
                  <p className="text-[11px] text-[#9c9586] leading-relaxed max-w-xl">
                    {selectedHandraw.desc} 实体下单时选用该风格，可完美还原水彩与墨色在纯棉纤维上的凹凸触感。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Classic Filters */
            <div className="space-y-6">
              {/* Top Preview Canvas */}
              <div className="relative aspect-[16/10] w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#38342d] bg-black/40">
                <img
                  src={postcard.imageUrl}
                  alt="美化预览"
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{
                    filter: selectedFilter.filterStyle,
                  }}
                />

                {/* Vignette Overlay */}
                {selectedFilter.vignette > 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, transparent 55%, rgba(0, 0, 0, ${selectedFilter.vignette / 100}) 100%)`,
                    }}
                  />
                )}

                {/* Subtle Tag Overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[11px] font-serif-sc text-[#e6c382] border border-white/10">
                  当前滤镜：{selectedFilter.name}
                </div>
              </div>

              {/* Preset Filters Grid */}
              <div>
                <label className="block text-xs font-serif-sc text-[#c7bead] mb-2 font-medium">
                  精选胶片与光影美化预设（为随手拍注入艺术灵魂）：
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_FILTERS.map((preset) => {
                    const isActive = selectedFilter.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedFilter(preset)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'border-[#e6c382] bg-[#221f1a] text-[#f0ebd9] shadow-md'
                            : 'border-[#2d2a24] bg-[#16171a] text-[#8c8475] hover:text-[#ded8cb]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-serif-sc font-medium">{preset.name}</span>
                          {isActive && <Check className="w-3.5 h-3.5 text-[#e6c382]" />}
                        </div>
                        <p className="text-[10px] font-serif-sc opacity-70 leading-snug line-clamp-2">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="pt-3 border-t border-[#242321] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportBeautified}
              disabled={isExporting}
              className="px-4 py-2 bg-[#252422] hover:bg-[#302e29] border border-[#423d34] text-[#f0ebd9] rounded-lg text-xs font-serif-sc transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '生成中...' : `导出【${activeTab === 'handraw' ? selectedHandraw.name : selectedFilter.name}】高清明信片`}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-serif-sc text-[#8c8475] hover:text-[#ded8cb]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-[#e6c382] hover:bg-[#ebd29b] active:scale-[0.98] text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>应用{activeTab === 'handraw' ? '手绘风格' : '调色质感'}到明信片</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
