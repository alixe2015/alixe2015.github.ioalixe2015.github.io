import React from 'react';
import { Sparkles, HeartPulse, ShieldCheck, Flame, Compass, Feather, Eye } from 'lucide-react';

interface PhilosophyViewProps {
  onStartToday: () => void;
}

export const PhilosophyView: React.FC<PhilosophyViewProps> = ({ onStartToday }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Editorial Title */}
      <div className="text-center space-y-3 pt-4">
        <span className="text-xs font-mono-data text-[#d4af37] tracking-widest uppercase">
          MANIFESTO FOR EMBODIED PRESENCE · 2026
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-sc font-bold text-[#f2ede4] leading-snug">
          在无所不能的 AI 时代，<br />
          重拾我们最稀缺的「具身经验」
        </h1>
        <p className="text-sm font-serif-sc text-[#9c9384] max-w-2xl mx-auto leading-relaxed">
          当生成式人工智能能够以毫秒级的速度写出结构严密、文采斐然的总结与高度写实的图像时，人类的核心价值究竟落在了何处？
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#161719] border border-[#2b2a26] rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#8c8475] uppercase tracking-wider">
            <span>DIS-EMBODIED ALGORITHMS</span>
          </div>
          <h3 className="text-lg font-serif-sc font-semibold text-[#bcb5a7]">
            AI 的世界：脱身计算与逻辑最优
          </h3>
          <ul className="space-y-3 text-xs font-serif-sc text-[#8c8475] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#a88243]">·</span>
              <span><strong>无限写实与总结</strong>：可以在瞬间抓取百万篇文献，吐出毫无破绽的结论与完美格式。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#a88243]">·</span>
              <span><strong>没有肉身的痛苦</strong>：它不懂被冷水冻麻指尖的刺痛，也不懂心跳骤停一秒的窒息感。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#a88243]">·</span>
              <span><strong>没有承担后果的风险</strong>：算法给出概率最高的建议，但它从不需要用自己的人生去承担代价。</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-[#1a1916] border border-[#a88243]/40 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono-data text-[#d4af37] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EMBODIED HUMANITY</span>
          </div>
          <h3 className="text-lg font-serif-sc font-semibold text-[#f5eedc]">
            人类的领地：具身经验与生命重量
          </h3>
          <ul className="space-y-3 text-xs font-serif-sc text-[#d4cbbe] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#e6c382]">·</span>
              <span><strong>具身经验 (Embodied Experience)</strong>：双脚陷在海沙里的冰凉、粗陶杯的微烫，真实空气中混杂的柴火香。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e6c382]">·</span>
              <span><strong>真实感受与微颤声音</strong>：声调里的哽咽、叹息与犹豫，那是任何文本提示词无法真正替代的生命振动。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e6c382]">·</span>
              <span><strong>关系中的冒险与价值选择</strong>：甘愿袒露脆弱、敢于为了一个非理性的誓言承担伤害与失去。</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 5 Pillars of Awakenings */}
      <div className="space-y-6">
        <h3 className="text-xl font-serif-sc font-semibold text-center text-[#f0ebe1]">
          「具身回响」想要为你唤醒的五种感受能力
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#141517] border border-[#272623] rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-700/40 flex items-center justify-center text-amber-300">
              <Feather className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de]">
              1. 触感与温差觉醒
            </h4>
            <p className="text-xs text-[#8c8475] font-serif-sc leading-relaxed">
              感知粗粝与柔软、冷冽与滚烫。让麻木在光滑屏幕上的指尖，重新抚摸真实的物质世界。
            </p>
          </div>

          <div className="p-5 bg-[#141517] border border-[#272623] rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-700/40 flex items-center justify-center text-rose-300">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de]">
              2. 呼吸与心跳脉搏
            </h4>
            <p className="text-xs text-[#8c8475] font-serif-sc leading-relaxed">
              在快门按下的那一刻，倾听内心的胸腔起伏。是屏息凝神，还是长舒了一口气？
            </p>
          </div>

          <div className="p-5 bg-[#141517] border border-[#272623] rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de]">
              3. 原声中的本真振动
            </h4>
            <p className="text-xs text-[#8c8475] font-serif-sc leading-relaxed">
              通过真实麦克风录下你的嗓音。声调高低、气口长短，胜过千百个打字排版的 emoji。
            </p>
          </div>

          <div className="p-5 bg-[#141517] border border-[#272623] rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-300">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de]">
              4. 允许未被修饰的脆弱
            </h4>
            <p className="text-xs text-[#8c8475] font-serif-sc leading-relaxed">
              明信片的反面不是为了给社交网络表演，而是留给自己直面未说出口的悸动与疲惫。
            </p>
          </div>

          <div className="p-5 bg-[#141517] border border-[#272623] rounded-xl space-y-2 sm:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-700/40 flex items-center justify-center text-orange-300">
              <Flame className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif-sc font-semibold text-[#ede8de]">
              5. 关系中的冒险与年末回响
            </h4>
            <p className="text-xs text-[#8c8475] font-serif-sc leading-relaxed">
              通过在明信片上印上二维码，让重要的人扫码倾听你的声音。并在年中或年末，静静看着自己这一年来心情起伏的真实年鉴——你不是冷冰冰的数据，你是活生生的人。
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-6">
        <button
          onClick={onStartToday}
          className="px-6 py-3 bg-[#e6c382] hover:bg-[#ebd29b] text-[#141416] rounded-xl text-sm font-serif-sc font-medium transition-transform active:scale-[0.98] shadow-lg"
        >
          开始记录我今日的切片与心声
        </button>
      </div>
    </div>
  );
};
