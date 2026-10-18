import React, { useState } from 'react';
import { PostcardEntry, SensoryDimension } from '../types';
import { 
  Calendar, 
  Flame, 
  HeartPulse, 
  HandMetal, 
  Wind, 
  Sparkles, 
  Share2, 
  Volume2, 
  ChevronRight, 
  Download,
  Filter
} from 'lucide-react';
import { EmotionRadarChart } from './EmotionRadarChart';

interface YearRetrospectiveProps {
  entries: PostcardEntry[];
  onSelectEntry: (entry: PostcardEntry) => void;
  onOpenListenRoom: (entry: PostcardEntry) => void;
}

export const YearRetrospective: React.FC<YearRetrospectiveProps> = ({
  entries,
  onSelectEntry,
  onOpenListenRoom,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'mid-year' | 'year-end'>('all');

  // Filter entries based on period
  const filteredEntries = entries.filter((e) => {
    if (timeFilter === 'mid-year') {
      const month = parseInt(e.date.split('-')[1], 10);
      return month <= 6;
    }
    if (timeFilter === 'year-end') {
      const month = parseInt(e.date.split('-')[1], 10);
      return month > 6;
    }
    return true;
  });

  // Calculate sensory distribution
  const sensoryCounts: Record<SensoryDimension, number> = {
    tactile: 0,
    breath: 0,
    scent: 0,
    unspoken: 0,
    adventure: 0,
  };

  let totalTemp = 0;
  filteredEntries.forEach((e) => {
    if (e.sensoryDimension) sensoryCounts[e.sensoryDimension]++;
    totalTemp += e.moodTemperature || 7;
  });

  const avgTemp = filteredEntries.length > 0 ? (totalTemp / filteredEntries.length).toFixed(1) : '7.2';
  const totalAudios = filteredEntries.filter((e) => e.audioUrl).length;
  const totalListens = filteredEntries.reduce((acc, curr) => acc + (curr.listenCount || 0), 0);

  const dimensionLabels: Record<SensoryDimension, { name: string; icon: typeof Flame; color: string }> = {
    tactile: { name: '触觉与温度', icon: HandMetal, color: 'text-amber-400' },
    breath: { name: '呼吸与心跳', icon: HeartPulse, color: 'text-rose-400' },
    scent: { name: '气味与氛围', icon: Wind, color: 'text-emerald-400' },
    unspoken: { name: '隐秘的情绪', icon: Sparkles, color: 'text-indigo-400' },
    adventure: { name: '关系中的冒险', icon: Flame, color: 'text-orange-400' },
  };

  // Mock monthly temperature wave points
  const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月'];
  const monthScores = [8.5, 6.2, 5.8, 5.0, 7.4, 6.8, 8.0];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#242321] pb-6">
        <div>
          <span className="text-xs font-mono-data text-[#d4af37] tracking-wider uppercase">
            ANNUAL EMBODIED MEMOIR · 2026
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-sc font-semibold text-[#f0ebe1] mt-1">
            心情年鉴 · 具身心绪变化轨迹
          </h2>
          <p className="text-xs text-[#8c8475] font-serif-sc mt-1">
            AI 生成了一万页严谨的报告，而这里珍藏着你肉身真实经历过的温度与颤动
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#18191c] rounded-lg border border-[#2b2a27]">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-md transition-colors ${
              timeFilter === 'all'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            整年全览
          </button>
          <button
            onClick={() => setTimeFilter('mid-year')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-md transition-colors ${
              timeFilter === 'mid-year'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            年中回望 (1-6月)
          </button>
          <button
            onClick={() => setTimeFilter('year-end')}
            className={`px-3 py-1.5 text-xs font-serif-sc rounded-md transition-colors ${
              timeFilter === 'year-end'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            年末盘点 (7-12月)
          </button>
        </div>
      </div>

      {/* Hero Stats Row (Anti-Slop: clean typography, no pill badges) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[#141517] border border-[#2a2925] rounded-xl">
          <span className="text-xs font-serif-sc text-[#8c8475] block mb-1">已留存具身切片</span>
          <div className="text-3xl font-mono-data font-semibold text-[#f0ebe1] tabular-nums">
            {filteredEntries.length} <span className="text-sm font-serif-sc text-[#8c8475]">天</span>
          </div>
          <span className="text-[11px] font-serif-sc text-[#a89e8e] mt-1 block">平均每周记录 3.2 次身体触感</span>
        </div>

        <div className="p-5 bg-[#141517] border border-[#2a2925] rounded-xl">
          <span className="text-xs font-serif-sc text-[#8c8475] block mb-1">年度心绪平均温度</span>
          <div className="text-3xl font-mono-data font-semibold text-[#d4af37] tabular-nums">
            {avgTemp}° <span className="text-sm font-serif-sc text-[#8c8475]">暖调</span>
          </div>
          <span className="text-[11px] font-serif-sc text-[#a89e8e] mt-1 block">从春日的微涩到深秋的释然</span>
        </div>

        <div className="p-5 bg-[#141517] border border-[#2a2925] rounded-xl">
          <span className="text-xs font-serif-sc text-[#8c8475] block mb-1">原声回响总时长</span>
          <div className="text-3xl font-mono-data font-semibold text-[#f0ebe1] tabular-nums">
            105 <span className="text-sm font-serif-sc text-[#8c8475]">秒</span>
          </div>
          <span className="text-[11px] font-serif-sc text-[#a89e8e] mt-1 block">录下真实呼吸、叹息与语调</span>
        </div>

        <div className="p-5 bg-[#141517] border border-[#2a2925] rounded-xl">
          <span className="text-xs font-serif-sc text-[#8c8475] block mb-1">扫码倾听共鸣数</span>
          <div className="text-3xl font-mono-data font-semibold text-rose-300 tabular-nums">
            {totalListens} <span className="text-sm font-serif-sc text-[#8c8475]">次</span>
          </div>
          <span className="text-[11px] font-serif-sc text-[#a89e8e] mt-1 block">在这个孤岛世界里的真实连结</span>
        </div>
      </div>

      {/* Interactive Annual Emotion Radar Chart */}
      <EmotionRadarChart
        entries={entries}
        onSelectKeyword={(keyword) => {
          const match = entries.find((e) =>
            `${e.moodTag} ${e.title} ${e.reflectionText}`.includes(keyword)
          );
          if (match) {
            onSelectEntry(match);
          }
        }}
      />

      {/* Mood Temperature Fluctuations Chart */}
      <div className="p-6 bg-[#141517] border border-[#2a2925] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif-sc font-medium text-[#f0ebe1]">
              心绪温度波动曲线 · 情绪的有机波澜
            </h3>
            <p className="text-xs text-[#8c8475] font-serif-sc">
              AI追求稳定的逻辑，而人类的生命力正在于时而低回、时而丰盈的心情起伏
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#d4af37]">2026 MOOD RHYTHM</span>
        </div>

        {/* Minimalist SVG Curve Line */}
        <div className="h-44 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
            {/* Soft grid lines */}
            <line x1="0" y1="20" x2="700" y2="20" stroke="#252422" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="700" y2="60" stroke="#252422" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="700" y2="100" stroke="#252422" strokeDasharray="3 3" />

            {/* Gradient Area under curve */}
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Path */}
            <path
              d="M 50,25 C 130,55 180,68 250,75 C 320,85 360,35 440,40 C 520,50 580,30 650,28"
              fill="none"
              stroke="#e6c382"
              strokeWidth="2.5"
            />
            <path
              d="M 50,25 C 130,55 180,68 250,75 C 320,85 360,35 440,40 C 520,50 580,30 650,28 L 650,110 L 50,110 Z"
              fill="url(#moodGrad)"
            />

            {/* Highlight Points */}
            {[
              { x: 50, y: 25, label: '4月 · 辞职决心 (8.5°)' },
              { x: 250, y: 75, label: '7月 · 海边深呼吸 (5.0°)' },
              { x: 440, y: 40, label: '8月 · 重获安宁 (7.4°)' },
              { x: 650, y: 28, label: '10月 · 陶杯之温 (8.0°)' },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#f5eedc" stroke="#a88243" strokeWidth="2" />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#c7bead"
                  fontSize="10"
                  fontFamily="Space Mono"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] font-serif-sc text-[#8c8475] pt-2 border-t border-[#22211e]">
          <span>初春：直面未知与内心的试探</span>
          <span>盛夏：在冰冷海水中重拾具身感知</span>
          <span>深秋：在粗陶杯与落叶脉络中体会踏实与安宁</span>
        </div>
      </div>

      {/* Sensory Radar Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#141517] border border-[#2a2925] rounded-xl space-y-4">
          <h3 className="text-base font-serif-sc font-medium text-[#f0ebe1]">
            五大具身感知觉醒度
          </h3>
          <p className="text-xs text-[#8c8475] font-serif-sc">
            你在哪些感官维度上找回了被数字世界钝化的知觉？
          </p>

          <div className="space-y-3 pt-2">
            {(Object.keys(dimensionLabels) as SensoryDimension[]).map((dimKey) => {
              const info = dimensionLabels[dimKey];
              const count = sensoryCounts[dimKey];
              const percentage = Math.min(100, Math.max(15, (count / (filteredEntries.length || 1)) * 100));

              return (
                <div key={dimKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-serif-sc">
                    <span className="text-[#ded8cb] flex items-center gap-1.5">
                      <info.icon className={`w-3.5 h-3.5 ${info.color}`} />
                      {info.name}
                    </span>
                    <span className="font-mono-data text-[#8c8475]">{count} 次记录</span>
                  </div>
                  <div className="h-2 w-full bg-[#1e1e21] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d4af37] transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Embodied Philosophy Reflection Note */}
        <div className="p-6 bg-[#141517] border border-[#2a2925] rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-serif-sc text-[#d4af37] tracking-wider uppercase block mb-1">
              年度心语 · 具身之重
            </span>
            <h3 className="text-lg font-serif-sc font-semibold text-[#f0ebe1] leading-relaxed">
              “机器计算概率，而人类承担后果；算法模拟共情，而你用肉身经历岁月。”
            </h3>
            <p className="text-xs text-[#9c9384] font-serif-sc mt-3 leading-relaxed">
              这一年来，当你放下无休止的信息流与AI对话框，走入雨中握紧热茶，或是踩进冰冷的潮汐，那些瞬间并不是无意义的空白——它们是你作为鲜活人类，最不可替代的证明。
            </p>
          </div>

          <div className="pt-4 border-t border-[#242321] flex items-center justify-between">
            <span className="text-xs font-mono-data text-[#8c8475]">
              YEAR ARCHIVE COMPILED
            </span>
            <button
              onClick={() => {
                alert('已生成 2026 年度具身年鉴摘要！随时可翻阅或打印保存。');
              }}
              className="px-3.5 py-1.5 bg-[#252421] hover:bg-[#302e29] border border-[#423d33] rounded-lg text-xs font-serif-sc text-[#ecd8b5] transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存心绪报告</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All Postcards in this Period */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif-sc font-medium text-[#f0ebe1]">
          切片长廊 · 点击查看明信片或倾听原声
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="group bg-[#141517] border border-[#272623] hover:border-[#a88243] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono-data text-[#ecd4a4]">
                  {entry.date}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-serif-sc text-[#a88243] block mb-0.5">
                    {entry.moodTag} · {entry.location}
                  </span>
                  <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de] group-hover:text-[#f3dfb8] transition-colors">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-[#8c8475] font-serif-sc mt-1.5 line-clamp-2 leading-relaxed">
                    “{entry.reflectionText}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#22211e] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono-data text-[#8c8475] flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#d4af37]" />
                    {entry.audioDuration}s 原声
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenListenRoom(entry);
                    }}
                    className="text-[11px] font-serif-sc text-[#ecd8b5] hover:text-white flex items-center gap-1"
                  >
                    <span>倾听</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
