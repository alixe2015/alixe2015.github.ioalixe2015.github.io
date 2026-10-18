import React, { useState } from 'react';
import { PostcardEntry, PostcardTheme, SensoryDimension, SomaticAnchors } from '../types';
import { GUIDED_PROMPTS } from '../data/guidedPrompts';
import { generatePostcardQR } from '../utils/qrHelper';
import { VoiceRecorder } from './VoiceRecorder';
import { SomaticAwakeningStudio } from './SomaticAwakeningStudio';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Flame, 
  Check, 
  RotateCw,
  Compass,
  HeartPulse,
  Wind,
  HandMetal
} from 'lucide-react';

interface CreatePostcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPostcard: (newPostcard: PostcardEntry) => void;
}

export const CreatePostcardModal: React.FC<CreatePostcardModalProps> = ({
  isOpen,
  onClose,
  onAddPostcard,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('城市街角 · 窗前微风');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTime);
  const [imageUrl, setImageUrl] = useState<string>('/src/assets/images/daily_morning_kitchen_light_1792073759655.jpg');
  const [moodTag, setMoodTag] = useState('平静释怀');
  const [moodTemperature, setMoodTemperature] = useState<number>(7);
  const [selectedDimension, setSelectedDimension] = useState<SensoryDimension>('tactile');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(GUIDED_PROMPTS[0].question);
  const [reflectionText, setReflectionText] = useState('');
  const [theme, setTheme] = useState<PostcardTheme>('warm-paper');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [waveform, setWaveform] = useState<number[]>([30, 45, 60, 80, 50, 70, 40, 30, 65, 85, 45, 30]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSomaticModalOpen, setIsSomaticModalOpen] = useState(false);
  const [enableDarkroomDelay, setEnableDarkroomDelay] = useState(false);
  const [somaticAnchors, setSomaticAnchors] = useState<SomaticAnchors>({
    skinTemp: 7,
    breathState: 7,
    heartRhythm: 5,
    vulnerability: 6,
    scentNote: '温热与草木气息',
  });

  // Preset sample images for quick convenience
  const presetImages = [
    { label: '清晨厨房微光', url: '/src/assets/images/daily_morning_kitchen_light_1792073759655.jpg' },
    { label: '雨幕咖啡陶杯', url: '/src/assets/images/daily_coffee_rain_window_1792073757711.jpg' },
    { label: '暮色退潮足迹', url: '/src/assets/images/daily_seaside_steps_dusk_1792073758759.jpg' },
    { label: '逆光落叶脉络', url: '/src/assets/images/daily_sunset_hands_leaf_1792073758668.jpg' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDimensionChange = (dim: SensoryDimension) => {
    setSelectedDimension(dim);
    const found = GUIDED_PROMPTS.find((p) => p.dimension === dim);
    if (found) {
      setSelectedPrompt(found.question);
    }
  };

  const handleAudioSaved = (url: string, duration: number, wf: number[]) => {
    setAudioUrl(url);
    setAudioDuration(duration);
    setWaveform(wf);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    setIsSubmitting(true);
    const newId = `echo-${Date.now()}`;
    const qrCodeDataUrl = await generatePostcardQR(newId);

    const newEntry: PostcardEntry = {
      id: newId,
      date,
      time,
      location: location.trim() || '某处静谧角落',
      imageUrl,
      title: title.trim(),
      theme,
      moodTag: moodTag.trim() || '心绪微动',
      moodTemperature,
      sensoryDimension: selectedDimension,
      promptQuestion: selectedPrompt,
      reflectionText: reflectionText.trim() || '那一刻无声的具身记忆。',
      audioUrl: audioUrl || 'synth-voice://ambient-warmth',
      audioDuration: audioDuration || 18,
      audioWaveformData: waveform,
      qrCodeDataUrl,
      listenCount: 1,
      resonances: [],
      somaticAnchors,
      isDeveloping: enableDarkroomDelay,
      developedAt: enableDarkroomDelay ? Date.now() + 30 * 60 * 1000 : undefined,
    };

    onAddPostcard(newEntry);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141517] border border-[#302e29] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div>
            <h3 className="text-base font-serif-sc font-semibold text-[#f0ebd9]">
              晒今日切片 · 生成正反面感受明信片
            </h3>
            <p className="text-xs text-[#8c8475] font-serif-sc">
              捕捉不可被AI替代的身体感受与声音
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Image Selection */}
          <div>
            <label className="block text-xs font-serif-sc text-[#c7bead] mb-2 font-medium">
              1. 今日拍下的真实照片（正面）
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#38342d] bg-[#1a1917]">
                <img
                  src={imageUrl}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/50 hover:bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-xs font-serif-sc text-white gap-2">
                  <Upload className="w-5 h-5" />
                  <span>上传你的本地照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-[#8e8574] font-serif-sc block">
                  或快速选用灵感切片：
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {presetImages.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-1.5 rounded-lg border text-[11px] font-serif-sc text-left transition-all ${
                        imageUrl === preset.url
                          ? 'border-[#e6c382] bg-[#2a261f] text-[#ecd4a4]'
                          : 'border-[#2d2a24] bg-[#17171a] text-[#8e8574] hover:text-[#ded8cb]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                    明信片标题：
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="如：咖啡杯的微烫、雨水浸湿的鞋尖..."
                    className="w-full px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Location, Time & Mood Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                拍摄地点：
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="地点名称"
                className="w-full px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
              />
            </div>
            <div>
              <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                心绪词：
              </label>
              <input
                type="text"
                value={moodTag}
                onChange={(e) => setMoodTag(e.target.value)}
                placeholder="如：微涩、释然、安宁"
                className="w-full px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
              />
            </div>
            <div>
              <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                心绪温度 (1冷冽 - 10热烈)：{moodTemperature}°
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodTemperature}
                onChange={(e) => setMoodTemperature(Number(e.target.value))}
                className="w-full mt-2 accent-[#e6c382]"
              />
            </div>
          </div>

          {/* Step 3: Sensory Guidance Dimension */}
          <div>
            <label className="block text-xs font-serif-sc text-[#c7bead] mb-2 font-medium">
              2. 觉醒感官引导词（反面）
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {GUIDED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleDimensionChange(prompt.dimension)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif-sc transition-colors ${
                    selectedDimension === prompt.dimension
                      ? 'bg-[#e6c382] text-[#141416] font-medium'
                      : 'bg-[#1e1e21] text-[#9c9384] hover:text-[#e0dad0]'
                  }`}
                >
                  {prompt.dimensionLabel}
                </button>
              ))}
            </div>

            <div className="bg-[#1b1a18] p-3 rounded-xl border border-[#2e2b24] text-xs font-serif-sc text-[#edd8b4] mb-3">
              “{selectedPrompt}”
            </div>
          </div>

          {/* Somatic Bodily Calibration Anchor */}
          <div className="bg-[#1b1c1e] p-3 rounded-xl border border-[#33302a] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-serif-sc text-[#c7bead] flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-[#e6c382]" />
                <span>已锚定身体真实读数：</span>
              </span>
              <span className="text-[11px] font-mono-data text-[#8c8475] mt-0.5 block">
                温感 {somaticAnchors.skinTemp}° · 呼吸 {somaticAnchors.breathState}/10 · 心跳 {somaticAnchors.heartRhythm}/10 · 脆弱 {somaticAnchors.vulnerability}/10
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSomaticModalOpen(true)}
              className="px-3 py-1.5 bg-[#262420] hover:bg-[#332f28] border border-[#52493d] rounded-lg text-xs font-serif-sc text-[#edd8b4] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>14秒具身定锚与身体扫描</span>
            </button>
          </div>

          {/* Step 4: Voice Recording */}
          <div>
            <label className="block text-xs font-serif-sc text-[#c7bead] mb-2 font-medium">
              3. 用声音记录这一刻（反面原声）：
            </label>
            <VoiceRecorder onAudioSaved={handleAudioSaved} />
          </div>

          {/* Step 5: Handwritten Note */}
          <div>
            <label className="block text-xs font-serif-sc text-[#c7bead] mb-1 font-medium">
              4. 心绪字迹（反面笔录）：
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="写下那一刻没说出口的话，或者身体感官的细微体验..."
              rows={3}
              className="w-full p-3 bg-[#1b1c1e] border border-[#2e2d29] rounded-xl text-xs font-serif-sc text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382] leading-relaxed resize-none"
            />
          </div>

          {/* Optional: 30-Minute Darkroom Developing Mode */}
          <div className="p-3.5 bg-[#17181a] border border-[#2e2d27] rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-serif-sc text-[#f0ebd9] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#e6c382]" />
                <span>开启「30分钟暗房显影仪式」（拍完即放下手机）</span>
              </span>
              <span className="text-[11px] font-serif-sc text-[#8c8475] block leading-snug">
                记录完成后，明信片将在时间的暗房中显影30分钟方可揭开，避免陷入立刻刷屏与挑剔成片的惯性。
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableDarkroomDelay}
              onChange={(e) => setEnableDarkroomDelay(e.target.checked)}
              className="w-4 h-4 rounded accent-[#e6c382] cursor-pointer shrink-0"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 border-t border-[#252422] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif-sc text-[#8f887b] hover:text-[#ded8cb]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 bg-[#e6c382] hover:bg-[#ebd29b] active:scale-[0.98] disabled:opacity-40 text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? '生成中...' : '生成明信片并上架年鉴'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Somatic Awakening Studio Modal */}
      <SomaticAwakeningStudio
        isOpen={isSomaticModalOpen}
        onClose={() => setIsSomaticModalOpen(false)}
        initialAnchors={somaticAnchors}
        onApplyAnchors={(anchors) => setSomaticAnchors(anchors)}
      />
    </div>
  );
};
