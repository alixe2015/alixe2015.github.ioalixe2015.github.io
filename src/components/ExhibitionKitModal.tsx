import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Building2, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Share2, 
  Download, 
  MapPin, 
  Volume2 
} from 'lucide-react';

interface ExhibitionKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExhibitionKitModal: React.FC<ExhibitionKitModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'video' | 'popup' | 'pitch' | 'poster'>('video');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const videoScriptText = `【60秒概念宣传片分镜脚本 · 《被我们遗忘的体温》】

[00:00 - 00:12] 镜头1（冷色调·现实困境）
画面：俯拍清晨地铁、深夜写字楼。无数张被屏幕蓝光照亮的疲惫面孔，手指在光滑无阻的电容玻璃上麻木滑动。屏幕上快速掠过海量AI自动总结、标准化的排版与浮夸滤镜。
旁白（沉稳、克制）：“在算力过剩的今天，AI能以毫秒级的速度写出最严密的逻辑、最写实的图景。但它永远不会感知，深秋雨水打湿裤脚时的微凉。”

[00:13 - 00:26] 镜头2（暖调切入·感官复苏）
画面：特写。一双冻得发白的手，紧紧握住一只粗陶热茶杯，热气袅袅升起，手心泛起微红；镜头切换至闭眼深呼吸，耳边传来风吹过枯树叶的沙沙声。
旁白：“真实的生活，从来都不在光滑的像素里。在杯壁传递给手心的温度里，在每一次心跳与呼吸的轻颤里。”

[00:27 - 00:44] 镜头3（产品核心·正反双面与心潮波形）
画面：主角用手机拍下一束穿透窗棂的晨光。翻转明信片，闭上眼睛对着麦克风轻声自白。屏幕上的原声波形如金色心潮般流淌。一张精致的纸质明信片从暗房中缓缓显影，右下角印上一枚专属声音二维码。
旁白：“「具身回响」——正面美化你的生活切片，反面录下你未经任何AI润色的真实嗓音。声音里的叹息、停顿与温存，是无法被算法压缩的高维人类信号。”

[00:45 - 00:60] 镜头4（终局升华·连接与年鉴）
画面：镜头来到一家暖光咖啡馆，另一位女孩从信箱中抽出这张明信片，用手机扫码，耳边响起主角那句真挚的声音。画面切换至年底，桌上厚厚一叠明信片与情绪脉络雷达。
旁白：“扫码倾听，让孤岛彼此相认。年中与年末，翻阅专属于你的肉身年鉴。在逻辑的时代，让我们做有体温的人。”
字幕：具身回响 · 恢复人本身对真实的感知`;

  const pitchText = `【一分钟电梯演讲 · 3句话讲透项目】

1. 痛点：AI时代，文字、图像和总结都可以被瞬间代劳，人类反而失去了肉身的感知力与共情能力，陷入屏幕的平滑催眠；
2. 解法：我们做了一个「每日具身感受明信片」——正面是生活切片的美化排版，反面是感官引导词与真实原声音频，通过在明信片上印制声音二维码，实现“扫码倾听那一刻的真实心潮”；
3. 愿景与商业闭环：沉淀用户一整年的情感脉络与雷达年鉴，同时提供「350g特种棉卡实体慢递寄送」与「线下咖啡馆声音信箱」，让真实纸张与原声重回人与人的连结。`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141517] border border-[#33312c] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <Building2 className="w-4 h-4 text-[#e6c382]" />
            <span>线下策展与推广物料包 · 让人真正理解我们的初衷与做法</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-[#242321] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-2 text-xs font-serif-sc whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'video' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8475] hover:text-[#ded8cb]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>60秒概念宣传片脚本</span>
            {activeTab === 'video' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e6c382]" />}
          </button>

          <button
            onClick={() => setActiveTab('popup')}
            className={`pb-3 px-2 text-xs font-serif-sc whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'popup' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8475] hover:text-[#ded8cb]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>咖啡馆/书店策展落地指南</span>
            {activeTab === 'popup' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e6c382]" />}
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`pb-3 px-2 text-xs font-serif-sc whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'pitch' ? 'text-[#f0ebd9] font-medium' : 'text-[#8c8475] hover:text-[#ded8cb]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1分钟电梯演讲</span>
            {activeTab === 'pitch' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e6c382]" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: Video Script */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif-sc font-medium text-[#f0ebd9]">
                    60秒短视频宣传片分镜脚本 · 《被我们遗忘的体温》
                  </h4>
                  <p className="text-xs text-[#8c8475] font-serif-sc">
                    可直接用于小红书、B站视频制作，或在线下投影循环播放
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(videoScriptText, 'video')}
                  className="px-3 py-1.5 bg-[#252420] hover:bg-[#332f28] border border-[#4d4436] rounded-lg text-xs font-serif-sc text-[#edd8b4] transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'video' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'video' ? '已复制全部分镜' : '一键复制脚本'}</span>
                </button>
              </div>

              <div className="bg-[#18191c] p-4 rounded-xl border border-[#2b2a26] text-xs font-serif-sc text-[#ded8cb] leading-relaxed whitespace-pre-line font-mono-data">
                {videoScriptText}
              </div>
            </div>
          )}

          {/* TAB 2: Offline Pop-up Guide */}
          {activeTab === 'popup' && (
            <div className="space-y-5">
              <div className="border-b border-[#242321] pb-3">
                <h4 className="text-base font-serif-sc font-medium text-[#f0ebd9]">
                  线下咖啡馆 / 独立书店「声音暗房信箱」合作策展提案
                </h4>
                <p className="text-xs text-[#8c8475] font-serif-sc">
                  如何与空间主理人沟通，以及如何以最低成本布置一个触动人心的实体角
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <span className="text-xs font-serif-sc text-[#e6c382] font-semibold block">
                    1. 空间装置设定：「具身回响角」
                  </span>
                  <ul className="text-xs font-serif-sc text-[#a89e8e] space-y-1.5 leading-relaxed">
                    <li>• <strong>位置</strong>：咖啡馆窗边角落或书店木桌，光线温润，远离收银台喧闹。</li>
                    <li>• <strong>物料</strong>：一台便携拍立得/相片打印机、一叠空白350g棉卡、一枚专属木质印章。</li>
                    <li>• <strong>信箱</strong>：一个名为「寄给陌生人的心潮」的双格木质信箱（投递格与盲抽格）。</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#18191c] border border-[#2b2a26] rounded-xl space-y-2">
                  <span className="text-xs font-serif-sc text-[#e6c382] font-semibold block">
                    2. 顾客互动仪式感：
                  </span>
                  <ul className="text-xs font-serif-sc text-[#a89e8e] space-y-1.5 leading-relaxed">
                    <li>• 扫码进入网页，用手机拍下店里的咖啡杯或书页，录下 15 秒原声。</li>
                    <li>• 系统自动生成带二维码的高清明信片排版，店员协助一键冲印。</li>
                    <li>• 盖上当日印章投进信箱，并可从信箱中随机抽取一张别人的卡片扫码倾听。</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#1a1916] border border-[#423a2d] rounded-xl space-y-2">
                <span className="text-xs font-serif-sc text-[#d4af37] font-semibold block">
                  3. 对店长主理人的合作话术（赢面分析）：
                </span>
                <p className="text-xs font-serif-sc text-[#ded8cb] leading-relaxed">
                  “店长您好，现在的年轻人进店往往各自看手机，缺乏真实的情感停留。我们搭建的这个‘声音暗房’不仅完全契合贵店的文艺人文调性，而且顾客留下的一张张真实照片与声音，会成为贵店独一无二的‘声音人文记忆库’。每位参与者扫码分享时，都会自发带上贵店的定位，形成极高粘性的真实自传播。”
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Elevator Pitch */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif-sc font-medium text-[#f0ebe1]">
                    1分钟电梯演讲稿 (Elevator Pitch)
                  </h4>
                  <p className="text-xs text-[#8c8475] font-serif-sc">
                    面对投资人、媒体或陌生人，在60秒内讲清核心价值
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(pitchText, 'pitch')}
                  className="px-3 py-1.5 bg-[#252420] hover:bg-[#332f28] border border-[#4d4436] rounded-lg text-xs font-serif-sc text-[#edd8b4] transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'pitch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'pitch' ? '已复制演讲稿' : '复制演讲'}</span>
                </button>
              </div>

              <div className="bg-[#18191c] p-5 rounded-xl border border-[#2b2a26] text-xs font-serif-sc text-[#ded8cb] leading-relaxed whitespace-pre-line">
                {pitchText}
              </div>
            </div>
          )}

          {/* Close Action */}
          <div className="pt-2 border-t border-[#242321] flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#e6c382] hover:bg-[#ebd29b] text-[#141416] rounded-lg text-xs font-serif-sc font-medium transition-colors"
            >
              了解完毕 · 开启线下分享
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
