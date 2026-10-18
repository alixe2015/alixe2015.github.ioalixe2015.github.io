import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Wind, 
  Heart, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  Check,
  Maximize2,
  Info
} from 'lucide-react';
import { ambientMixer } from '../utils/audioSynth';
import { somaticHaptics } from '../utils/haptics';

export type BreathPatternId = 'hrv' | '478' | 'box';

interface BreathPatternConfig {
  id: BreathPatternId;
  name: string;
  subtitle: string;
  description: string;
  phases: {
    inhale: number;
    holdIn?: number;
    exhale: number;
    holdOut?: number;
  };
}

export const BREATH_PATTERNS: BreathPatternConfig[] = [
  {
    id: 'hrv',
    name: 'HRV 心脑协同共振',
    subtitle: '0.1Hz 迷走神经激活 (5.5s 吸 - 5.5s 呼)',
    description: '科学验证的最佳自主神经平衡节律，提升心率变异性，迅速抚平思维烦躁与焦虑。',
    phases: {
      inhale: 5.5,
      exhale: 5.5
    }
  },
  {
    id: '478',
    name: '4-7-8 深度入眠定锚',
    subtitle: '神经副交感转向 (4s 吸 - 7s 屏 - 8s 慢呼)',
    description: '通过极长呼气释放体内蓄积压力，促使心跳平稳，帮助大脑从算法过载转向安宁。',
    phases: {
      inhale: 4,
      holdIn: 7,
      exhale: 8
    }
  },
  {
    id: 'box',
    name: '4-4-4-4 箱式均衡呼吸',
    subtitle: '特种部队专注法 (4s 吸 - 4s 屏 - 4s 呼 - 4s 停)',
    description: '四段等长对称循环，建立强大的情绪韧性与肉身自控力，回归绝对专注。',
    phases: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4
    }
  }
];

const SOMATIC_MINDFUL_PROMPTS = [
  '松开下颌与牙关，让舌尖轻触上颚...',
  '感受双肩自然下沉，卸去无形的重担...',
  '体会吸气时空气从鼻腔流入的清凉微润...',
  '肋骨如同折扇般缓缓舒展，不争不抢...',
  '呼气时，将一整天的信息焦虑全然释放...',
  '肉身是灵魂唯一的锚点，在此刻安住...'
];

interface SomaticBreathworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isScreenAuraActive?: boolean;
  onToggleScreenAura?: (active: boolean) => void;
}

