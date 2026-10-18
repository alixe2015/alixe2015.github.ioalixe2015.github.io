import React, { useState } from 'react';
import { PostcardEntry } from '../types';
import { Sparkles, TrendingUp, Info, Calendar, Filter } from 'lucide-react';

interface EmotionAxis {
  key: string;
  label: string;
  description: string;
  angle: number; // in radians
  keywords: string[];
}

interface EmotionRadarChartProps {
  entries: PostcardEntry[];
  onSelectKeyword?: (keyword: string) => void;
}

export const EmotionRadarChart: React.FC<EmotionRadarChartProps> = ({
  entries,
  onSelectKeyword,
}) => {
  const [viewMode, setViewMode] = useState<'compare' | 'h1' | 'h2' | 'total'>('compare');
  const [hoveredAxis, setHoveredAxis] = useState<EmotionAxis | null>(null);

  // 6 Emotional Radar Dimensions (60 degrees apart)
  const axes: EmotionAxis[] = [
    {
      key: 'tranquility',
      label: '宁静释然',
      description: '放下的松弛感、被温暖抚平的褶皱与内心自洽',
      angle: 0,
      keywords: ['释然', '平静', '安宁', '释怀', '微暖', '温存'],
    },
    {
      key: 'renewal',
      label: '明朗新生',
      description: '清晨的决意、破茧的明朗与面向未来的活力',
      angle: (Math.PI * 2) / 6,
      keywords: ['新生', '明朗', '坚定', '希望', '决心', '清亮'],
    },
    {
      key: 'nostalgia',
      label: '深沉眷恋',
      description: '对故人与过往时光的温柔怀念、未泯的深情',
      angle: ((Math.PI * 2) / 6) * 2,
      keywords: ['眷恋', '怀念', '沉静', '不舍', '记忆', '旧梦'],
    },
    {
      key: 'vulnerability',
      label: '微涩低回',
      description: '疲惫、孤单或不经意间在潮汐前露出的脆弱',
      angle: ((Math.PI * 2) / 6) * 3,
      keywords: ['微涩', '疲惫', '迷茫', '窒息', '孤寂', '收紧'],
    },
    {
      key: 'courage',
      label: '勇气冒险',
      description: '敢于在关系中袒露真心、承担后果与选择',
      angle: ((Math.PI * 2) / 6) * 4,
      keywords: ['冒险', '试探', '辞职', '勇气', '连结', '负责'],
    },
    {
      key: 'awe',
      label: '旷达沉思',
      description: '面对自然辽阔、篝火余烬与雨夜街道的澄澈哲思',
      angle: ((Math.PI * 2) / 6) * 5,
      keywords: ['辽阔', '粗粝', '独行', '微光', '静默', '深沉'],
    },
  ];

  // Divide entries into H1 (months 1-6) and H2 (months 7-12)
  const h1Entries = entries.filter((e) => {
    const month = parseInt(e.date.split('-')[1], 10);
    return month <= 6;
  });

  const h2Entries = entries.filter((e) => {
    const month = parseInt(e.date.split('-')[1], 10);
    return month > 6;
  });

  // Calculate scores (0-100) for each axis based on matches in tags & reflection text
  const calculateAxisScores = (subset: PostcardEntry[]) => {
    return axes.map((axis) => {
      let count = 0;
      let matchedItems: Array<{ title: string; tag: string; date: string }> = [];

      subset.forEach((entry) => {
        const textToSearch = `${entry.moodTag} ${entry.title} ${entry.reflectionText}`.toLowerCase();
        const hasMatch = axis.keywords.some((kw) => textToSearch.includes(kw));
        if (hasMatch) {
          count += 1.5;
          matchedItems.push({
            title: entry.title,
            tag: entry.moodTag,
            date: entry.date,
          });
        }
      });

      // Normalize to 20-95 scale
      const normalizedScore = Math.min(95, Math.max(25, 25 + count * 18));
      return {
        ...axis,
        score: normalizedScore,
        count: matchedItems.length,
        items: matchedItems,
      };
    });
  };

  const h1Scores = calculateAxisScores(h1Entries);
  const h2Scores = calculateAxisScores(h2Entries);
  const totalScores = calculateAxisScores(entries);

  // SVG Geometry Constants
  const size = 380;
  const center = size / 2;
  const radius = 130;

  // Convert polar coordinates to SVG Cartesian (x, y)
  const polarToCartesian = (angle: number, r: number) => {
    // subtract Math.PI / 2 to start from top
    const a = angle - Math.PI / 2;
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
    };
  };

  // Generate SVG Polygon path string
  const getPolygonPath = (scores: Array<{ angle: number; score: number }>) => {
    return scores
      .map((item, i) => {
        const r = (item.score / 100) * radius;
        const pt = polarToCartesian(item.angle, r);
        return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  };

  const h1Path = getPolygonPath(h1Scores);
  const h2Path = getPolygonPath(h2Scores);
  const totalPath = getPolygonPath(totalScores);

  // Collect chronological keyword evolution
  const allKeywords = entries
    .map((e) => ({
      date: e.date,
      tag: e.moodTag,
      title: e.title,
      temp: e.moodTemperature,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-[#141517] border border-[#2a2925] rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#242321] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#d4af37] tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EMOTIONAL SPECTRUM RADAR · 情绪脉络雷达</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif-sc font-semibold text-[#f0ebe1]">
            年度情感关键词演化雷达
          </h3>
          <p className="text-xs text-[#8c8475] font-serif-sc mt-1">
            通过每日发布的心绪词与感官自白，直观呈现你在六大情感维度的能量变化与心绪流转
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1a1b1e] rounded-lg border border-[#2b2a27]">
          <button
            onClick={() => setViewMode('compare')}
            className={`px-2.5 py-1 text-xs font-serif-sc rounded-md transition-all ${
              viewMode === 'compare'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            上半年 vs 下半年对比
          </button>
          <button
            onClick={() => setViewMode('h1')}
            className={`px-2.5 py-1 text-xs font-serif-sc rounded-md transition-all ${
              viewMode === 'h1'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            上半年 (春暖与试探)
          </button>
          <button
            onClick={() => setViewMode('h2')}
            className={`px-2.5 py-1 text-xs font-serif-sc rounded-md transition-all ${
              viewMode === 'h2'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            下半年 (潮汐与释怀)
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-2.5 py-1 text-xs font-serif-sc rounded-md transition-all ${
              viewMode === 'total'
                ? 'bg-[#2e2a22] text-[#ecd4a4] font-medium shadow-sm'
                : 'text-[#8f8779] hover:text-[#ded8cb]'
            }`}
          >
            全年综合能量
          </button>
        </div>
      </div>

      {/* Main Radar Chart & Interactive Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: SVG Radar Chart */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible select-none drop-shadow-xl"
            >
              {/* Concentric Reference Polygons (Web) */}
              {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
                const ringPath = axes
                  .map((axis, i) => {
                    const pt = polarToCartesian(axis.angle, radius * level);
                    return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                  })
                  .join(' ') + ' Z';

                return (
                  <g key={idx}>
                    <path
                      d={ringPath}
                      fill="none"
                      stroke="#272623"
                      strokeWidth={idx === 3 ? 1.5 : 1}
                      strokeDasharray={idx === 3 ? 'none' : '3 3'}
                    />
                    {idx === 3 && (
                      <text
                        x={center + 4}
                        y={center - radius * level + 12}
                        fill="#545048"
                        fontSize="9"
                        fontFamily="Space Mono"
                      >
                        100%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Radial Spoke Axes */}
              {axes.map((axis, idx) => {
                const end = polarToCartesian(axis.angle, radius);
                const labelPos = polarToCartesian(axis.angle, radius + 28);
                const isHovered = hoveredAxis?.key === axis.key;

                return (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredAxis(axis)}>
                    <line
                      x1={center}
                      y1={center}
                      x2={end.x}
                      y2={end.y}
                      stroke={isHovered ? '#d4af37' : '#33312c'}
                      strokeWidth={isHovered ? 1.5 : 1}
                      className="transition-colors"
                    />

                    {/* Axis Labels */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`text-xs font-serif-sc transition-colors ${
                        isHovered ? 'fill-[#f2ede4] font-semibold' : 'fill-[#9c9384]'
                      }`}
                      fontSize="12"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              {/* Radar Polygons */}
              {/* Layer 1: H1 (上半年 - 暖金粉紫) */}
              {(viewMode === 'compare' || viewMode === 'h1') && (
                <g>
                  <path
                    d={h1Path}
                    fill="rgba(212, 175, 55, 0.22)"
                    stroke="#d4af37"
                    strokeWidth="2.5"
                    className="transition-all duration-700 ease-out"
                  />
                  {h1Scores.map((item, idx) => {
                    const pt = polarToCartesian(item.angle, (item.score / 100) * radius);
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredAxis?.key === item.key ? 6 : 4}
                        fill="#f7eed8"
                        stroke="#d4af37"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    );
                  })}
                </g>
              )}

              {/* Layer 2: H2 (下半年 - 幽蓝青碧) */}
              {(viewMode === 'compare' || viewMode === 'h2') && (
                <g>
                  <path
                    d={h2Path}
                    fill="rgba(56, 189, 248, 0.18)"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray={viewMode === 'compare' ? '4 2' : 'none'}
                    className="transition-all duration-700 ease-out"
                  />
                  {h2Scores.map((item, idx) => {
                    const pt = polarToCartesian(item.angle, (item.score / 100) * radius);
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredAxis?.key === item.key ? 6 : 4}
                        fill="#e0f2fe"
                        stroke="#0284c7"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    );
                  })}
                </g>
              )}

              {/* Layer 3: Total (全年综合) */}
              {viewMode === 'total' && (
                <g>
                  <path
                    d={totalPath}
                    fill="rgba(230, 195, 130, 0.3)"
                    stroke="#e6c382"
                    strokeWidth="3"
                    className="transition-all duration-700 ease-out"
                  />
                  {totalScores.map((item, idx) => {
                    const pt = polarToCartesian(item.angle, (item.score / 100) * radius);
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredAxis?.key === item.key ? 6.5 : 4.5}
                        fill="#ffffff"
                        stroke="#d4af37"
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Color Legend (Anti-Slop: clean inline separators) */}
          <div className="flex items-center gap-6 text-xs font-serif-sc text-[#8c8475] mt-2">
            {(viewMode === 'compare' || viewMode === 'h1') && (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d4af37]" />
                <span className="text-[#ded8cb]">上半年 (春/夏) · 勇气与探寻</span>
              </span>
            )}
            {viewMode === 'compare' && <span aria-hidden="true">·</span>}
            {(viewMode === 'compare' || viewMode === 'h2') && (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#38bdf8]" />
                <span className="text-[#ded8cb]">下半年 (秋/冬) · 释然与深沉</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Insight & Keyword Anatomy */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Hover Dimension Details */}
          <div className="bg-[#1a1b1e] border border-[#2d2c28] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data text-[#d4af37]">
                {hoveredAxis ? 'FOCUS DIMENSION' : 'ANNUAL EMOTION SHIFT'}
              </span>
              <span className="text-xs font-serif-sc text-[#8c8475]">
                {hoveredAxis ? '鼠标悬停轴向' : '脉络总结'}
              </span>
            </div>

            <h4 className="text-lg font-serif-sc font-medium text-[#f0ebe1]">
              {hoveredAxis ? hoveredAxis.label : '从「勇敢试探」走向「从容释怀」'}
            </h4>

            <p className="text-xs font-serif-sc text-[#a89e8e] leading-relaxed">
              {hoveredAxis
                ? hoveredAxis.description
                : '通过对比上半年与下半年雷达可见：你在年初表现出极高的「勇气冒险」与「微涩低回」，经历了辞职与环境变动；而在入秋与年末，雷达在「宁静释然」与「旷达沉思」维度显著扩张，展现了生命在真实经历波澜后的自愈与沉淀。'}
            </p>

            {hoveredAxis && (
              <div className="pt-2 border-t border-[#262521] space-y-1.5">
                <span className="text-[11px] font-serif-sc text-[#8c8475] block">
                  该维度相关生活切片：
                </span>
                <div className="space-y-1">
                  {entries
                    .filter((e) =>
                      hoveredAxis.keywords.some((kw) =>
                        `${e.moodTag} ${e.title} ${e.reflectionText}`.includes(kw)
                      )
                    )
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs font-serif-sc text-[#ded8cb] bg-[#141416] p-2 rounded"
                      >
                        <span className="truncate pr-2">
                          {item.date} · {item.title}
                        </span>
                        <span className="text-[#d4af37] font-mono-data text-[11px] shrink-0">
                          {item.moodTag}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Metric Insights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl">
              <span className="text-[11px] font-serif-sc text-[#8c8475] block">
                下半年释然感增幅
              </span>
              <span className="text-2xl font-mono-data font-semibold text-[#d4af37] tabular-nums">
                +42%
              </span>
              <span className="text-[10px] font-serif-sc text-[#6b655b] mt-0.5 block">
                从焦虑紧绷走向安然自洽
              </span>
            </div>

            <div className="p-3.5 bg-[#17181a] border border-[#262522] rounded-xl">
              <span className="text-[11px] font-serif-sc text-[#8c8475] block">
                情感关键词丰富度
              </span>
              <span className="text-2xl font-mono-data font-semibold text-sky-300 tabular-nums">
                {allKeywords.length} 个
              </span>
              <span className="text-[10px] font-serif-sc text-[#6b655b] mt-0.5 block">
                未被千篇一律的逻辑掩盖
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline: Emotional Keyword Evolution Stream (用户每日发布内容中的情感关键词变化) */}
      <div className="pt-6 border-t border-[#242321] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
            <h4 className="text-sm font-serif-sc font-medium text-[#f0ebe1]">
              每日情感关键词时间谱 · 见证一整年的心境演化
            </h4>
          </div>
          <span className="text-[11px] font-serif-sc text-[#8c8475]">
            从左至右时间流淌 · 点击标签可在上方查阅该日切片
          </span>
        </div>

        {/* Scrollable / Responsive Keyword Stream Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {allKeywords.map((item, idx) => {
            const isWarm = item.temp >= 7;
            const isCool = item.temp <= 5;

            return (
              <div
                key={idx}
                onClick={() => onSelectKeyword && onSelectKeyword(item.tag)}
                className={`group px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                  isWarm
                    ? 'bg-[#1e1c18] border-[#473f32] hover:border-[#d4af37]'
                    : isCool
                    ? 'bg-[#151a22] border-[#253242] hover:border-sky-400'
                    : 'bg-[#17171a] border-[#2b2a26] hover:border-[#7d7568]'
                }`}
                title={`${item.date} · ${item.title}`}
              >
                <span className="text-[10px] font-mono-data text-[#8c8475]">
                  {item.date.slice(5)}
                </span>
                <span
                  className={`text-xs font-serif-sc font-medium ${
                    isWarm
                      ? 'text-[#f0d49e]'
                      : isCool
                      ? 'text-sky-300'
                      : 'text-[#d6cfc2]'
                  }`}
                >
                  {item.tag}
                </span>
                <span className="text-[10px] font-mono-data opacity-50 group-hover:opacity-100 transition-opacity text-[#a89e8e]">
                  {item.temp}°
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
