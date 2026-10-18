import React, { useState, useRef, useEffect } from 'react';
import { PostcardEntry } from '../types';
import { 
  Sparkles, 
  Volume2, 
  RotateCw, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Disc3, 
  MapPin, 
  Headphones 
} from 'lucide-react';

interface HeroOrbitViewProps {
  postcards: PostcardEntry[];
  onSelectPostcard: (postcard: PostcardEntry) => void;
  onOpenListenRoom: (postcard: PostcardEntry) => void;
  onOpenCreate: () => void;
  onGoToArchive: () => void;
}

export const HeroOrbitView: React.FC<HeroOrbitViewProps> = ({
  postcards,
  onSelectPostcard,
  onOpenListenRoom,
  onOpenCreate,
  onGoToArchive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Subtle interactive parallax effect based on mouse coordinate
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredCardId(null);
  };

  // Card orbit coordinates around the center figure (6 positions)
  // [xPercent, yPercent, rotateDeg, scale, depthClass, zIndex]
  const orbitCoordinates = [
    { x: -38, y: -22, rot: -14, z: 30, anim: 'animate-float-slow', delay: '0s' },
    { x: 38, y: -24, rot: 12, z: 28, anim: 'animate-float-reverse', delay: '1s' },
    { x: -44, y: 16, rot: -18, z: 35, anim: 'animate-float-reverse', delay: '2s' },
    { x: 42, y: 14, rot: 16, z: 32, anim: 'animate-float-slow', delay: '1.5s' },
    { x: -18, y: -38, rot: -6, z: 20, anim: 'animate-float-slow', delay: '0.5s' },
    { x: 22, y: -36, rot: 8, z: 22, anim: 'animate-float-reverse', delay: '2.5s' },
  ];

  const displayCards = postcards.slice(0, 6);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[720px] lg:min-h-[780px] bg-[#090a0c] overflow-hidden rounded-3xl border border-[#202126] flex flex-col items-center justify-between p-6 sm:p-10 select-none"
    >
      {/* Cinematic Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-20 text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-data text-[#d4af37] tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EMBODIED ECHO · 具身之镜</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif-sc font-bold tracking-tight text-[#f5f0e6] leading-tight">
          在数字虚空中，<br />
          无数生活切片正环绕着你
        </h1>

        <p className="text-xs sm:text-sm font-serif-sc text-[#9c9586] max-w-xl mx-auto leading-relaxed">
          AI 能够总结一万份数据，却替你触碰不到手心的温度与微颤的声音。
          挪动光标探索环绕照片，点击进入明信片，倾听这一年的心绪回响。
        </p>
      </div>

      {/* Center 3D Orbit Stage */}
      <div className="relative w-full max-w-4xl h-[460px] sm:h-[520px] flex items-center justify-center perspective-1200 my-auto">
        {/* Central Person Portrait */}
        <div 
          className="relative z-10 w-64 sm:w-80 h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0px) scale(${hoveredCardId ? 0.96 : 1})`,
          }}
        >
          <img
            src="/src/assets/images/embodied_person_real_1792154169240.jpg"
            alt="深思中的具身者"
            className="w-full h-full object-cover object-top"
          />
          {/* Subtle bottom & edge gradient fade for seamless integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0c] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 ring-1 ring-white/10 rounded-2xl" />

          {/* Glowing Aura Ring behind center person */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-amber-500/15 to-purple-500/10 blur-xl -z-10 rounded-full" />
        </div>

        {/* Floating Orbiting Memory Cards */}
        {displayCards.map((card, idx) => {
          const coord = orbitCoordinates[idx % orbitCoordinates.length];
          const isHovered = hoveredCardId === card.id;

          // Compute parallax displacement
          const parallaxX = mousePos.x * (idx % 2 === 0 ? 32 : -32);
          const parallaxY = mousePos.y * (idx % 2 === 0 ? 24 : -24);

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => onSelectPostcard(card)}
              className={`absolute cursor-pointer transition-all duration-300 ease-out group ${coord.anim}`}
              style={{
                left: `calc(50% + ${coord.x}% + ${parallaxX}px)`,
                top: `calc(50% + ${coord.y}% + ${parallaxY}px)`,
                transform: `translate(-50%, -50%) rotate(${coord.rot + mousePos.x * 10}deg) scale(${isHovered ? 1.18 : 1})`,
                zIndex: isHovered ? 50 : coord.z,
                animationDelay: coord.delay,
              }}
            >
              {/* Glass Frame Card */}
              <div className="relative w-36 sm:w-48 aspect-[4/3] rounded-xl overflow-hidden glass-card-glow border border-white/20 bg-black/60 backdrop-blur-md transition-all group-hover:border-[#e6c382] group-hover:shadow-[0_0_25px_rgba(230,195,130,0.35)]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle Glass Reflection Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/10 pointer-events-none" />

                {/* Cyber-Warm Neon Dot Accent (Inspired by reference image) */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>

                {/* Info Overlay on Hover/Focus */}
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 bg-black/75 backdrop-blur-sm border-t border-white/10 flex flex-col justify-end">
                  <span className="text-[10px] font-mono-data text-[#d4af37] tracking-wider truncate">
                    {card.date.slice(5)} · {card.moodTag}
                  </span>
                  <span className="text-xs font-serif-sc font-medium text-white truncate">
                    {card.title}
                  </span>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#bcb5a7] font-serif-sc">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5 text-[#e6c382]" />
                      <span>{card.audioDuration}s 原声</span>
                    </span>
                    <span className="text-[#e6c382] group-hover:underline flex items-center">
                      倾听
                      <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Command Toolbar */}
      <div className="relative z-20 w-full max-w-2xl mx-auto pt-4 border-t border-[#222328] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-serif-sc text-[#8c8475]">
          <span className="flex items-center gap-1.5 text-[#e6c382]">
            <Disc3 className="w-3.5 h-3.5" />
            <span>已入轨 {postcards.length} 张生活切片</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>点击环绕照片开启 3D 正反双面明信片</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectPostcard(postcards[0])}
            className="px-3.5 py-1.5 text-xs font-serif-sc text-[#e0dad0] bg-[#1a1b1e] hover:bg-[#25262b] border border-[#34353d] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>翻阅今日明信片</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-1.5 text-xs font-serif-sc font-medium text-[#141416] bg-[#e6c382] hover:bg-[#ebd29b] active:scale-[0.98] rounded-lg transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>晒一张今日切片</span>
          </button>
        </div>
      </div>
    </div>
  );
};
