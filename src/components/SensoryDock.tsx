import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Wind, 
  Sliders, 
  Sparkles, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  Timer, 
  Disc3, 
  Flame, 
  Compass, 
  X,
  Maximize2
} from 'lucide-react';
import { 
  ambientMixer, 
  SOUNDSCAPE_PRESETS, 
  AmbientTrackId, 
  SoundscapePreset 
} from '../utils/audioSynth';

interface SensoryDockProps {
  onOpenFullBreathwork: () => void;
  isScreenAuraActive: boolean;
  onToggleScreenAura: (active: boolean) => void;
}

export const SensoryDock: React.FC<SensoryDockProps> = ({
  onOpenFullBreathwork,
  isScreenAuraActive,
  onToggleScreenAura
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mixer' | 'breath'>('mixer');
  const [isMasterPlaying, setIsMasterPlaying] = useState(ambientMixer.getMasterPlaying());
  const [masterVolume, setMasterVolume] = useState(ambientMixer.getMasterVolume());
  const [tracks, setTracks] = useState(ambientMixer.getTracks());
  const [activePresetId, setActivePresetId] = useState<string | null>('rainy_fireside');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);

  // Sync with audio engine state changes
  useEffect(() => {
    const unsubscribe = ambientMixer.subscribe(() => {
      setIsMasterPlaying(ambientMixer.getMasterPlaying());
      setMasterVolume(ambientMixer.getMasterVolume());
      setTracks([...ambientMixer.getTracks()]);
    });
    return unsubscribe;
  }, []);

  // Sleep timer interval
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(0);
      return;
    }

    setSleepTimerRemaining(sleepTimerMinutes * 60);
    const interval = window.setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev <= 1) {
          ambientMixer.stopMaster();
          setSleepTimerMinutes(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const handleToggleMaster = () => {
    ambientMixer.toggleMaster();
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    ambientMixer.setMasterVolume(val);
  };

  const handleTrackToggle = (id: AmbientTrackId, enabled: boolean) => {
    setActivePresetId(null);
    ambientMixer.setTrackEnabled(id, enabled);
  };

  const handleTrackVolumeChange = (id: AmbientTrackId, val: number) => {
    setActivePresetId(null);
    ambientMixer.setTrackVolume(id, val);
  };

  const handleApplyPreset = (preset: SoundscapePreset) => {
    setActivePresetId(preset.id);
    ambientMixer.applyPreset(preset);
  };

  const activeTracksCount = tracks.filter(t => t.enabled && t.volume > 0.05).length;
  const currentPresetName = SOUNDSCAPE_PRESETS.find(p => p.id === activePresetId)?.name;

  return (
    <>
      {/* Full-screen subtle ambient breathing aura around the browser viewport */}
      {isScreenAuraActive && (
        <div 
          className="fixed inset-0 pointer-events-none z-30 transition-all duration-1000"
          style={{
            boxShadow: 'inset 0 0 70px 10px rgba(230, 195, 130, 0.12)',
            animation: 'breathe-aura 5.5s infinite ease-in-out'
          }}
        />
      )}

      {/* Floating Sensory Dock Container */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end select-none">
        {/* Expanded Control Pod */}
        {isOpen && (
          <div className="mb-3 w-[92vw] max-w-[420px] bg-[#121316]/95 backdrop-blur-xl border border-[#2d2c28] rounded-2xl shadow-2xl overflow-hidden animate-slide-up text-[#ded9ce] flex flex-col max-h-[82vh]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#22211e] bg-[#0c0d0f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1e1c17] border border-[#e6c382]/40 flex items-center justify-center text-[#e6c382]">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <span className="font-serif-sc text-xs font-medium text-[#ede8de]">
                  感官混音与身心定锚
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMaster}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-serif-sc flex items-center gap-1 transition-all ${
                    isMasterPlaying
                      ? 'bg-[#e6c382] text-[#141516] font-semibold'
                      : 'bg-[#1b1c20] text-[#9c9586] hover:text-[#ede8de]'
                  }`}
                >
                  {isMasterPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isMasterPlaying ? '静音' : '开启混音'}</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#8c8577] hover:text-[#ede8de] rounded transition-colors"
                  title="收起工作台"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[#1f1e1b] bg-[#141518] text-xs font-serif-sc">
              <button
                onClick={() => setActiveTab('mixer')}
                className={`flex-1 py-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
                  activeTab === 'mixer' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8577] hover:text-[#ded8cb]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 opacity-80" />
                <span>自然白噪音调音台</span>
                {isMasterPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e6c382] animate-pulse" />
                )}
                {activeTab === 'mixer' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e6c382]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('breath')}
                className={`flex-1 py-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
                  activeTab === 'breath' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8577] hover:text-[#ded8cb]'
                }`}
              >
                <Wind className="w-3.5 h-3.5 opacity-80" />
                <span>身心共振呼吸</span>
                {activeTab === 'breath' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e6c382]" />
                )}
              </button>
            </div>

            {/* Tab 1: Soundscape Mixer */}
            {activeTab === 'mixer' && (
              <div className="p-4 overflow-y-auto space-y-4 text-xs font-serif-sc">
                {/* Presets Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-data text-[#8a8376] uppercase tracking-wider">
                      SOUNDSCAPE PRESETS · 经典场景
                    </span>
                    {activePresetId && (
                      <span className="text-[10px] text-[#e6c382] font-serif-sc">
                        当前: {currentPresetName}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SOUNDSCAPE_PRESETS.map((preset) => {
                      const isSelected = activePresetId === preset.id && isMasterPlaying;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#221f18] border-[#e6c382]/60 text-[#f5efe4] shadow-sm'
                              : 'bg-[#18191d] border-white/5 hover:border-white/10 text-[#a0988a] hover:text-[#ded8cb]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{preset.icon}</span>
                            <span className="font-serif-sc text-xs font-medium text-[#ded8cb]">
                              {preset.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#7a7469] mt-1 line-clamp-1">
                            {preset.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Master Volume Slider */}
                <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#a69e90] flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#e6c382]" />
                      主输出音量
                    </span>
                    <span className="font-mono-data text-[#d4af37]">
                      {Math.round(masterVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={handleMasterVolumeChange}
                    className="w-full accent-[#e6c382] h-1.5 bg-[#25272e] rounded-lg cursor-pointer"
                  />
                </div>

                {/* 6 Multi-Track Sliders */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono-data text-[#8a8376] uppercase tracking-wider">
                    MULTI-TRACK MIXER · 多轨独立推子
                  </div>

                  {tracks.map((track) => (
                    <div 
                      key={track.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        track.enabled && isMasterPlaying
                          ? 'bg-[#1b1c21] border-[#363530]'
                          : 'bg-[#151619] border-white/5 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTrackToggle(track.id, !track.enabled)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                              track.enabled
                                ? 'bg-[#29261f] border border-[#e6c382]/40 text-[#e6c382]'
                                : 'bg-[#1e1f24] text-[#6b675e]'
                            }`}
                          >
                            {track.icon}
                          </button>
                          <div>
                            <span className="text-xs font-medium text-[#ded8cb]">
                              {track.name}
                            </span>
                            <span className="text-[10px] text-[#787265] ml-1.5">
                              {track.subname}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono-data text-[#d4af37] w-8 text-right">
                            {track.enabled ? `${Math.round(track.volume * 100)}%` : '关'}
                          </span>
                        </div>
                      </div>

                      {/* Slider */}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        disabled={!track.enabled}
                        value={track.volume}
                        onChange={(e) => handleTrackVolumeChange(track.id, parseFloat(e.target.value))}
                        className={`w-full h-1 rounded-lg cursor-pointer ${
                          track.enabled ? 'accent-[#e6c382] bg-[#272930]' : 'accent-gray-600 bg-[#202126] cursor-not-allowed'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Sleep Timer */}
                <div className="pt-2 border-t border-[#1e1f24] flex items-center justify-between text-[11px]">
                  <span className="text-[#8c8577] flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-[#e6c382]" />
                    <span>定时静音</span>
                    {sleepTimerRemaining > 0 && (
                      <span className="font-mono-data text-[#e6c382]">
                        ({Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')})
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1 font-mono-data text-[10px]">
                    {[null, 15, 30, 60].map((mins) => (
                      <button
                        key={String(mins)}
                        onClick={() => setSleepTimerMinutes(mins)}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          sleepTimerMinutes === mins
                            ? 'bg-[#e6c382]/20 border-[#e6c382]/60 text-[#e6c382]'
                            : 'bg-[#18191d] border-white/5 text-[#7a7469] hover:text-[#ded8cb]'
                        }`}
                      >
                        {mins ? `${mins}m` : '无限'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Somatic Breathwork mini guide & launcher */}
            {activeTab === 'breath' && (
              <div className="p-4 space-y-4 text-xs font-serif-sc">
                {/* Intro card */}
                <div className="p-3 bg-[#191a1e] rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#e6c382]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>心脑协同 · 从数字焦虑重返身体真实</span>
                  </div>
                  <p className="text-[11px] text-[#9c9586] leading-relaxed">
                    在阅读明信片文字或倾听原声时，配合慢速呼吸，可让交感神经过度紧绷迅速缓和。
                  </p>
                </div>

                {/* Quick launch full-screen modal */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullBreathwork();
                  }}
                  className="w-full py-3 bg-[#e6c382] hover:bg-[#edd49d] active:scale-[0.99] text-[#141517] font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>开启全屏深度共振呼吸引导</span>
                </button>

                {/* Ambient Screen Aura Toggle */}
                <div className="p-3 bg-[#17181c] rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs text-[#ede8de] block">
                      全屏呼吸微光光晕 (Screen Aura)
                    </span>
                    <span className="text-[10px] text-[#7a7469] block">
                      屏幕边缘随 5.5s 黄金节律柔和呼吸微光涨落
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleScreenAura(!isScreenAuraActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-data border transition-all ${
                      isScreenAuraActive
                        ? 'bg-[#252219] border-[#e6c382] text-[#e6c382] font-semibold'
                        : 'bg-[#1b1c20] border-white/10 text-[#7a7469]'
                    }`}
                  >
                    {isScreenAuraActive ? '已开启' : '关闭'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Pill Trigger */}
        <div className="flex items-center gap-2 bg-[#101114]/90 backdrop-blur-md border border-[#2d2c28] hover:border-[#e6c382]/50 rounded-full p-1.5 shadow-2xl transition-all group">
          {/* Audio Equalizer & Master Toggle */}
          <button
            onClick={handleToggleMaster}
            title={isMasterPlaying ? '点击静音环境音' : '点击开启自然白噪音'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isMasterPlaying
                ? 'bg-[#e6c382] text-[#141516] shadow-md shadow-[#e6c382]/20'
                : 'bg-[#1c1d22] text-[#a0988a] hover:text-[#ded8cb]'
            }`}
          >
            {isMasterPlaying ? (
              <div className="flex items-end gap-[2px] h-3.5">
                <span className="w-[2.5px] bg-[#141516] rounded-full animate-sound-bar-1" />
                <span className="w-[2.5px] bg-[#141516] rounded-full animate-sound-bar-2" />
                <span className="w-[2.5px] bg-[#141516] rounded-full animate-sound-bar-3" />
              </div>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Quick status label */}
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer px-2 flex flex-col justify-center"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif-sc font-medium text-[#ede8de]">
                具身混音
              </span>
              {isMasterPlaying && (
                <span className="text-[10px] font-mono-data text-[#e6c382]">
                  {currentPresetName || `${activeTracksCount}轨`}
                </span>
              )}
            </div>
            <span className="text-[9px] font-serif-sc text-[#7e786b]">
              {isMasterPlaying ? '触觉声场进行中' : '自然音效 & 呼吸'}
            </span>
          </div>

          {/* Somatic breath quick launch */}
          <button
            onClick={onOpenFullBreathwork}
            title="开启身体呼吸引导"
            className="w-8 h-8 rounded-full bg-[#18191d] hover:bg-[#22242a] text-[#8e8779] hover:text-[#e6c382] flex items-center justify-center transition-colors border border-white/5"
          >
            <Wind className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse Chevron */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-7 h-7 rounded-full bg-[#18191d] hover:bg-[#22242a] text-[#8e8779] hover:text-[#ede8de] flex items-center justify-center transition-colors"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
