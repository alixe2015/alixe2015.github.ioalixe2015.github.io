import React, { useState, useRef, useCallback } from 'react';
import { HandrawStyle } from '../utils/handrawStyles';
import { Sparkles, Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage: string;
  style: HandrawStyle;
  aspectRatio?: string; // 'aspect-[4/3]' etc
  className?: string;
  onExploreStyles?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage,
  style,
  aspectRatio = 'aspect-[4/3]',
  className = '',
  onExploreStyles
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative select-none overflow-hidden rounded-xl border border-[#3b3832] shadow-2xl cursor-ew-resize group ${aspectRatio} ${className}`}
    >
      {/* Handraw Stylized Layer (Base/Right side) */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={originalImage}
          alt="Handraw Art Stylized"
          style={{ filter: style.filterCss }}
          className="w-full h-full object-cover"
        />

        {/* Paper texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: style.paperTextureOverlay,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Subtle vintage vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Style Badge Label (Right) */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-[#e6c382]/40 rounded-lg text-right z-10">
          <div className="flex items-center gap-1.5 justify-end text-[11px] font-serif-sc text-[#f0ebd9]">
            <Sparkles className="w-3 h-3 text-[#e6c382]" />
            <span>{style.name}</span>
            <span className="font-mono-data text-[10px] text-[#e6c382]">{style.code}</span>
          </div>
          <span className="text-[9px] text-[#a69e90] font-serif-sc block">
            {style.paperType.split(' ')[1] || '特种棉纸印制'}
          </span>
        </div>
      </div>

      {/* Original Image Layer (Clipped to Slider Left) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div 
          className="relative w-full h-full"
          style={{ width: containerRef.current?.clientWidth || '100%' }}
        >
          <img
            src={originalImage}
            alt="Original Photo"
            className="w-full h-full object-cover"
            style={{ 
              width: containerRef.current?.clientWidth || '100%',
              maxWidth: 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Original Label (Left) */}
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/65 backdrop-blur-md border border-white/10 rounded text-[10px] font-serif-sc text-[#ded8cb] z-10">
            日常实拍原照 (Original)
          </div>
        </div>
      </div>

      {/* Center Drag Divider Line */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Center circular drag handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1b1c20] border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-mono-data">
          <span className="text-[10px] text-[#e6c382]">◀▶</span>
        </div>
      </div>

      {/* Top hint bar */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-serif-sc text-[#ded8cb] pointer-events-none z-10">
        <span className="px-2 py-0.5 bg-black/60 rounded backdrop-blur-sm">
          拖动滑块查看对比
        </span>
        {onExploreStyles && (
          <span className="px-2 py-0.5 bg-black/60 rounded backdrop-blur-sm text-[#e6c382] pointer-events-auto cursor-pointer">
            点击切换手绘风格 →
          </span>
        )}
      </div>
    </div>
  );
};
