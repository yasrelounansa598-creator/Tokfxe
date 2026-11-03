import React, { useState } from 'react';
import { Radio, Search, Tv, ChevronUp, ChevronDown, Flame, Play, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VideoCard } from './VideoCard';
import { CommentDrawer } from './CommentDrawer';
import { ShareDrawer } from './ShareDrawer';
import { SoundDrawer } from './SoundDrawer';
import { FeedSubTab } from '../../types';
import { TokFxeLogo } from '../Common/TokFxeLogo';
import { BrandIdentityModal } from '../Common/BrandIdentityModal';

export const FeedView: React.FC = () => {
  const {
    videos,
    activeVideoIndex,
    setActiveVideoIndex,
    feedSubTab,
    setFeedSubTab,
    setCurrentTab,
    setIsSetupLiveModalOpen,
    liveRooms,
    joinLiveRoom,
    showToast,
    userProfile,
    isAuthenticated,
  } = useApp();

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Filter videos based on active tab, privacy rules, and blocked users
  const displayedVideos = videos.filter((v) => {
    // Exclude blocked creators
    const isBlocked = userProfile?.securitySettings?.blockedUsers?.some(
      (b) => b.id === v.creator.id || b.username === v.creator.username
    );
    if (isBlocked) return false;

    // Privacy rules
    const isMine = v.creator.id === userProfile.id || v.creator.id === 'me';
    if (!isMine) {
      if (v.privacy === 'private') return false;
      if (v.privacy === 'followers' && !v.creator.isFollowed) return false;
    }

    if (feedSubTab === 'following') return v.creator.isFollowed;
    if (feedSubTab === 'friends') return v.isFriend;
    return true; // 'foryou'
  });

  const handleNext = () => {
    if (displayedVideos.length === 0) return;
    if (activeVideoIndex < displayedVideos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    } else {
      setActiveVideoIndex(0);
    }
  };

  const handlePrev = () => {
    if (displayedVideos.length === 0) return;
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    } else {
      setActiveVideoIndex(displayedVideos.length - 1);
    }
  };

  // Touch swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const currentVideo = displayedVideos[activeVideoIndex] || displayedVideos[0];

  const tabs: { id: FeedSubTab; label: string }[] = [
    { id: 'foryou', label: 'لك' },
    { id: 'following', label: 'المتابعون' },
    { id: 'friends', label: 'الأصدقاء' },
    { id: 'live', label: 'مباشر 🔴' },
  ];

  return (
    <div
      className="relative w-full h-full bg-[#07090E] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar with Tok Fxe Brand, 4 Tabs, and Go Live button */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3 pb-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Right side in RTL: Tok Fxe Neon Logo */}
        <div className="shrink-0 flex items-center">
          <TokFxeLogo
            size="sm"
            onClick={() => setIsBrandModalOpen(true)}
            className="cursor-pointer"
          />
        </div>

        {/* Center Tabs: لك | المتابعون | الأصدقاء | مباشر */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFeedSubTab(tab.id);
                setActiveVideoIndex(0);
              }}
              className={`text-xs sm:text-sm font-bold transition-all relative py-1 cursor-pointer whitespace-nowrap ${
                feedSubTab === tab.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {feedSubTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-neon-gradient rounded-full shadow-[0_0_8px_#FE2C55]" />
              )}
            </button>
          ))}
        </div>

        {/* Left Action: Start Live Stream / Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                showToast('يجب تسجيل الدخول أو إنشاء حساب لبدء بث مباشر 🔴');
                setCurrentTab('auth');
                return;
              }
              setIsSetupLiveModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/60 text-white text-[11px] font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95 transition-all cursor-pointer"
            title="بدء بث مباشر"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden xs:inline">بث مباشر</span>
          </button>

          <button
            onClick={() => setCurrentTab('explore')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="البحث"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content: If "مباشر" tab is selected, show Active Live Streams Directory */}
      {feedSubTab === 'live' ? (
        <div className="w-full h-full pt-16 pb-16 px-4 overflow-y-auto no-scrollbar bg-[#07090E]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-white font-heading">
                البثوث المباشرة الآن ({liveRooms.length})
              </h3>
            </div>
            <button
              onClick={() => setIsSetupLiveModalOpen(true)}
              className="text-xs text-[#00F2FE] hover:underline font-bold"
            >
              + ابدأ بثك الخاص
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {liveRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => joinLiveRoom(room.id)}
                className="relative aspect-9/14 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group cursor-pointer shadow-lg hover:border-[#00F2FE]/50 transition-all"
              >
                <img
                  src={room.coverUrl}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 flex flex-col justify-between p-3.5 text-right">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Radio className="w-3 h-3 animate-pulse" />
                      LIVE
                    </span>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400">
                      <Users className="w-3 h-3" />
                      {room.viewersCount}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed mb-2">
                      {room.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-white/15">
                      <div className="flex items-center gap-2">
                        <img
                          src={room.host.avatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-[#00F2FE]"
                        />
                        <span className="text-[11px] font-bold text-slate-200">
                          {room.host.name}
                        </span>
                      </div>

                      <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {room.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Full-screen Vertical Video View */
        <div className="w-full h-full">
          {currentVideo ? (
            <VideoCard video={currentVideo} isActive={true} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <p>لا توجد مقاطع فيديو في هذا التبويب حالياً.</p>
              <button
                onClick={() => setFeedSubTab('foryou')}
                className="mt-3 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                العودة إلى تبويب لك
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vertical Navigation Pill Helpers for Desktop */}
      {feedSubTab !== 'live' && displayedVideos.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg cursor-pointer"
            title="الفيديو السابق"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg cursor-pointer"
            title="الفيديو التالي"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Slide-Up Drawers & Modals */}
      <CommentDrawer />
      <ShareDrawer />
      <SoundDrawer />
      <BrandIdentityModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
    </div>
  );
};
