import React, { useState, useEffect, useRef } from 'react';
import { PostcardEntry, ResonanceComment } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  HeartHandshake, 
  Share2, 
  Sparkles, 
  Send, 
  MapPin, 
  Check, 
  Headphones,
  Fingerprint,
  Image as ImageIcon
} from 'lucide-react';
import { ambientPlayer } from '../utils/audioSynth';
import { EmotionFingerprint } from './EmotionFingerprint';
import { VoiceFingerprintModal } from './VoiceFingerprintModal';
import { computeFingerprintMetrics } from '../utils/voiceFingerprintHelper';
import confetti from 'canvas-confetti';

interface ListenRoomModalProps {
  postcard: PostcardEntry | null;
  onClose: () => void;
  onAddResonance: (postcardId: string, resonance: ResonanceComment) => void;
  onUpdatePostcard?: (updated: PostcardEntry) => void;
}

export const ListenRoomModal: React.FC<ListenRoomModalProps> = ({
  postcard,
  onClose,
  onAddResonance,
  onUpdatePostcard,
}) => {
  if (!postcard) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [newResonanceText, setNewResonanceText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [visualMode, setVisualMode] = useState<'photo' | 'fingerprint'>('photo');
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isUsingAmbientSynthRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const totalDuration = postcard.audioDuration || 25;

  useEffect(() => {
    // Auto start playback on opening for immersive feeling
    handlePlay();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      ambientPlayer.stop();
    };
  }, [postcard.id]);

  const handlePlay = () => {
    const audioUrl = postcard.audioUrl;
    if (!audioUrl || audioUrl.startsWith('synth-voice://') || !audioUrl.startsWith('data:audio')) {
      // Use Web Audio ambient synthesizer
      isUsingAmbientSynthRef.current = true;
      setIsPlaying(true);
      const stopAmbient = ambientPlayer.playAmbient('warmth', totalDuration);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            stopAmbient();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      isUsingAmbientSynthRef.current = false;
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

      audioElementRef.current.play().catch((err) => {
        console.warn('Audio auto-play prevented by browser policy', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isUsingAmbientSynthRef.current) {
      ambientPlayer.stop();
    } else if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitResonance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResonanceText.trim()) return;

    const newComment: ResonanceComment = {
      id: `res-${Date.now()}`,
      name: authorName.trim() || '匿名的倾听者',
      text: newResonanceText.trim(),
      time: '刚刚',
    };

    onAddResonance(postcard.id, newComment);
    setNewResonanceText('');

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e6c382', '#f3d9a8', '#d4af37'],
      });
    } catch {}
  };

  const handleCopyLink = () => {
    const url = window.location.href.split('?')[0] + `?listen=${postcard.id}#listen-room`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141517] border border-[#2e2d29] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#e2ded6]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <Headphones className="w-4 h-4 text-[#e6c382]" />
            <span>倾听室 · 扫码已连接具身心声</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 text-xs font-serif-sc text-[#a89e8e] hover:text-[#f0ebd9] bg-[#1e1e21] rounded-md transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '已复制倾听链接' : '分享链接'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Visual & Audio Player Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Photo Card or Emotion Fingerprint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-serif-sc">
                <span className="text-[#8c8475] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>感官视界</span>
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-[#1b1c20] rounded-lg border border-white/5">
                  <button
                    onClick={() => setVisualMode('photo')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all flex items-center gap-1 ${
                      visualMode === 'photo'
                        ? 'bg-[#292721] text-[#e6c382] font-medium'
                        : 'text-[#8c8577] hover:text-[#ded8cb]'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>照片</span>
                  </button>
                  <button
                    onClick={() => setVisualMode('fingerprint')}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all flex items-center gap-1 ${
                      visualMode === 'fingerprint'
                        ? 'bg-[#292721] text-[#e6c382] font-medium'
                        : 'text-[#8c8577] hover:text-[#ded8cb]'
                    }`}
                  >
                    <Fingerprint className="w-3 h-3" />
                    <span>声纹</span>
                  </button>
                </div>
              </div>

              {visualMode === 'photo' ? (
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#33312c] group">
                  <img
                    src={postcard.imageUrl}
                    alt={postcard.title}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-xs font-mono-data text-[#d4af37] tracking-wider mb-1">
                      {postcard.date} · {postcard.moodTag}
                    </span>
                    <h3 className="text-lg font-serif-sc font-medium text-white">
                      {postcard.title}
                    </h3>
                    <span className="text-xs text-[#bcb5a7] font-serif-sc flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#d4af37]" />
                      {postcard.location}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsFingerprintModalOpen(true)}
                    className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md hover:bg-black/85 border border-[#e6c382]/40 rounded-full text-[11px] font-serif-sc text-[#e6c382] flex items-center gap-1 shadow-md"
                  >
                    <Fingerprint className="w-3 h-3" />
                    <span>声纹</span>
                  </button>
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-[#33312c] bg-[#0d0e11] flex flex-col items-center justify-center p-3">
                  <EmotionFingerprint
                    postcard={postcard}
                    size={210}
                    isPlaying={isPlaying}
                    style={postcard.fingerprintStyle || 'rings'}
                    onClick={() => setIsFingerprintModalOpen(true)}
                  />
                  <button
                    onClick={() => setIsFingerprintModalOpen(true)}
                    className="mt-2 text-xs font-serif-sc text-[#e6c382] hover:underline flex items-center gap-1"
                  >
                    <Fingerprint className="w-3 h-3" />
                    <span>展开声纹读数与藏书票 →</span>
                  </button>
                </div>
              )}
            </div>

            {/* Audio Experience Pane */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-[#1b1a18] border border-[#2d2a24] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs font-serif-sc text-[#d4af37] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>当时被唤醒的感官：</span>
                </div>
                <p className="text-sm font-serif-sc text-[#ede6da] font-medium leading-snug">
                  {postcard.promptQuestion}
                </p>
              </div>

              {/* Player Waveform & Controls */}
              <div className="bg-[#17171a] border border-[#292825] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-[#8c8475] mb-2 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#e6c382] font-serif-sc">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>原声录音回响</span>
                  </span>
                  <span>{formatTime(currentSeconds)} / {formatTime(totalDuration)}</span>
                </div>

                {/* Animated Waveform */}
                <div className="h-10 flex items-center justify-center gap-1 my-2">
                  {(postcard.audioWaveformData || [30, 45, 60, 80, 50, 70, 40, 30, 65, 85, 45, 30]).map((bar, i) => {
                    const active = (i / 12) <= (currentSeconds / totalDuration);
                    const dynamicHeight = isPlaying
                      ? Math.min(100, Math.max(20, bar + Math.sin(currentSeconds * 3 + i) * 20))
                      : bar;

                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-200 ${
                          active ? 'bg-[#e6c382]' : 'bg-[#3b3831]'
                        }`}
                        style={{ height: `${dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-center mt-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-[#e6c382] hover:bg-[#ebd29b] text-[#141416] flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User's Original Feeling Text */}
          <div className="bg-[#19191c] border border-[#2a2925] rounded-xl p-5">
            <h4 className="text-xs font-serif-sc text-[#a89e8e] mb-2">
              拍照者当时的内心自白：
            </h4>
            <p className="text-sm font-serif-sc text-[#f0ebe1] leading-relaxed italic">
              “{postcard.reflectionText}”
            </p>
          </div>

          {/* Resonances Section (共情回音) */}
          <div className="border-t border-[#262522] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-serif-sc text-[#ded6c7] font-semibold">
                听友的心绪共鸣 ({postcard.resonances.length})
              </h4>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 mb-4">
              {postcard.resonances.map((res) => (
                <div key={res.id} className="p-3 bg-[#17181a] border border-[#292825] rounded-lg text-xs">
                  <div className="flex items-center justify-between text-[#8c8475] mb-1 font-serif-sc">
                    <span className="font-medium text-[#d9cfbe]">{res.name}</span>
                    <span className="font-mono-data text-[11px]">{res.time}</span>
                  </div>
                  <p className="text-[#ded8cb] font-serif-sc">{res.text}</p>
                </div>
              ))}
              {postcard.resonances.length === 0 && (
                <p className="text-xs text-[#8c8475] font-serif-sc py-2">
                  成为第一个为这一刻心声留下温暖共鸣的人吧。
                </p>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitResonance} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="你的名字/称呼"
                className="w-full sm:w-1/3 px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#ece5d8] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
              />
              <input
                type="text"
                value={newResonanceText}
                onChange={(e) => setNewResonanceText(e.target.value)}
                placeholder="写下听到这段心声时的触动..."
                className="flex-1 px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#ece5d8] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
              />
              <button
                type="submit"
                disabled={!newResonanceText.trim()}
                className="px-4 py-2 bg-[#e6c382] hover:bg-[#ebd29b] disabled:opacity-40 text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>传递共鸣</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Voice Emotion Fingerprint Inspector Modal */}
      <VoiceFingerprintModal
        postcard={postcard}
        isOpen={isFingerprintModalOpen}
        onClose={() => setIsFingerprintModalOpen(false)}
        onUpdatePostcard={onUpdatePostcard}
      />
    </div>
  );
};
