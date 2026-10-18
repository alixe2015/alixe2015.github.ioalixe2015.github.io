import React, { useRef, useEffect } from 'react';
import { PostcardEntry } from '../types';
import { drawFingerprintOnCanvas, computeFingerprintMetrics } from '../utils/voiceFingerprintHelper';

interface EmotionFingerprintProps {
  postcard: PostcardEntry;
  size?: number; // width/height in px
  isPlaying?: boolean;
  style?: 'rings' | 'waves' | 'seal';
  showOuterText?: boolean;
  transparentBg?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EmotionFingerprint: React.FC<EmotionFingerprintProps> = ({
  postcard,
  size = 200,
  isPlaying = false,
  style = 'rings',
  showOuterText = true,
  transparentBg = false,
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);
  const energyRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      if (isPlaying) {
        // Smooth rotation when audio is playing
        angleRef.current += 0.006;
        // Oscillating energy swell
        energyRef.current = 0.5 + Math.sin(Date.now() / 240) * 0.45;
      } else {
        // Slow peaceful breathing drift
        angleRef.current += 0.001;
        energyRef.current = 0.1 + Math.sin(Date.now() / 1200) * 0.08;
      }

      drawFingerprintOnCanvas(canvas, postcard, {
        size,
        rotationAngle: angleRef.current,
        liveEnergy: energyRef.current,
        style,
        showOuterText,
        transparentBg
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [postcard, size, isPlaying, style, showOuterText, transparentBg]);

  const metrics = computeFingerprintMetrics(postcard);

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      title={`${postcard.title} · 声音情绪指纹 (${metrics.dimensionName})`}
    >
      <canvas 
        ref={canvasRef} 
        className="rounded-full transition-transform duration-300 group-hover:scale-105"
      />
      {onClick && (
        <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-[#e6c382]/40 transition-colors pointer-events-none" />
      )}
    </div>
  );
};
