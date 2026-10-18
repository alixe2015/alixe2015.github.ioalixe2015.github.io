import React, { useState, useEffect } from 'react';
import { PostcardEntry, ResonanceComment } from './types';
import { INITIAL_POSTCARDS } from './data/seedData';
import { generatePostcardQR } from './utils/qrHelper';
import { TopNav } from './components/TopNav';
import { PostcardView } from './components/PostcardView';
import { ListenRoomModal } from './components/ListenRoomModal';
import { CreatePostcardModal } from './components/CreatePostcardModal';
import { YearRetrospective } from './components/YearRetrospective';
import { VoiceReelView } from './components/VoiceReelView';
import { PhilosophyView } from './components/PhilosophyView';
import { HeroOrbitView } from './components/HeroOrbitView';
import { CircularCarousel } from './components/CircularCarousel';
import { EmbodiedShopModal } from './components/EmbodiedShopModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SensoryDock } from './components/SensoryDock';
import { SomaticBreathworkModal } from './components/SomaticBreathworkModal';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Calendar, BookOpen, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'embodied_echo_postcards_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'archive' | 'voicereel' | 'philosophy'>('today');
  const [heroDisplayMode, setHeroDisplayMode] = useState<'circular' | 'orbit'>('circular');
  const [postcards, setPostcards] = useState<PostcardEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return INITIAL_POSTCARDS;
  });

  const [currentPostcardIndex, setCurrentPostcardIndex] = useState(0);
  const [listenRoomEntry, setListenRoomEntry] = useState<PostcardEntry | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isBreathworkModalOpen, setIsBreathworkModalOpen] = useState(false);
  const [isScreenAuraActive, setIsScreenAuraActive] = useState(false);

  // Generate QR codes for all postcards on load if not already generated
  useEffect(() => {
    const initQRs = async () => {
      let changed = false;
      const updated = await Promise.all(
        postcards.map(async (card) => {
          if (!card.qrCodeDataUrl) {
            const qr = await generatePostcardQR(card.id);
            changed = true;
            return { ...card, qrCodeDataUrl: qr };
          }
          return card;
        })
      );
      if (changed) {
        setPostcards(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
    };
    initQRs();
  }, []);

  // Check URL query parameters for ?listen=id to handle real QR code mobile scanning!
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const listenId = params.get('listen');
      if (listenId) {
        const found = postcards.find((p) => p.id === listenId);
        if (found) {
          setListenRoomEntry(found);
        }
      }
    } catch {}
  }, [postcards]);

  // Save to localStorage whenever postcards state changes
  const savePostcards = (updated: PostcardEntry[]) => {
    setPostcards(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  };

  const handleUpdatePostcard = (updatedCard: PostcardEntry) => {
    const updated = postcards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
    savePostcards(updated);
  };

  const handleAddPostcard = (newCard: PostcardEntry) => {
    const updated = [newCard, ...postcards];
    savePostcards(updated);
    setCurrentPostcardIndex(0);
    setActiveTab('today');
  };

  const handleAddResonance = (postcardId: string, resonance: ResonanceComment) => {
    const updated = postcards.map((card) => {
      if (card.id === postcardId) {
        return {
          ...card,
          listenCount: (card.listenCount || 0) + 1,
          resonances: [resonance, ...card.resonances],
        };
      }
      return card;
    });
    savePostcards(updated);
    if (listenRoomEntry && listenRoomEntry.id === postcardId) {
      setListenRoomEntry({
        ...listenRoomEntry,
        listenCount: (listenRoomEntry.listenCount || 0) + 1,
        resonances: [resonance, ...listenRoomEntry.resonances],
      });
    }
  };

  const currentPostcard = postcards[currentPostcardIndex] || postcards[0];

  const handleNextPostcard = () => {
    setCurrentPostcardIndex((prev) => (prev + 1) % postcards.length);
  };

  const handlePrevPostcard = () => {
    setCurrentPostcardIndex((prev) => (prev - 1 + postcards.length) % postcards.length);
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#e6e4df] flex flex-col selection:bg-[#d4af37]/30">
      {/* Strict 3-zone Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenShop={() => setIsShopModalOpen(true)}
        onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
        onOpenBreathwork={() => setIsBreathworkModalOpen(true)}
        entriesCount={postcards.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-12">
        {activeTab === 'today' && currentPostcard && (
          <div className="space-y-10 animate-fade-in">
            {/* Showcase Mode Header Switcher */}
            <div className="flex items-center justify-between border-b border-[#22211e] pb-3 text-xs font-serif-sc">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span className="text-[#ede8de] font-medium">展台展示形态 (Showcase Effect)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#141519] p-1 rounded-xl border border-[#272832]">
                <button
                  onClick={() => setHeroDisplayMode('circular')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    heroDisplayMode === 'circular'
                      ? 'bg-[#e6c382] text-[#141416] font-semibold shadow-sm'
                      : 'text-[#8a8477] hover:text-[#ded8cb]'
                  }`}
                >
                  <span>🌀 3D 环形胶卷 (ReactBits)</span>
                </button>
                <button
                  onClick={() => setHeroDisplayMode('orbit')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    heroDisplayMode === 'orbit'
                      ? 'bg-[#e6c382] text-[#141416] font-semibold shadow-sm'
                      : 'text-[#8a8477] hover:text-[#ded8cb]'
                  }`}
                >
                  <span>🪐 浮空引力星轨</span>
                </button>
              </div>
            </div>

            {/* 3D Showcase Stage: ReactBits Circular Carousel or Classic Hero Orbit */}
            {heroDisplayMode === 'circular' ? (
              <CircularCarousel
                postcards={postcards}
                onSelectPostcard={(selected) => {
                  const idx = postcards.findIndex((p) => p.id === selected.id);
                  if (idx !== -1) {
                    setCurrentPostcardIndex(idx);
                    const el = document.getElementById('postcard-stage');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onOpenListenRoom={(selected) => setListenRoomEntry(selected)}
                onOpenShop={() => setIsShopModalOpen(true)}
                onOpenCreate={() => setIsCreateModalOpen(true)}
              />
            ) : (
              <HeroOrbitView
                postcards={postcards}
                onSelectPostcard={(selected) => {
                  const idx = postcards.findIndex((p) => p.id === selected.id);
                  if (idx !== -1) {
                    setCurrentPostcardIndex(idx);
                    const el = document.getElementById('postcard-stage');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onOpenListenRoom={(selected) => setListenRoomEntry(selected)}
                onOpenCreate={() => setIsCreateModalOpen(true)}
                onGoToArchive={() => setActiveTab('archive')}
              />
            )}

            {/* Postcard Interactive Stage */}
            <div id="postcard-stage" className="pt-6 space-y-6">
              {/* Header intro banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#22211e] pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-data text-[#d4af37] tracking-wider uppercase">
                    <span>DAILY EMBODIED MOMENT</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentPostcard.date}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif-sc font-bold text-[#ede8de] mt-1">
                    当前明信片 · 正反双面感知
                  </h2>
                  <p className="text-xs text-[#9c9384] font-serif-sc mt-1">
                    正面美化心情与下载明信片，反面录下声音与感官；扫右下角二维码，随时倾听这一刻的心潮
                  </p>
                </div>

                {/* Day Switcher Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-data text-[#8a8376] mr-1">
                    {currentPostcardIndex + 1} / {postcards.length}
                  </span>
                  <button
                    onClick={handlePrevPostcard}
                    title="上一张明信片"
                    className="p-2 bg-[#1b1b1e] hover:bg-[#25252a] border border-[#302e2a] rounded-lg text-[#ded8cb] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPostcard}
                    title="下一张明信片"
                    className="p-2 bg-[#1b1b1e] hover:bg-[#25252a] border border-[#302e2a] rounded-lg text-[#ded8cb] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The 3D Flippable Postcard with Front & Back */}
              <PostcardView
                postcard={currentPostcard}
                onOpenListenRoom={(entry) => setListenRoomEntry(entry)}
                onUpdatePostcard={handleUpdatePostcard}
                onOpenShop={() => setIsShopModalOpen(true)}
                onOpenBreathwork={() => setIsBreathworkModalOpen(true)}
              />
            </div>

            {/* Bottom Insight Strip */}
            <div className="pt-6 border-t border-[#1e1d1b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-serif-sc text-[#8c8475]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>
                  为何在图片上放置二维码？因为声音中的叹息、停顿与温差，是无法被文本压缩的高维人类信号。
                </span>
              </div>
              <button
                onClick={() => setActiveTab('philosophy')}
                className="text-[#ecd8b5] hover:text-white transition-colors underline underline-offset-4 shrink-0"
              >
                阅读具身宣言 →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <YearRetrospective
            entries={postcards}
            onSelectEntry={(entry) => {
              const idx = postcards.findIndex((p) => p.id === entry.id);
              if (idx !== -1) {
                setCurrentPostcardIndex(idx);
                setActiveTab('today');
              }
            }}
            onOpenListenRoom={(entry) => setListenRoomEntry(entry)}
          />
        )}

        {activeTab === 'voicereel' && (
          <VoiceReelView
            entries={postcards}
            onSelectEntry={(entry) => {
              const idx = postcards.findIndex((p) => p.id === entry.id);
              if (idx !== -1) {
                setCurrentPostcardIndex(idx);
                setActiveTab('today');
              }
            }}
            onUpdatePostcard={handleUpdatePostcard}
          />
        )}

        {activeTab === 'philosophy' && (
          <PhilosophyView
            onStartToday={() => {
              setActiveTab('today');
              setIsCreateModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Create & Listen Room Modals */}
      <CreatePostcardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddPostcard={handleAddPostcard}
      />

      <ListenRoomModal
        postcard={listenRoomEntry}
        onClose={() => setListenRoomEntry(null)}
        onAddResonance={handleAddResonance}
        onUpdatePostcard={handleUpdatePostcard}
      />


      {/* Embodied Monetization & Physical Shop Modal */}
      <EmbodiedShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        postcards={postcards}
      />

      {/* Google Drive Cloud Backup & Restore Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        postcards={postcards}
        onRestorePostcards={(restored) => {
          savePostcards(restored);
          setCurrentPostcardIndex(0);
        }}
      />

      {/* Somatic Deep Breathwork Modal */}
      <SomaticBreathworkModal
        isOpen={isBreathworkModalOpen}
        onClose={() => setIsBreathworkModalOpen(false)}
        isScreenAuraActive={isScreenAuraActive}
        onToggleScreenAura={setIsScreenAuraActive}
      />

      {/* Floating Embodied Sensory Dock (Ambient Soundscape Mixer & Breathwork Pod) */}
      <SensoryDock
        onOpenFullBreathwork={() => setIsBreathworkModalOpen(true)}
        isScreenAuraActive={isScreenAuraActive}
        onToggleScreenAura={setIsScreenAuraActive}
      />

      {/* Footer */}
      <footer className="border-t border-[#1a1b1e] py-6 text-center text-xs font-serif-sc text-[#6b665c]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>具身回响 · 在逻辑与算力时代，守护人类肉身的温度与心潮</span>
          <div className="flex items-center gap-4 text-[#8a8376] font-mono-data text-[11px]">
            <span>LOCAL MEMORY SAFE</span>
            <span aria-hidden="true">/</span>
            <span>2026 EMBODIED ECHO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
