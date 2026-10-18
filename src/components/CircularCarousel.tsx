import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PostcardEntry } from '../types';
import { 
  Sparkles, 
  Volume2, 
  VolumeX,
  Play, 
  Pause,
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Eye, 
  Compass, 
  Disc3, 
  MapPin, 
  Calendar,
  Share2,
  Maximize2,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CircularCarouselProps {
  postcards: PostcardEntry[];
  onSelectPostcard: (postcard: PostcardEntry) => void;
  onOpenListenRoom: (postcard: PostcardEntry) => void;
  onOpenShop?: () => void;
  onOpenCreate?: () => void;
}

type CarouselMode = 'cylinder' | 'orbit' | 'panorama';

export const CircularCarousel: React.FC<CircularCarouselProps> = ({
  postcards,
  onSelectPostcard,
  onOpenListenRoom,
  onOpenShop,
  onOpenCreate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [carouselMode, setCarouselMode] = useState<CarouselMode>('cylinder');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  // Drag physics refs
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    currentX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    animId: 0,
  });

  const cardsCount = postcards.length;
  const angleStep = 360 / Math.max(cardsCount, 1);

  // Dynamic geometry parameters based on mode
  const getRadius = () => {
    switch (carouselMode) {
      case 'panorama':
        return 720;
      case 'orbit':
        return 560;
      case 'cylinder':
      default:
        return 580;
    }
  };

  const radius = getRadius();

  // Normalize angle to [-180, 180]
  const normalizeAngle = (angle: number) => {
    let a = angle % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
  };

  // Find nearest index to front (angle closest to 0)
  const calculateActiveIndex = useCallback(
    (currentRot: number) => {
      let minDiff = Infinity;
      let closestIdx = 0;
      for (let i = 0; i < cardsCount; i++) {
        const itemAngle = normalizeAngle(i * angleStep + currentRot);
        const diff = Math.abs(itemAngle);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return closestIdx;
    },
    [cardsCount, angleStep]
  );

  // Snap to specific index
  const snapToIndex = useCallback(
    (index: number) => {
      const targetAngle = -index * angleStep;
      // Find shortest rotation path
      setRotation((prev) => {
        const currentNorm = prev % 360;
        let delta = targetAngle - currentNorm;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return prev + delta;
      });
      setActiveIndex(index);
    },
    [angleStep]
  );

  // Inertia animation loop
  const stopInertia = () => {
    if (dragRef.current.animId) {
      cancelAnimationFrame(dragRef.current.animId);
      dragRef.current.animId = 0;
    }
  };

  const startInertia = () => {
    stopInertia();
    const friction = 0.92;
    const minVelocity = 0.04;

    const step = () => {
      dragRef.current.velocity *= friction;
      if (Math.abs(dragRef.current.velocity) > minVelocity) {
        setRotation((prev) => {
          const next = prev + dragRef.current.velocity;
          setActiveIndex(calculateActiveIndex(next));
          return next;
        });
        dragRef.current.animId = requestAnimationFrame(step);
      } else {
        // Snap to nearest card upon stopping
        setRotation((curr) => {
          const nearest = calculateActiveIndex(curr);
          setActiveIndex(nearest);
          const target = -nearest * angleStep;
          let delta = target - (curr % 360);
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          return curr + delta * 0.35; // gentle settle
        });
      }
    };
    dragRef.current.animId = requestAnimationFrame(step);
  };

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    stopInertia();
    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastTime = performance.now();
    dragRef.current.velocity = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDown) return;
    const now = performance.now();
    const deltaX = e.clientX - dragRef.current.lastX;
    const deltaTime = Math.max(now - dragRef.current.lastTime, 1);

    // Calculate rotation sensitivity
    const sensitivity = 0.32;
    const rotDelta = deltaX * sensitivity;

    dragRef.current.velocity = (rotDelta / deltaTime) * 16;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastTime = now;

    setRotation((prev) => {
      const next = prev + rotDelta;
      setActiveIndex(calculateActiveIndex(next));
      return next;
    });
  };

  const handlePointerUp = () => {
    if (!dragRef.current.isDown) return;
    dragRef.current.isDown = false;
    setIsDragging(false);
    startInertia();
  };

  // Mouse wheel scroll support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    stopInertia();
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const rotDelta = -delta * 0.15;
    setRotation((prev) => {
      const next = prev + rotDelta;
      setActiveIndex(calculateActiveIndex(next));
      return next;
    });
  };

  // Autoplay loop
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => {
        const next = prev - 0.12; // slow ambient rotation
        setActiveIndex(calculateActiveIndex(next));
        return next;
      });
    }, 24);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isDragging, calculateActiveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        snapToIndex((activeIndex - 1 + cardsCount) % cardsCount);
      } else if (e.key === 'ArrowRight') {
        snapToIndex((activeIndex + 1) % cardsCount);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, cardsCount, snapToIndex]);

  // Audio simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 4;
        });
      }, 250);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const activePostcard = postcards[activeIndex] || postcards[0];

  return (
    <div 
      className="relative w-full rounded-3xl bg-[#090a0d] border border-[#23242b] overflow-hidden shadow-2xl select-none flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 min-h-[760px] lg:min-h-[820px]"
      onWheel={handleWheel}
    >
      {/* Background Ambient Radial Highlights */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Header & Interactive Mode Bar */}
      <div className="relative z-30 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-5xl mx-auto border-b border-[#1f2027] pb-5">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono-data text-[#d4af37] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REACTBITS 3D CIRCULAR CAROUSEL · 具身环形视界</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-sc font-bold text-[#f5efe6] tracking-tight">
            在立体的时空环中，凝视你的记忆切片
          </h2>
          <p className="text-xs text-[#9c9484] font-serif-sc">
            拖拽或滑动旋转 3D 环形胶卷；点击任意卡片即可对齐聚焦，倾听真实心潮
          </p>
        </div>

        {/* Carousel Mode Selector & Autoplay Toggle */}
        <div className="flex items-center gap-2 shrink-0 bg-[#14151a] p-1.5 rounded-xl border border-[#2c2d38]">
          <button
            onClick={() => setCarouselMode('cylinder')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-lg transition-all flex items-center gap-1.5 ${
              carouselMode === 'cylinder'
                ? 'bg-[#e6c382] text-[#141416] font-semibold shadow-sm'
                : 'text-[#9c9586] hover:text-[#ded8cb]'
            }`}
            title="3D 圆柱环形"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>圆柱环</span>
          </button>

          <button
            onClick={() => setCarouselMode('orbit')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-lg transition-all flex items-center gap-1.5 ${
              carouselMode === 'orbit'
                ? 'bg-[#e6c382] text-[#141416] font-semibold shadow-sm'
                : 'text-[#9c9586] hover:text-[#ded8cb]'
            }`}
            title="倾角星轨环"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>星轨环</span>
          </button>

          <button
            onClick={() => setCarouselMode('panorama')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-lg transition-all flex items-center gap-1.5 ${
              carouselMode === 'panorama'
                ? 'bg-[#e6c382] text-[#141416] font-semibold shadow-sm'
                : 'text-[#9c9586] hover:text-[#ded8cb]'
            }`}
            title="全景弧面"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全景弧</span>
          </button>

          <div className="w-[1px] h-4 bg-[#2f313c] mx-1" />

          {/* Autoplay Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isAutoPlaying ? 'text-[#e6c382] bg-amber-500/10' : 'text-[#736e63] hover:text-[#b0a99c]'
            }`}
            title={isAutoPlaying ? '暂停自动巡航' : '开启自动漫游'}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3D Circular Carousel Stage */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[1100px] overflow-hidden my-auto"
        style={{ perspectiveOrigin: '50% 50%' }}
      >
        {/* Central Portrait of Mindful Human (Fixed anatomical hands holding postcard!) */}
        <div 
          className="absolute z-10 w-52 sm:w-64 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl pointer-events-none transition-transform duration-500 border border-[#40382d]/40"
          style={{
            transform: `translateZ(-60px) scale(0.95)`,
          }}
        >
          <img
            src="/src/assets/images/embodied_person_real_1792154169240.jpg"
            alt="窗边凝视明信片的具身者"
            className="w-full h-full object-cover object-top"
          />
          {/* Subtle vignette and ambient shading */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-[#090a0d]/20" />
          
          <div className="absolute bottom-3 left-3 right-3 text-center">
            <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#d4af37] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#d4af37]/30">
              具身之锚 · 触碰真实温差
            </span>
          </div>
        </div>

        {/* 3D Ring Rotating Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: carouselMode === 'orbit' 
              ? `rotateX(14deg) rotateY(${rotation}deg)` 
              : carouselMode === 'panorama'
              ? `rotateX(-3deg) rotateY(${rotation}deg)`
              : `rotateY(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {postcards.map((card, idx) => {
            const cardAngle = idx * angleStep;
            const currentItemAngle = normalizeAngle(cardAngle + rotation);
            const distFromFront = Math.abs(currentItemAngle);
            const isFront = idx === activeIndex;

            // Compute depth factor for opacity, scale and curved lighting
            const normalizedDist = Math.min(distFromFront / 180, 1);
            const opacity = Math.max(1 - normalizedDist * 0.72, 0.22);
            const scale = isFront ? 1.08 : Math.max(1 - normalizedDist * 0.28, 0.75);
            const zIndex = Math.round(100 - normalizedDist * 50);

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  snapToIndex(idx);
                }}
                className={`absolute w-44 sm:w-56 h-60 sm:h-72 rounded-2xl cursor-pointer transition-shadow duration-300 ${
                  isFront 
                    ? 'ring-2 ring-[#e6c382] shadow-[0_0_35px_rgba(230,195,130,0.35)]' 
                    : 'hover:ring-1 hover:ring-white/30'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                {/* 3D Card Content (Bendable style curvature shading) */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#18191f] border border-[#30323c] group shadow-2xl flex flex-col justify-between">
                  {/* Card Image */}
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Cylindrical Edge Gradient for 3D curved feel */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badge: Date & Mood */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono-data bg-black/60 backdrop-blur-md text-[#dcd7cb] px-2 py-0.5 rounded-md border border-white/10">
                      {card.date.slice(5)}
                    </span>
                    <span className="text-[10px] font-serif-sc bg-[#d4af37]/20 backdrop-blur-md text-[#f5e6c8] px-2 py-0.5 rounded-md border border-[#d4af37]/30">
                      {card.moodTag}
                    </span>
                  </div>

                  {/* Bottom Info & Audio Wave Snapshot */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1.5">
                    <h3 className="text-xs font-serif-sc font-bold text-[#f5f0e6] truncate">
                      {card.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-[#9c9586] font-mono-data">
                      <span className="truncate max-w-[110px]">{card.location}</span>
                      <span className="text-[#e6c382] flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {card.audioDuration}s
                      </span>
                    </div>

                    {/* Miniature wave bars */}
                    <div className="flex items-center gap-0.5 h-3 pt-0.5">
                      {(card.audioWaveformData || [20, 40, 60, 80, 50, 30, 70, 90, 40]).slice(0, 12).map((val, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex-1 bg-[#d4af37]/60 rounded-full"
                          style={{ height: `${Math.max((val / 100) * 12, 3)}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Front Spotlight Glow */}
                  {isFront && (
                    <div className="absolute inset-0 ring-2 ring-[#e6c382] rounded-2xl pointer-events-none" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Spotlight Active Card Inspector & Quick Triggers */}
      <div className="relative z-30 w-full max-w-4xl mx-auto bg-[#131418]/95 backdrop-blur-md border border-[#2b2d38] rounded-2xl p-4 sm:p-5 mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Card Meta & Title */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                切片 #{activeIndex + 1} / {cardsCount}
              </span>
              <span className="text-xs font-mono-data text-[#8a8477]">
                {activePostcard.date} {activePostcard.time}
              </span>
              <span className="text-xs font-serif-sc text-[#c2baa9] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#d4af37]" />
                {activePostcard.location}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif-sc font-bold text-[#ede8de]">
              {activePostcard.title}
            </h3>
            <p className="text-xs text-[#9d9688] font-serif-sc line-clamp-1">
              {activePostcard.reflectionText}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Audio Wave Play Button */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`px-3 py-2 text-xs font-serif-sc rounded-xl border transition-all flex items-center gap-2 ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-[#e6c382] border-amber-500/40 animate-pulse'
                  : 'bg-[#1e1f26] hover:bg-[#282a33] text-[#ded8cb] border-[#383a45]'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? '正在播放心潮' : '试听原声'}</span>
              <span className="text-[10px] font-mono-data text-[#d4af37]">{activePostcard.audioDuration}s</span>
            </button>

            {/* Inspect / Open Postcard Stage */}
            <button
              onClick={() => onSelectPostcard(activePostcard)}
              className="px-4 py-2 text-xs font-serif-sc font-medium bg-[#e6c382] hover:bg-[#edd29b] text-[#141416] rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>翻转双面明信片</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Audio Progress Bar (if playing) */}
        {isPlayingAudio && (
          <div className="w-full bg-[#1e1f26] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#d4af37] to-[#e6c382] h-full transition-all duration-200"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        )}

        {/* Carousel Prev/Next & Quick Jump Thumbnails */}
        <div className="flex items-center justify-between border-t border-[#23242c] pt-3 text-xs text-[#8a8477]">
          {/* Thumbnails row */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-md scrollbar-none">
            {postcards.map((p, pIdx) => (
              <button
                key={p.id}
                onClick={() => snapToIndex(pIdx)}
                className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border transition-all ${
                  pIdx === activeIndex 
                    ? 'border-[#e6c382] scale-105 shadow-sm' 
                    : 'border-white/10 opacity-50 hover:opacity-90'
                }`}
                title={p.title}
              >
                <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Steppers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => snapToIndex((activeIndex - 1 + cardsCount) % cardsCount)}
              className="p-2 bg-[#1b1c22] hover:bg-[#262832] border border-[#30333e] rounded-lg text-[#ded8cb] transition-colors"
              title="上一张 (← 键盘左键)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => snapToIndex((activeIndex + 1) % cardsCount)}
              className="p-2 bg-[#1b1c22] hover:bg-[#262832] border border-[#30333e] rounded-lg text-[#ded8cb] transition-colors"
              title="下一张 (→ 键盘右键)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
