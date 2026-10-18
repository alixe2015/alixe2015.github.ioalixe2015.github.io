import React, { useState } from 'react';
import { PostcardEntry } from '../types';
import { 
  X, 
  Mail, 
  Check, 
  Sparkles, 
  Send, 
  Gift, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Brush, 
  Sliders, 
  Fingerprint,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HANDRAW_STYLES, HandrawStyle } from '../utils/handrawStyles';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface PhysicalOrderModalProps {
  postcard: PostcardEntry;
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicalOrderModal: React.FC<PhysicalOrderModalProps> = ({
  postcard,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [serviceType, setServiceType] = useState<'single' | 'future' | 'box'>('single');
  const [enableHandrawUpgrade, setEnableHandrawUpgrade] = useState<boolean>(true);
  const [selectedHandrawStyle, setSelectedHandrawStyle] = useState<HandrawStyle>(HANDRAW_STYLES[0]);
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  // Compute total price
  const basePrice = serviceType === 'single' ? 9.9 : serviceType === 'future' ? 12.9 : 49;
  const upgradePrice = enableHandrawUpgrade ? 12 : 0;
  const totalPrice = (basePrice + upgradePrice).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e6c382', '#f3d9a8', '#d4af37', '#e11d48'],
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141517] border border-[#33312c] rounded-2xl shadow-2xl overflow-hidden my-auto text-[#ded9ce]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242321] bg-[#101012]">
          <div className="flex items-center gap-2 text-xs font-serif-sc text-[#c7bead]">
            <Mail className="w-4 h-4 text-[#e6c382]" />
            <span>实体纸质明信片 · 专属声音慢递寄送与手绘装裱服务</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f887b] hover:text-[#ded8cb] hover:bg-[#252422] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isOrdered ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
            {/* Handraw Art Upgrade Showcase with Interactive Before/After Comparison */}
            <div className="bg-[#1b1c20] border border-[#3d382d] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#e6c382]/20 text-[#e6c382] border border-[#e6c382]/40">
                      FEATURED UPGRADE
                    </span>
                    <span className="text-xs font-serif-sc font-medium text-[#f5efe4]">
                      升级为 AI 艺术家手绘重塑版（基于 yang0/handraw-style 编号画廊）
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9c9586] font-serif-sc leading-relaxed">
                    去除日常随手拍的杂乱背景，提炼为水彩/版画艺术原作，采用 350g 德国哈内姆勒纯棉特种纸立体冲印。
                  </p>
                </div>

                {/* Upgrade Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setEnableHandrawUpgrade(!enableHandrawUpgrade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif-sc font-medium transition-all shrink-0 border flex items-center gap-1.5 ${
                    enableHandrawUpgrade
                      ? 'bg-[#e6c382] border-[#e6c382] text-[#141516] shadow-md shadow-[#e6c382]/20'
                      : 'bg-[#22242b] border-white/10 text-[#8c8577] hover:text-[#ded8cb]'
                  }`}
                >
                  <Brush className="w-3.5 h-3.5" />
                  <span>{enableHandrawUpgrade ? '已启用手绘升级 (+¥12)' : '未开启手绘 (+¥12)'}</span>
                </button>
              </div>

              {/* Before/After Split Comparison Slider */}
              {enableHandrawUpgrade && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-serif-sc text-[#a69e90]">
                    <span>左右拖动滑块，对比实拍原图与【{selectedHandrawStyle.name}】冲印效果：</span>
                    <span className="font-mono-data text-[#d4af37]">{selectedHandrawStyle.code}</span>
                  </div>

                  <BeforeAfterSlider
                    originalImage={postcard.imageUrl}
                    style={selectedHandrawStyle}
                    aspectRatio="aspect-[16/10]"
                  />

                  {/* 6 Handraw Style Quick Selector */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                    {HANDRAW_STYLES.map((st) => {
                      const isSelected = selectedHandrawStyle.id === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedHandrawStyle(st)}
                          className={`p-2 rounded-xl text-left border transition-all text-[11px] ${
                            isSelected
                              ? 'bg-[#24211a] border-[#e6c382] text-[#f5efe4] shadow-sm'
                              : 'bg-[#16171b] border-white/5 text-[#7a7469] hover:text-[#ded8cb]'
                          }`}
                        >
                          <span className="text-[9px] font-mono-data text-[#d4af37] block">
                            {st.code}
                          </span>
                          <span className="font-serif-sc font-medium truncate block mt-0.5">
                            {st.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Service Type Selection */}
            <div>
              <label className="block text-xs font-serif-sc text-[#c7bead] mb-2 font-medium">
                选择冲印与寄送方案：
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('single')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    serviceType === 'single'
                      ? 'border-[#e6c382] bg-[#221f1a] text-[#f0ebd9]'
                      : 'border-[#2d2a24] bg-[#16171a] text-[#8c8475] hover:text-[#ded8cb]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif-sc font-medium">单张精装寄出</span>
                    <span className="text-xs font-mono-data text-[#e6c382]">¥9.9</span>
                  </div>
                  <p className="text-[11px] font-serif-sc opacity-70">
                    寄给挚友或伴侣，含航空慢递邮票与火漆封印。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('future')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    serviceType === 'future'
                      ? 'border-[#e6c382] bg-[#221f1a] text-[#f0ebd9]'
                      : 'border-[#2d2a24] bg-[#16171a] text-[#8c8475] hover:text-[#ded8cb]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif-sc font-medium">时光胶囊 · 寄给年末的自己</span>
                    <span className="text-xs font-mono-data text-[#e6c382]">¥12.9</span>
                  </div>
                  <p className="text-[11px] font-serif-sc opacity-70">
                    系统保管封存，于 12 月 31 日寄达你的手中。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('box')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    serviceType === 'box'
                      ? 'border-[#e6c382] bg-[#221f1a] text-[#f0ebd9]'
                      : 'border-[#2d2a24] bg-[#16171a] text-[#8c8475] hover:text-[#ded8cb]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif-sc font-medium">年度原木画盒 (12张)</span>
                    <span className="text-xs font-mono-data text-[#e6c382]">¥49</span>
                  </div>
                  <p className="text-[11px] font-serif-sc opacity-70">
                    一整年的月度声音画册，附赠实木磁吸展示架。
                  </p>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                  收件人姓名或称谓：
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="如：林先生、远方的你、未来的自己..."
                  className="w-full px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-sc text-[#a89e8e] mb-1">
                  收件人邮寄地址 / 城市信箱：
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="省份、城市、街道门牌号或邮政信箱"
                  className="w-full px-3 py-2 bg-[#1b1c1e] border border-[#2e2d29] rounded-lg text-xs text-[#f0ebd9] focus:outline-none focus:ring-1 focus:ring-[#e6c382]"
                />
              </div>
            </div>

            {/* Security & Craft Note */}
            <div className="p-3 bg-[#161719] rounded-lg border border-[#242320] flex items-center justify-between text-[11px] font-serif-sc text-[#8c8475]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  采用 {enableHandrawUpgrade ? selectedHandrawStyle.paperType : '350g 日本特种风华棉卡'}，二维码永久绑定此段声音与生活切片。
                </span>
              </div>
            </div>

            {/* Submit & Price Bar */}
            <div className="pt-3 border-t border-[#242321] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-[#9c9586] font-serif-sc">应付总额:</span>
                <span className="text-xl font-mono-data font-bold text-[#e6c382]">
                  ¥{totalPrice}
                </span>
                {enableHandrawUpgrade && (
                  <span className="text-[10px] text-[#9c9586] font-serif-sc">
                    (含 AI 艺术家手绘重塑 + 特种纯棉水彩纸冲印)
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#e6c382] hover:bg-[#ebd29b] active:scale-[0.98] text-[#141416] rounded-xl text-xs font-serif-sc font-medium transition-all shadow-md flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>确认寄送 · 传递真实温度</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif-sc font-semibold text-[#f0ebd9]">
              寄送委托已成功受理
            </h3>
            <p className="text-xs font-serif-sc text-[#9c9584] max-w-md mx-auto leading-relaxed">
              明信片将印制上您的原声二维码、{enableHandrawUpgrade ? `【${selectedHandrawStyle.name}】手绘原画` : '生活切片照片'}与情绪指纹，送往：<br />
              <strong className="text-[#ded8cb]">{address || '指定收件信箱'}</strong> ({recipientName})
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsOrdered(false);
                  onClose();
                }}
                className="px-5 py-2 bg-[#2d2822] hover:bg-[#3d372e] text-[#f0ebd9] rounded-lg text-xs font-serif-sc transition-colors"
              >
                返回我的具身空间
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
