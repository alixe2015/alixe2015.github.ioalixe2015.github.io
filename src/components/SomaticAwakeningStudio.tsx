import React, { useState, useEffect } from 'react';
import { SomaticAnchors, SensoryQuest } from '../types';
import { DAILY_SENSORY_QUESTS } from '../data/sensoryQuests';
import { 
  X, 
  Wind, 
  HeartPulse, 
  HandMetal, 
  ShieldCheck, 
  Flame, 
  Compass, 
  Sparkles, 
  RotateCcw,
  Check
} from 'lucide-react';

interface SomaticAwakeningStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnchors?: SomaticAnchors;
  onApplyAnchors?: (anchors: SomaticAnchors) => void;
  onSelectQuest?: (quest: SensoryQuest) => void;
}

export const SomaticAwakeningStudio: React.FC<SomaticAwakeningStudioProps> = ({
  isOpen,
  onClose,
  initialAnchors,
  onApplyAnchors,
  onSelectQuest,
}) => {
  if (!isOpen) return null;

  // Breathing pacer state: 'inhale' (4s), 'hold' (4s), 'exhale' (6s)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  // Somatic calibration sliders
  const [skinTemp, setSkinTemp] = useState<number>(initialAnchors?.skinTemp || 7);
  const [breathState, setBreathState] = useState<number>(initialAnchors?.breathState || 6);
  const [heartRhythm, setHeartRhythm] = useState<number>(initialAnchors?.heartRhythm || 5);
  const [vulnerability, setVulnerability] = useState<number>(initialAnchors?.vulnerability || 6);
  const [scentNote, setScentNote] = useState<string>(initialAnchors?.scentNote || '雨水与湿润泥土');

  // Active quest
  const [activeQuestIdx, setActiveQuestIdx] = useState(0);
  const currentQuest = DAILY_SENSORY_QUESTS[activeQuestIdx];

  // Breath pacing timer
  useEffect(() => {
    if (!isBreathingActive) return;

    let timer: number;
    if (breathPhase === 'inhale') {
      timer = window.setTimeout(() => {
        setBreathPhase('hold');
        setBreathSeconds(4);
      }, 4000);
    } else if (breathPhase === 'hold') {
      timer = window.setTimeout(() => {
        setBreathPhase('exhale');
        setBreathSeconds(6);
      }, 4000);
    } else {
      timer = window.setTimeout(() => {
        setBreathPhase('inhale');
        setBreathSeconds(4);
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, [breathPhase, isBreathingActive]);

  const handleApply = () => {
    if (onApplyAnchors) {
      onApplyAnchors({
        skinTemp,
        breathState,
        heartRhythm,
        vulnerability,
        scentNote,
      });
    }
    if (onSelectQuest) {
      onSelectQuest(currentQuest);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141517] border border-[#302e29] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <Compass className="w-4 h-4 text-[#e6c382]" />
            <span>具身定锚 · 恢复人本身对真实的五感觉知</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Somatic Breathing Anchor (身体定锚呼吸) */}
          <div className="bg-[#19191d] border border-[#2b2a26] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-[11px] font-mono-data text-[#d4af37] tracking-widest uppercase">
              SOMATIC GROUNDING · 闭上眼睛 14 秒
            </span>

            {/* Breathing Visual Orb */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div
                className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${
                  breathPhase === 'inhale'
                    ? 'w-36 h-36 bg-[#e6c382]/20 border border-[#e6c382]'
                    : breathPhase === 'hold'
                    ? 'w-36 h-36 bg-amber-500/25 border border-amber-400'
                    : 'w-20 h-20 bg-blue-500/15 border border-blue-400/60'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-base font-serif-sc font-medium text-[#f5eedc]">
                  {breathPhase === 'inhale'
                    ? '吸气 · 4秒'
                    : breathPhase === 'hold'
                    ? '屏息 · 4秒'
                    : '呼气 · 6秒'}
                </span>
                <span className="text-[10px] text-[#8c8475] font-serif-sc mt-0.5">
                  {breathPhase === 'inhale'
                    ? '感受胸骨微抬'
                    : breathPhase === 'hold'
                    ? '感知心跳频率'
                    : '双肩彻底放松'}
                </span>
              </div>
            </div>

            <p className="text-xs font-serif-sc text-[#9c9384] max-w-md leading-relaxed">
              现代人在光滑屏幕前坐得太久，神经末梢陷入钝化。在记录之前，用三口呼吸把意识从大脑拉回真实的肉身。
            </p>
          </div>

          {/* Section 2: Somatic Dimension Micro-Calibration (五感微觉知刻度尺) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#242321] pb-2">
              <h4 className="text-sm font-serif-sc font-medium text-[#f0ebe1] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e6c382]" />
                <span>扫描你此刻的生理状态（五感微刻度）：</span>
              </h4>
              <span className="text-[11px] font-serif-sc text-[#8c8475]">
                不仅是概念标签，而是肉身物理读数
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Skin Temp */}
              <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc">
                  <span className="text-[#ded8cb] flex items-center gap-1.5">
                    <HandMetal className="w-3.5 h-3.5 text-amber-400" />
                    <span>皮肤温差：{skinTemp}°</span>
                  </span>
                  <span className="text-[11px] font-mono-data text-[#8c8475]">
                    {skinTemp <= 4 ? '冰凉发僵' : skinTemp >= 8 ? '微烫温热' : '温和舒适'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={skinTemp}
                  onChange={(e) => setSkinTemp(Number(e.target.value))}
                  className="w-full accent-[#e6c382]"
                />
              </div>

              {/* 2. Breath State */}
              <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc">
                  <span className="text-[#ded8cb] flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>呼吸舒展度：{breathState}/10</span>
                  </span>
                  <span className="text-[11px] font-mono-data text-[#8c8475]">
                    {breathState <= 4 ? '短促收紧' : breathState >= 8 ? '通畅深沉' : '平稳自然'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={breathState}
                  onChange={(e) => setBreathState(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>

              {/* 3. Heart Rhythm */}
              <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc">
                  <span className="text-[#ded8cb] flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    <span>心跳悸动感：{heartRhythm}/10</span>
                  </span>
                  <span className="text-[11px] font-mono-data text-[#8c8475]">
                    {heartRhythm <= 3 ? '细微平缓' : heartRhythm >= 8 ? '剧烈悸动' : '静水流深'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={heartRhythm}
                  onChange={(e) => setHeartRhythm(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              {/* 4. Vulnerability */}
              <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-serif-sc">
                  <span className="text-[#ded8cb] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>脆弱袒露度：{vulnerability}/10</span>
                  </span>
                  <span className="text-[11px] font-mono-data text-[#8c8475]">
                    {vulnerability <= 3 ? '有所保留' : vulnerability >= 8 ? '毫无伪装' : '真情流露'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={vulnerability}
                  onChange={(e) => setVulnerability(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Daily Sensory Awakening Quest (今日感官寻宝任务) */}
          <div className="bg-[#191917] border border-[#33302a] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-data text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>今日具身微训练任务 ({activeQuestIdx + 1} / {DAILY_SENSORY_QUESTS.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveQuestIdx((prev) => (prev + 1) % DAILY_SENSORY_QUESTS.length)}
                className="text-xs font-serif-sc text-[#a88243] hover:text-[#e6c382] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>换一个感官任务</span>
              </button>
            </div>

            <h5 className="text-base font-serif-sc font-semibold text-[#f5eedc]">
              {currentQuest.title}
            </h5>
            <p className="text-xs font-serif-sc text-[#d4cbbe] leading-relaxed">
              行动指引：{currentQuest.action}
            </p>
            <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 text-[11px] font-serif-sc text-[#9c9384] flex items-center gap-2">
              <span className="text-[#e6c382]">💡 恢复感知原理：</span>
              <span>{currentQuest.somaticFocus}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-[#242321] flex items-center justify-between">
            <span className="text-xs font-serif-sc text-[#8c8475]">
              记录真实的身体读数，对抗算法对感知力的侵蚀
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-serif-sc text-[#8c8475] hover:text-[#ded8cb]"
              >
                稍后训练
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 bg-[#e6c382] hover:bg-[#ebd29b] active:scale-[0.98] text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>保存感官定锚并开始记录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
