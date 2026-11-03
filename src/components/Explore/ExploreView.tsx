import React, { useState } from 'react';
import { Search, Mic, QrCode, Flame, TrendingUp, Sparkles, Play, Users, Check, Plus, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TRENDING_TAGS } from '../../data/mockData';

export const ExploreView: React.FC = () => {
  const {
    videos,
    setActiveVideoIndex,
    setCurrentTab,
    showToast,
    toggleFollow,
    requestFollow,
    openUserProfile,
    liveRooms,
    joinLiveRoom,
    setIsSetupLiveModalOpen,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('الكل');

  const categories = [
    { label: 'الكل', key: 'all' },
    { label: 'شائع 🔥', key: 'trending' },
    { label: 'بث مباشر 🔴', key: 'live' },
    { label: 'تقنية ⚡', key: 'tech' },
    { label: 'طبخ 🍳', key: 'cooking' },
    { label: 'موسيقى 🎵', key: 'music' },
    { label: 'ألعاب 🎮', key: 'gaming' },
  ];

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.caption.includes(searchQuery) ||
      v.creator.name.includes(searchQuery) ||
      v.creator.username.includes(searchQuery) ||
      v.hashtags.some((t) => t.includes(searchQuery));
    return matchesSearch;
  });

  const handleSelectVideo = (videoId: string) => {
    const idx = videos.findIndex((v) => v.id === videoId);
    if (idx !== -1) {
      setActiveVideoIndex(idx);
      setCurrentTab('feed');
    }
  };

  return (
    <div className="w-full h-full bg-[#07090E] text-white overflow-y-auto pb-20 no-scrollbar">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-[#07090E]/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-white/10 space-y-3">
        <div className="relative flex items-center gap-2">
          {/* Search Input Box */}
          <div className="relative flex-1 flex items-center bg-white/5 border border-white/15 rounded-full px-3.5 py-2 focus-within:border-[#00F2FE] focus-within:shadow-[0_0_12px_rgba(0,242,254,0.3)] transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن فيديوهات، مبدعين، أو أصوات..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Voice Search */}
          <button
            onClick={() => showToast('البحث الصوتي قيد التفعيل 🎙️')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#00F2FE] transition-colors shrink-0 cursor-pointer"
            title="بحث صوتي"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* QR Scan */}
          <button
            onClick={() => showToast('فتح ماسح رمز الاستجابة السريعة (QR) 📷')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#FE2C55] transition-colors shrink-0 cursor-pointer"
            title="مسح QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.label
                  ? 'bg-neon-gradient text-white shadow-neon-glow'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Featured Challenge Hero Banner */}
        <div
          className="relative rounded-2xl overflow-hidden border border-[#00F2FE]/40 shadow-neon-glow group cursor-pointer"
          onClick={() => showToast('انضممت إلى تحدي صناع Tok Fxe 🌟')}
        >
          <img
            src="/src/assets/images/fextok_explore_banner_1793478781984.jpg"
            alt="Tok Fxe Creator Challenge"
            className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent flex flex-col justify-end p-4">
            <span className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FE2C55]" />
              التحدي الأسبوعي المميز
            </span>
            <h2 className="text-base font-extrabold text-white font-heading">
              #تحدي_توك_فيكس_2026
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              شارك موهبتك واصنع فيديو أو محتوى مميز للفوز بجوائز مجتمع Tok Fxe
            </p>
          </div>
        </div>

        {/* Dedicated Live Streams Section (قسم البث المباشر) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-white font-heading">البث المباشر الآن (LIVE)</h3>
            </div>
            <button
              onClick={() => setIsSetupLiveModalOpen(true)}
              className="text-xs text-[#00F2FE] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>ابدأ بثك</span>
            </button>
          </div>

          {/* Horizontal Live Cards Carousel */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {liveRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => joinLiveRoom(room.id)}
                className="min-w-[200px] w-[200px] aspect-9/14 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-[#00F2FE]/50 transition-all relative group cursor-pointer shrink-0 shadow-lg"
              >
                <img
                  src={room.coverUrl}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 flex flex-col justify-between p-3 text-right">
                  {/* LIVE Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center gap-1 shadow-md">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      LIVE
                    </span>

                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-emerald-400">
                      <Users className="w-2.5 h-2.5" />
                      {room.viewersCount}
                    </span>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight mb-1.5">
                      {room.title}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <img
                        src={room.host.avatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-[#00F2FE]"
                      />
                      <span className="text-[10px] text-slate-300 font-bold truncate">
                        {room.host.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Hashtags Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FE2C55]" />
              <h3 className="text-sm font-bold text-white font-heading">الهاشتاجات الأكثر رواجاً</h3>
            </div>
            <span
              className="text-xs text-[#00F2FE] hover:underline cursor-pointer"
              onClick={() => showToast('عرض كل الترندات')}
            >
              عرض الكل
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {TRENDING_TAGS.slice(0, 4).map((t, idx) => (
              <div
                key={idx}
                onClick={() => setSearchQuery(t.tag)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00F2FE]/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-[#00F2FE] transition-colors truncate">
                    {t.tag}
                  </span>
                  <Flame className="w-3.5 h-3.5 text-[#FE2C55]" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono tabular-nums">
                  {t.views} مشاهدة
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Creators Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00F2FE]" />
              <h3 className="text-sm font-bold text-white font-heading">صناع محتوى مقترحون</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {videos.map((vid) => (
              <div
                key={vid.creator.id}
                className="min-w-[130px] p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center shrink-0"
              >
                <div
                  onClick={() => openUserProfile(vid.creator)}
                  className="relative w-14 h-14 rounded-full p-0.5 bg-neon-gradient mb-2 shadow-md cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={vid.creator.avatar}
                    alt={vid.creator.name}
                    className="w-full h-full rounded-full object-cover border border-[#07090E]"
                  />
                  {vid.creator.isLive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#FE2C55] text-white text-[8px] font-black rounded-full shadow-sm">
                      LIVE
                    </span>
                  )}
                </div>
                <span
                  onClick={() => openUserProfile(vid.creator)}
                  className="text-xs font-bold text-white truncate max-w-[110px] cursor-pointer hover:text-[#00F2FE]"
                >
                  {vid.creator.name}
                </span>
                <span
                  onClick={() => openUserProfile(vid.creator)}
                  className="text-[10px] text-slate-400 font-mono truncate max-w-[110px] cursor-pointer hover:underline"
                >
                  @{vid.creator.username}
                </span>

                <button
                  onClick={() => requestFollow(vid.creator.id)}
                  className={`mt-2.5 w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    vid.creator.isFollowed
                      ? 'bg-white/10 text-slate-300'
                      : 'bg-neon-gradient text-white shadow-sm active:scale-95'
                  }`}
                >
                  {vid.creator.isFollowed ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>أتابعه</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>متابعة</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Video Discovery Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00F2FE]" />
              <h3 className="text-sm font-bold text-white font-heading">استكشف الفيديوهات</h3>
            </div>
            <span className="text-xs text-slate-400">{filteredVideos.length} فيديو</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleSelectVideo(video.id)}
                className="relative aspect-9/14 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group cursor-pointer shadow-lg"
              >
                <img
                  src={video.posterUrl}
                  alt={video.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                  <p className="text-[11px] font-medium text-white line-clamp-2 leading-snug">
                    {video.caption}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-300">
                    <span className="truncate max-w-[80px]">@{video.creator.username}</span>
                    <span className="flex items-center gap-1 font-mono text-[#00F2FE]">
                      <Play className="w-3 h-3 fill-current" />
                      {(video.viewsCount / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
