import React, { useState, useEffect, useRef } from 'react';
import { PostcardEntry } from '../types';
import { Play, Pause, SkipForward, SkipBack, Disc3, Volume2, Sparkles, MapPin, Calendar, Fingerprint, Image as ImageIcon, Stamp } from 'lucide-react';
import { ambientPlayer } from '../utils/audioSynth';
import { EmotionFingerprint } from './EmotionFingerprint';
import { VoiceFingerprintModal } from './VoiceFingerprintModal';
import { computeFingerprintMetrics } from '../utils/voiceFingerprintHelper';

interface VoiceReelViewProps {
  entries: PostcardEntry[];
  onSelectEntry: (entry: PostcardEntry) => void;
  onUpdatePostcard?: (updated: PostcardEntry) => void;
}

export const VoiceReelView: React.FC<VoiceReelViewProps> = ({
  entries,
  onSelectEntry,
  onUpdatePostcard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [visualMode, setVisualMode] = useState<'photo' | 'fingerprint'>('fingerprint');
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);

  const activeEntry = entries[currentIndex] || entries[0];
  const totalDuration = activeEntry?.audioDuration || 20;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ambientPlayer.stop();
    };
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    ambientPlayer.playAmbient('warmth', totalDuration);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev >= totalDuration) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    ambientPlayer.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) handlePause();
    else handlePlay();
  };

  const handleNext = () => {
    handlePause();
    setCurrentSeconds(0);
    setCurrentIndex((prev) => (prev + 1) % entries.length);
  };

  const handlePrev = () => {
    handlePause();
    setCurrentSeconds(0);
    setCurrentIndex((prev) => (prev - 1 + entries.length) % entries.length);
  };

  if (!activeEntry) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="border-b border-[#242321] pb-5">
        <span className="text-xs font-mono-data text-[#d4af37] tracking-wider uppercase">
          CONTINUOUS VOICE REEL · 人生原声磁带
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif-sc font-semibold text-[#f0ebe1] mt-1">
          声音胶卷 · 聆听一整年的心声流转
        </h2>
        <p className="text-xs text-[#8c8475] font-serif-sc mt-1">
          闭上眼睛，像倒放一卷老磁带一样，听听过去数月里自己声音语调、呼吸与心跳的微妙流转
        </p>
      </div>

      {/* Main Vinyl Record & Photo Layout */}
      <div className="bg-[#141517] border border-[#2b2a26] rounded-2xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual Showcase: Switchable Photo or Emotion Fingerprint */}
        <div className="space-y-3">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between text-xs font-serif-sc">
            <span className="text-[#8c8475] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>视觉呈现形态</span>
            </span>

            <div className="flex items-center gap-1 p-0.5 bg-[#1b1c20] rounded-lg border border-white/5">
              <button
                onClick={() => setVisualMode('photo')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 ${
                  visualMode === 'photo'
                    ? 'bg-[#292721] text-[#e6c382] font-medium shadow-sm'
                    : 'text-[#8c8577] hover:text-[#ded8cb]'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>明信片</span>
              </button>
              <button
                onClick={() => setVisualMode('fingerprint')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 ${
                  visualMode === 'fingerprint'
                    ? 'bg-[#292721] text-[#e6c382] font-medium shadow-sm'
                    : 'text-[#8c8577] hover:text-[#ded8cb]'
                }`}
              >
                <Fingerprint className="w-3 h-3" />
                <span>情绪指纹</span>
              </button>
            </div>
          </div>

          {visualMode === 'photo' ? (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-[#38342d] group">
              <img
                src={activeEntry.imageUrl}
                alt={activeEntry.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-mono-data text-[#d4af37]">
                  {activeEntry.date} · {activeEntry.moodTag}
                </span>
                <h3 className="text-lg font-serif-sc font-medium text-white">
                  {activeEntry.title}
                </h3>
                <span className="text-xs text-[#bcb5a7] font-serif-sc flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#d4af37]" />
                  {activeEntry.location}
                </span>
              </div>

              {/* Quick fingerprint launcher badge on photo */}
              <button
                onClick={() => setIsFingerprintModalOpen(true)}
                className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md hover:bg-black/85 border border-[#e6c382]/40 rounded-full text-[11px] font-serif-sc text-[#e6c382] flex items-center gap-1.5 transition-all shadow-lg"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>查看声纹</span>
              </button>
            </div>
          ) : (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-[#38342d] bg-[#0d0e11] flex flex-col items-center justify-center p-4">
              <EmotionFingerprint
                postcard={activeEntry}
                size={230}
                isPlaying={isPlaying}
                style={activeEntry.fingerprintStyle || 'rings'}
                onClick={() => setIsFingerprintModalOpen(true)}
              />

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setIsFingerprintModalOpen(true)}
                  className="px-3 py-1 bg-[#1e1c17] hover:bg-[#2a261e] border border-[#e6c382]/50 text-[#e6c382] rounded-lg text-xs font-serif-sc transition-colors flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>深度透视与藏书票</span>
                </button>
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono-data text-[#706a5e]">
                <span>WARMTH: {computeFingerprintMetrics(activeEntry).warmthIndex}/10</span>
                <span>JITTER: {computeFingerprintMetrics(activeEntry).jitterIndex}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Player Controls & Disc */}
        <div className="flex flex-col justify-between space-y-6">
          {/* Reel Index Indicator */}
          <div className="flex items-center justify-between text-xs font-mono-data text-[#8c8475] border-b border-[#242321] pb-3">
            <span className="flex items-center gap-1.5 text-[#e6c382] font-serif-sc">
              <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>磁带切片 {currentIndex + 1} / {entries.length}</span>
            </span>
            <span>
              {Math.floor(currentSeconds / 60)}:{(currentSeconds % 60).toString().padStart(2, '0')} / {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Guided Prompt Recall */}
          <div className="bg-[#1b1a18] p-4 rounded-xl border border-[#2e2b24]">
            <span className="text-[11px] font-serif-sc text-[#a88243] block mb-1">
              当时感知引导：
            </span>
            <p className="text-xs font-serif-sc text-[#ede8de] leading-relaxed italic">
              “{activeEntry.promptQuestion}”
            </p>
          </div>

          {/* Reflection Snippet */}
          <p className="text-sm font-serif-sc text-[#cfc8bd] leading-relaxed line-clamp-3">
            “{activeEntry.reflectionText}”
          </p>

          {/* Scrubbing Bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-[#242321] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#e6c382] transition-all duration-300 rounded-full"
                style={{ width: `${(currentSeconds / totalDuration) * 100}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={handlePrev}
              className="p-3 text-[#8c8475] hover:text-[#ded8cb] hover:bg-[#202024] rounded-full transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#e6c382] hover:bg-[#ebd29b] text-[#141416] flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-3 text-[#8c8475] hover:text-[#ded8cb] hover:bg-[#202024] rounded-full transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist queue */}
      <div className="space-y-3">
        <h4 className="text-sm font-serif-sc font-medium text-[#c7bead]">
          声音记忆清单（按时间倒叙流淌）
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentIndex(idx);
                setCurrentSeconds(0);
                if (isPlaying) handlePause();
              }}
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                idx === currentIndex
                  ? 'border-[#e6c382] bg-[#1f1e1a]'
                  : 'border-[#272623] bg-[#141517] hover:border-[#3d3a33]'
              }`}
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-black/60 flex items-center justify-center text-[10px] font-serif-sc font-bold shadow-sm"
                  style={{
                    backgroundColor: computeFingerprintMetrics(item).dominantColor,
                    color: '#111215'
                  }}
                  title={`感官维度：${computeFingerprintMetrics(item).dimensionName}`}
                >
                  {computeFingerprintMetrics(item).glyph}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] font-mono-data text-[#8c8475]">
                  <span>{item.date}</span>
                  <span>{item.audioDuration}s</span>
                </div>
                <h5 className="text-xs font-serif-sc font-medium text-[#ede8de] truncate mt-0.5">
                  {item.title}
                </h5>
                <span className="text-[11px] font-serif-sc text-[#a88243]">
                  {item.moodTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Emotion Fingerprint Modal */}
      <VoiceFingerprintModal
        postcard={activeEntry}
        isOpen={isFingerprintModalOpen}
        onClose={() => setIsFingerprintModalOpen(false)}
        onUpdatePostcard={onUpdatePostcard}
      />
    </div>
  );
};
