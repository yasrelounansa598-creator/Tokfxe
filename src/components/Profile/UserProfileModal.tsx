import React, { useState } from 'react';
import {
  X,
  Share2,
  MoreVertical,
  ShieldAlert,
  Ban,
  UserCheck,
  UserPlus,
  MessageCircle,
  Phone,
  Video as VideoIcon,
  Lock,
  Grid,
  Image as ImageIcon,
  FileText,
  Heart,
  Play,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VideoItem } from '../../types';

export const UserProfileModal: React.FC = () => {
  const {
    selectedUserProfile,
    closeUserProfile,
    videos,
    requestFollow,
    startCall,
    setActiveConversationId,
    setCurrentTab,
    openReportModal,
    blockUser,
    showToast,
    setActiveVideoIndex,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'videos' | 'photos' | 'posts' | 'liked'>('videos');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!selectedUserProfile) return null;

  const user = selectedUserProfile;

  // Filter posts created by this user
  const userVideos = videos.filter(
    (v) => (v.creator.id === user.id || v.creator.username === user.username) && (!v.mediaType || v.mediaType === 'video')
  );

  const userPhotos = videos.filter(
    (v) => (v.creator.id === user.id || v.creator.username === user.username) && v.mediaType === 'image'
  );

  const userPosts = videos.filter(
    (v) => (v.creator.id === user.id || v.creator.username === user.username) && v.mediaType === 'text'
  );

  const userLiked = videos.filter((v) => v.isLiked);

  // Check if account is private and locked
  const isLocked = Boolean(user.isPrivate && !user.isFollowed);

  // Handle Send Direct Message
  const handleOpenChat = () => {
    setActiveConversationId('conv-1'); // Opens chat or sets active conversation
    closeUserProfile();
    setCurrentTab('inbox');
    showToast(`تم فتح المحادثة المباشرة مع ${user.name}`);
  };

  // Handle Play Video
  const handlePlayVideo = (vid: VideoItem) => {
    const idx = videos.findIndex((v) => v.id === vid.id);
    if (idx !== -1) {
      setActiveVideoIndex(idx);
    }
    closeUserProfile();
    setCurrentTab('feed');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={closeUserProfile}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          title="رجوع"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-white font-heading">
            {user.name}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">@{user.username}</span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast(`تم نسخ رابط ملف @${user.username} 🔗`);
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            title="مشاركة الملف"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            title="المزيد من الخيارات"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Options Dropdown */}
          {showOptionsDropdown && (
            <div className="absolute top-11 left-0 z-50 w-48 bg-[#0E131F] border border-white/15 rounded-2xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setShowOptionsDropdown(false);
                  openReportModal('user', user.id);
                }}
                className="w-full px-4 py-2.5 text-right text-xs font-bold text-amber-400 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>إبلاغ عن هذا الحساب</span>
              </button>

              <button
                onClick={() => {
                  setShowOptionsDropdown(false);
                  blockUser(user);
                  closeUserProfile();
                }}
                className="w-full px-4 py-2.5 text-right text-xs font-bold text-red-400 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>حظر المستخدم</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Scrollable Profile Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Cover Photo */}
        <div className="relative h-36 sm:h-44 w-full bg-gradient-to-br from-[#0E131F] via-[#1F293D] to-black overflow-hidden">
          <img
            src={user.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-black/30" />
        </div>

        {/* User Info & Avatar */}
        <div className="relative px-4 text-center -mt-14">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full p-1 ${user.isLive ? 'bg-gradient-to-tr from-red-600 via-[#FE2C55] to-amber-500 shadow-[0_0_20px_rgba(254,44,85,0.7)] animate-pulse' : 'bg-gradient-to-tr from-[#00F2FE] via-[#7928CA] to-[#FE2C55] shadow-neon-glow'}`}>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#07090E]"
              />
            </div>
            {user.isVerified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#00F2FE] text-[#07090E] text-xs font-bold flex items-center justify-center border-2 border-[#07090E]">
                ✓
              </span>
            )}
            {user.isLive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full shadow-lg">
                LIVE
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-extrabold text-white font-heading">
              {user.name}
            </h2>
            {user.isPrivate && (
              <span className="p-1 rounded-full bg-white/10 text-slate-300" title="حساب خاص">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">@{user.username}</p>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 py-4 border-b border-white/5 my-2">
            <div className="text-center">
              <div className="text-sm font-black text-white font-mono tabular-nums">
                {user.followingCount ?? 142}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">أتابع</div>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="text-center">
              <div className="text-sm font-black text-white font-mono tabular-nums text-[#00F2FE]">
                {((user.followersCount || 1000) / 1000).toFixed(1)}k
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">المتابعون</div>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="text-center">
              <div className="text-sm font-black text-white font-mono tabular-nums text-[#FE2C55]">
                {((user.likesCount || 54000) / 1000).toFixed(1)}k
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">الإعجابات</div>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="text-center">
              <div className="text-sm font-black text-white font-mono tabular-nums">
                {user.postsCount ?? (userVideos.length + userPhotos.length + userPosts.length || 8)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">المنشورات</div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-slate-200 leading-relaxed font-arabic max-w-sm mx-auto px-4 mt-1">
            {user.bio || 'صانع محتوى في مجتمع Tok Fxe 🚀✨'}
          </p>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-2 mt-4 px-4 flex-wrap">
            {/* Follow / Requested / Unfollow button */}
            <button
              onClick={() => requestFollow(user.id)}
              className={`flex-1 min-w-[120px] max-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
                user.isFollowed
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                  : user.followStatus === 'requested'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-gradient-to-r from-[#00F2FE] via-[#7928CA] to-[#FE2C55] text-white shadow-[0_0_15px_rgba(0,242,254,0.3)]'
              }`}
            >
              {user.isFollowed ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>تتابعه</span>
                </>
              ) : user.followStatus === 'requested' ? (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>تم إرسال الطلب</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{user.isPrivate ? 'طلب متابعة' : 'متابعة'}</span>
                </>
              )}
            </button>

            {/* Direct Message button */}
            <button
              onClick={handleOpenChat}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#00F2FE]" />
              <span>مراسلة</span>
            </button>

            {/* Voice Call button */}
            <button
              onClick={() => startCall(user, 'voice')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white hover:text-emerald-400 transition-all active:scale-95 cursor-pointer"
              title="اتصال صوتي"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Video Call button */}
            <button
              onClick={() => startCall(user, 'video')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white hover:text-[#00F2FE] transition-all active:scale-95 cursor-pointer"
              title="مكالمة فيديو"
            >
              <VideoIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Private Account Lock Warning */}
        {isLocked ? (
          <div className="mt-8 mx-4 p-8 rounded-3xl bg-[#0E131F] border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00F2FE]/20 via-[#7928CA]/20 to-[#FE2C55]/20 border border-white/10 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(121,40,202,0.2)]">
              <Lock className="w-8 h-8 text-[#00F2FE]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-heading">
                هذا الحساب خاص 🔒
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {user.followStatus === 'requested'
                  ? 'تم إرسال طلب المتابعة بنجاح! بانتظار موافقة صاحب الحساب لرؤية الفيديوهات والصور.'
                  : 'تابع هذا الحساب لرؤية مقاطع الفيديو والصور والمنشورات اليومية.'}
              </p>
            </div>

            <button
              onClick={() => requestFollow(user.id)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#7928CA] to-[#FE2C55] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,242,254,0.4)] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              {user.followStatus === 'requested' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>إلغاء طلب المتابعة</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إرسال طلب متابعة</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Unlocked Content Tabs */
          <div className="mt-6 border-t border-white/10">
            {/* Tabs Header */}
            <div className="flex items-center justify-around border-b border-white/10 bg-[#07090E]">
              {/* Tab 1: Videos */}
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'videos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>فيديوهات</span>
                {activeTab === 'videos' && (
                  <span className="absolute bottom-0 inset-x-4 h-0.5 bg-neon-gradient rounded-full" />
                )}
              </button>

              {/* Tab 2: Photos */}
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'photos' ? 'text-[#00F2FE]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>صور</span>
                {activeTab === 'photos' && (
                  <span className="absolute bottom-0 inset-x-4 h-0.5 bg-[#00F2FE] rounded-full" />
                )}
              </button>

              {/* Tab 3: Posts */}
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'posts' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>منشورات</span>
                {activeTab === 'posts' && (
                  <span className="absolute bottom-0 inset-x-4 h-0.5 bg-[#7928CA] rounded-full" />
                )}
              </button>

              {/* Tab 4: Liked */}
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'liked' ? 'text-[#FE2C55]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'fill-current' : ''}`} />
                <span>المعجب بها</span>
                {activeTab === 'liked' && (
                  <span className="absolute bottom-0 inset-x-4 h-0.5 bg-[#FE2C55] rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-1">
              {/* Videos Grid */}
              {activeTab === 'videos' && (
                <div>
                  {userVideos.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <Grid className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs">لم يقم {user.name} بنشر أي مقاطع فيديو بعد.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {userVideos.map((vid) => (
                        <div
                          key={vid.id}
                          onClick={() => handlePlayVideo(vid)}
                          className="relative aspect-[3/4] bg-slate-900 overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={vid.posterUrl}
                            alt={vid.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[11px] font-bold text-white font-mono pointer-events-none">
                            <Play className="w-3 h-3 fill-white" />
                            <span>{((vid.viewsCount || 1000) / 1000).toFixed(0)}k</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery Grid */}
              {activeTab === 'photos' && (
                <div>
                  {userPhotos.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs">لا توجد صور منشورة في هذا الملف.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {userPhotos.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setLightboxImage(item.posterUrl)}
                          className="relative aspect-square bg-slate-900 overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/60 backdrop-blur-xs text-white">
                            <Layers className="w-3 h-3" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[11px] font-bold text-white font-mono pointer-events-none">
                            <Heart className="w-3 h-3 text-[#FE2C55] fill-current" />
                            <span>{((item.likesCount || 100) / 1000).toFixed(1)}k</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Posts Cards */}
              {activeTab === 'posts' && (
                <div className="p-3 space-y-3">
                  {userPosts.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs">لم يشارك {user.name} أي منشورات نصية بعد.</p>
                    </div>
                  ) : (
                    userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-[#00F2FE]/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-100 leading-relaxed font-arabic">
                          {post.textContent || post.caption}
                        </p>
                        <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-[#FE2C55]" />
                            <span>{post.likesCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{post.commentsCount}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Liked Items */}
              {activeTab === 'liked' && (
                <div>
                  <div className="p-3 text-center text-[11px] text-slate-400 bg-white/5 rounded-xl mx-2 mb-2">
                    🔒 قائمة الإعجابات تظهر المقاطع العامة المسموح بها فقط
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {userLiked.slice(0, 6).map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => handlePlayVideo(vid)}
                        className="relative aspect-[3/4] bg-slate-900 overflow-hidden group cursor-pointer"
                      >
                        <img
                          src={vid.posterUrl}
                          alt={vid.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[11px] font-bold text-white font-mono pointer-events-none">
                          <Heart className="w-3 h-3 text-[#FE2C55] fill-current" />
                          <span>{((vid.likesCount || 1000) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