export const SomaticBreathworkModal: React.FC<SomaticBreathworkModalProps> = ({
  isOpen,
  onClose,
  isScreenAuraActive = false,
  onToggleScreenAura
}) => {
  if (!isOpen) return null;

  const [patternId, setPatternId] = useState<BreathPatternId>('hrv');
  const [isActive, setIsActive] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState<number>(5.5);
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0 to 1
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [promptIdx, setPromptIdx] = useState(0);

  const activePattern = BREATH_PATTERNS.find(p => p.id === patternId) || BREATH_PATTERNS[0];

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const currentDurationRef = useRef<number>(5.5);

  // Rotate mindful prompts every cycle
  useEffect(() => {
    if (completedCycles > 0) {
      setPromptIdx((completedCycles) % SOMATIC_MINDFUL_PROMPTS.length);
    }
  }, [completedCycles]);

  // Main breath clock
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const getPhaseDuration = (phase: typeof currentPhase): number => {
      if (phase === 'inhale') return activePattern.phases.inhale;
      if (phase === 'holdIn') return activePattern.phases.holdIn || 0;
      if (phase === 'exhale') return activePattern.phases.exhale;
      return activePattern.phases.holdOut || 0;
    };

    const nextPhaseMap: Record<typeof currentPhase, 'inhale' | 'holdIn' | 'exhale' | 'holdOut'> = {
      inhale: activePattern.phases.holdIn ? 'holdIn' : 'exhale',
      holdIn: 'exhale',
      exhale: activePattern.phases.holdOut ? 'holdOut' : 'inhale',
      holdOut: 'inhale'
    };

    // Initial cue
    triggerPhaseCues(currentPhase);
    currentDurationRef.current = getPhaseDuration(currentPhase);
    setPhaseSecondsRemaining(currentDurationRef.current);
    lastTickRef.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setPhaseSecondsRemaining(prev => {
        const next = prev - delta;
        const total = currentDurationRef.current;
        const progress = Math.max(0, Math.min(1, 1 - (next / total)));
        setPhaseProgress(progress);

        if (next <= 0) {
          // Transition to next phase
          const nextP = nextPhaseMap[currentPhase];
          if (nextP === 'inhale') {
            setCompletedCycles(c => c + 1);
          }
          setCurrentPhase(nextP);
          const nextDur = getPhaseDuration(nextP);
          currentDurationRef.current = nextDur;
          triggerPhaseCues(nextP);
          return nextDur;
        }
        return next;
      });
    }, 40);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, currentPhase, patternId]);

  const triggerPhaseCues = (phase: typeof currentPhase) => {
    if (soundEnabled) {
      if (phase === 'inhale') ambientMixer.playBreathChime('inhale');
      else if (phase === 'holdIn' || phase === 'holdOut') ambientMixer.playBreathChime('hold');
      else ambientMixer.playBreathChime('exhale');
    }

    if (hapticEnabled) {
      if (phase === 'inhale') somaticHaptics.inhaleStart();
      else if (phase === 'holdIn' || phase === 'holdOut') somaticHaptics.holdAnchor();
      else somaticHaptics.exhaleStart();
    }
  };

  const handleSwitchPattern = (newId: BreathPatternId) => {
    setPatternId(newId);
    setCurrentPhase('inhale');
    setCompletedCycles(0);
    const pattern = BREATH_PATTERNS.find(p => p.id === newId) || BREATH_PATTERNS[0];
    currentDurationRef.current = pattern.phases.inhale;
    setPhaseSecondsRemaining(pattern.phases.inhale);
    setPhaseProgress(0);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return '徐徐吸气 · 感受清凉丰盈';
      case 'holdIn': return '屏息定锚 · 觉察身体中心';
      case 'exhale': return '深长呼气 · 释放紧绷压力';
      case 'holdOut': return '静默留白 · 融入天地虚空';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return '#e6c382'; // Gold warmth
      case 'holdIn': return '#89d4c7'; // Celadon calm
      case 'exhale': return '#d29679'; // Terracotta warmth
      case 'holdOut': return '#9f8db5'; // Iris dusk
    }
  };

  // Compute mandala scale
  let circleScale = 1.0;
  if (currentPhase === 'inhale') {
    circleScale = 0.75 + phaseProgress * 0.45; // 0.75 -> 1.2
  } else if (currentPhase === 'holdIn') {
    circleScale = 1.2 + Math.sin(phaseProgress * Math.PI) * 0.05; // gentle pulse
  } else if (currentPhase === 'exhale') {
    circleScale = 1.2 - phaseProgress * 0.45; // 1.2 -> 0.75
  } else {
    circleScale = 0.75;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121316] border border-[#2d2c28] rounded-3xl shadow-2xl overflow-hidden my-auto text-[#ede8de] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22211e] bg-[#0d0e10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1e1c17] border border-[#e6c382]/40 flex items-center justify-center text-[#e6c382]">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-serif-sc font-medium text-[#ede8de]">
                <span>具身节律引导 · Somatic Breathwork</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e6c382]/15 text-[#e6c382] font-mono-data border border-[#e6c382]/30">
                  {completedCycles} 轮达成
                </span>
              </div>
              <p className="text-[11px] text-[#8e8779] font-serif-sc">
                放慢呼吸，让大脑退出演算，让肉身重新成为生命的容器
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

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-[#1c1b18] bg-[#141518]">
          <div className="grid grid-cols-3 gap-2">
            {BREATH_PATTERNS.map((p) => {
              const isSelected = p.id === patternId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPattern(p.id)}
                  className={`px-3 py-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-[#201d17] border-[#e6c382]/60 shadow-lg text-[#ede8de]'
                      : 'bg-[#18181c]/50 border-white/5 hover:border-white/10 text-[#8e8779] hover:text-[#ded8cb]'
                  }`}
                >
                  <div className="text-xs font-serif-sc font-medium leading-tight">
                    {p.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-mono-data text-[#d4af37] opacity-80 mt-0.5 truncate">
                    {p.id === 'hrv' ? '5.5s 共振' : p.id === '478' ? '4-7-8 安神' : '4-4-4-4 箱式'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Breathing Mandala Stage */}
        <div className="relative py-12 px-6 flex flex-col items-center justify-center min-h-[340px] overflow-hidden">
          {/* Ambient background glow matching phase */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at center, ${getPhaseColor()} 0%, transparent 70%)`
            }}
          />

          {/* Concentric Breathing Mandala */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer soft ring */}
            <div 
              className="absolute inset-0 rounded-full border border-dashed transition-transform duration-300"
              style={{
                borderColor: `${getPhaseColor()}40`,
                transform: `scale(${circleScale * 1.15})`
              }}
            />

            {/* Ripple Wave 2 */}
            <div 
              className="absolute inset-4 rounded-full border transition-transform duration-300"
              style={{
                borderColor: `${getPhaseColor()}60`,
                transform: `scale(${circleScale * 1.05})`
              }}
            />

            {/* Main Luminous Core */}
            <div 
              className="w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 relative overflow-hidden"
              style={{
                transform: `scale(${circleScale})`,
                background: `radial-gradient(circle at 35% 35%, ${getPhaseColor()}35 0%, #17181c 90%)`,
                boxShadow: `0 0 50px ${getPhaseColor()}30, inset 0 0 25px ${getPhaseColor()}25`,
                border: `1.5px solid ${getPhaseColor()}80`
              }}
            >
              <span className="text-3xl font-mono-data font-light tracking-tight text-[#f5efe4]">
                {phaseSecondsRemaining.toFixed(1)}<span className="text-sm opacity-60">s</span>
              </span>
              <span className="text-xs font-serif-sc font-medium mt-1 tracking-wider" style={{ color: getPhaseColor() }}>
                {currentPhase === 'inhale' ? '吸气' : currentPhase === 'holdIn' ? '屏息' : currentPhase === 'exhale' ? '呼气' : '留白'}
              </span>
            </div>
          </div>

          {/* Phase Guidance Text */}
          <div className="text-center mt-6 z-10 space-y-1">
            <h3 className="text-lg font-serif-sc font-medium text-[#ede8de] tracking-wide">
              {getPhaseText()}
            </h3>
            <p className="text-xs text-[#a69e90] font-serif-sc max-w-md mx-auto italic">
              “{SOMATIC_MINDFUL_PROMPTS[promptIdx]}”
            </p>
          </div>
        </div>

        {/* Bottom Controls & Sensory Toggles */}
        <div className="px-6 py-4 bg-[#0d0e10] border-t border-[#201f1c] flex flex-wrap items-center justify-between gap-4">
          {/* Left: Play/Pause and Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="px-4 py-2 bg-[#e6c382] hover:bg-[#edd49d] active:scale-95 text-[#141517] font-serif-sc font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isActive ? '暂停节律' : '继续呼吸'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentPhase('inhale');
                setCompletedCycles(0);
                setPhaseSecondsRemaining(activePattern.phases.inhale);
              }}
              title="重置循环"
              className="p-2 bg-[#1b1c20] hover:bg-[#25262c] text-[#a69e90] hover:text-[#ede8de] border border-white/5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Audio Chime, Vibration, Screen Aura Toggles */}
          <div className="flex items-center gap-2 text-xs font-serif-sc">
            {/* Soft Bell Chime */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? '换相梵音已开启' : '梵音已静音'}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-[#221f18] border-[#e6c382]/50 text-[#e6c382]'
                  : 'bg-[#16171a] border-white/5 text-[#6c675e]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">清心梵音</span>
            </button>

            {/* Haptic Vibration */}
            <button
              onClick={() => setHapticEnabled(!hapticEnabled)}
              title={hapticEnabled ? '体感微震已开启' : '触觉震动已关闭'}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                hapticEnabled
                  ? 'bg-[#221f18] border-[#e6c382]/50 text-[#e6c382]'
                  : 'bg-[#16171a] border-white/5 text-[#6c675e]'
              }`}
            >
              <Vibrate className="w-4 h-4" />
              <span className="hidden sm:inline">肉身微震</span>
            </button>

            {/* Screen Breathing Aura */}
            {onToggleScreenAura && (
              <button
                onClick={() => onToggleScreenAura(!isScreenAuraActive)}
                title="开启屏幕边缘呼吸微光（可在阅读明信片时保持共振）"
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  isScreenAuraActive
                    ? 'bg-[#221f18] border-[#e6c382]/50 text-[#e6c382]'
                    : 'bg-[#16171a] border-white/5 text-[#6c675e]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">全屏微光光晕</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
