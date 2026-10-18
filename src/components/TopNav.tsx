import React from 'react';
import { Sparkles, Calendar, Disc3, Compass, Plus, Building2, Gift, Cloud, Wind } from 'lucide-react';

interface TopNavProps {
  activeTab: 'today' | 'archive' | 'voicereel' | 'philosophy';
  setActiveTab: (tab: 'today' | 'archive' | 'voicereel' | 'philosophy') => void;
  onOpenCreate: () => void;
  onOpenExhibitionKit?: () => void;
  onOpenShop: () => void;
  onOpenGoogleDrive: () => void;
  onOpenBreathwork?: () => void;
  entriesCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreate,
  onOpenShop,
  onOpenGoogleDrive,
  onOpenBreathwork,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0d0e]/90 backdrop-blur-md border-b border-[#222326]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div 
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-full bg-[#1e1c18] border border-[#d4af37]/40 flex items-center justify-center text-[#e8c37d] group-hover:border-[#e8c37d] transition-colors">
            <span className="font-serif-sc text-sm font-semibold">回</span>
          </div>
          <span className="font-serif-sc font-medium tracking-tight text-lg text-[#ede8de] group-hover:text-white transition-colors">
            具身回响
          </span>
          <span className="hidden sm:inline text-xs font-mono-data text-[#8a857b] tracking-wider ml-1">
            EMBODIED ECHO
          </span>
        </div>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-serif-sc tracking-wide text-[#9d978a]">
          <button
            onClick={() => setActiveTab('today')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeTab === 'today' ? 'text-[#f5ede0] font-semibold' : 'hover:text-[#ded8cb]'
            }`}
          >
            每日明信片
            {activeTab === 'today' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'archive' ? 'text-[#f5ede0] font-semibold' : 'hover:text-[#ded8cb]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>心情年鉴</span>
            <span className="text-[11px] font-mono-data text-[#d4af37] opacity-80">({entriesCount})</span>
            {activeTab === 'archive' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('voicereel')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'voicereel' ? 'text-[#f5ede0] font-semibold' : 'hover:text-[#ded8cb]'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5 opacity-70" />
            <span>声音胶卷</span>
            {activeTab === 'voicereel' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('philosophy')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'philosophy' ? 'text-[#f5ede0] font-semibold' : 'hover:text-[#ded8cb]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 opacity-70" />
            <span>具身宣言</span>
            {activeTab === 'philosophy' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenBreathwork && (
            <button
              onClick={onOpenBreathwork}
              className="px-2.5 py-2 text-xs font-serif-sc text-amber-200/90 bg-[#1e1c17] hover:bg-[#28251e] border border-amber-900/30 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="开启身心共振呼吸引导 (HRV / 4-7-8)"
            >
              <Wind className="w-3.5 h-3.5 text-[#e6c382]" />
              <span className="hidden sm:inline">呼吸定锚</span>
            </button>
          )}

          <button
            onClick={onOpenGoogleDrive}
            className="px-2.5 py-2 text-xs font-serif-sc text-blue-300 bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Google Drive 云端同步与安全备份"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Drive 备份</span>
          </button>

          <button
            onClick={onOpenShop}
            className="px-3 py-2 text-xs font-serif-sc text-[#edd8b4] bg-[#1e1c18] hover:bg-[#28241e] border border-[#473f32] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="查看实体冲印、年度画册与商业变现"
          >
            <Gift className="w-3.5 h-3.5 text-[#e6c382]" />
            <span>心绪商店</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 text-xs font-serif-sc font-medium tracking-wide text-[#141416] bg-[#e6c382] hover:bg-[#edd29b] active:scale-[0.98] rounded-lg transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>晒今日切片</span>
          </button>
        </div>
      </div>
    </header>
  );
};
