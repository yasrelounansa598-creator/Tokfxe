import React, { useState, useRef } from 'react';
import {
  Grid,
  Heart,
  Bookmark,
  Radio,
  Edit3,
  Share2,
  Play,
  X,
  ExternalLink,
  Settings,
  Film,
  Clock,
  Tv,
  Image as ImageIcon,
  FileText,
  Lock,
  Globe,
  Users,
  Trash2,
  MoreVertical,
  Shield,
  Camera,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VideoItem, StreamReplay } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateProfile,
    videos,
    setActiveVideoIndex,
    setCurrentTab,
    showToast,
    setIsSetupLiveModalOpen,
    setIsSettingsModalOpen,
    setIsFollowersModalOpen,
    setFollowersModalType,
    followRequests,
    setIsFollowRequestsModalOpen,
    changePostPrivacy,
    deletePost,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'videos' | 'photos' | 'posts' | 'replays' | 'liked'>('videos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReplay, setSelectedReplay] = useState<StreamReplay | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activePostOptions, setActivePostOptions] = useState<VideoItem | null>(null);

  // Edit form state
  const [name, setName] = useState(userProfile.name);
  const [username, setUsername] = useState(userProfile.username);
  const [bio, setBio] = useState(userProfile.bio);
  const [website, setWebsite] = useState(userProfile.website);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [coverImage, setCoverImage] = useState(userProfile.coverImage || '');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Filter user posts
  const myVideos = videos.filter(
    (v) => (v.creator.id === userProfile.id || v.creator.id === 'me') && (!v.mediaType || v.mediaType === 'video')
  );

  const myPhotos = videos.filter(
    (v) => (v.creator.id === userProfile.id || v.creator.id === 'me') && v.mediaType === 'image'
  );

  const myThoughtPosts = videos.filter(
    (v) => (v.creator.id === userProfile.id || v.creator.id === 'me') && v.mediaType === 'text'
  );

  const likedVideos = videos.filter((v) => v.isLiked);
  const replays = userProfile.replays || [];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      showToast('تم اختيار الصورة الشخصية الجديدة');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
      showToast('تم اختيار صورة الغلاف الجديدة');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, username, bio, website, avatar, coverImage });
    setIsEditModalOpen(false);
    showToast('تم تحديث ملفك الشخصي بنجاح ✨');
  };

  const handleOpenVideo = (video: VideoItem) => {
    const idx = videos.findIndex((v) => v.id === video.id);
    if (idx !== -1) {
      setActiveVideoIndex(idx);
      setCurrentTab('feed');
    }
  };

  return (
    <div className="w-full h-full bg-[#07090E] text-white overflow-y-auto pb-24 no-scrollbar">
      {/* Profile Header & Cover */}
      <div className="relative">
        <div className="h-32 sm:h-40 w-full overflow-hidden bg-slate-900">
          <img
            src={userProfile.coverImage || '/src/assets/images/fextok_explore_banner_1793478781984.jpg'}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent" />
        </div>

        {/* Settings button in top left */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
          title="الإعدادات والخصوصية"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Live Broadcast Trigger */}
        <button
          onClick={() => setIsSetupLiveModalOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95 transition-all cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>بدء بث مباشر</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative -mt-14 flex flex-col items-center">
          <div className={`relative w-24 h-24 rounded-full p-1 ${userProfile.isLive ? 'bg-gradient-to-tr from-red-600 via-[#FE2C55] to-amber-500 shadow-[0_0_20px_rgba(254,44,85,0.7)] animate-pulse' : 'bg-gradient-to-tr from-[#00F2FE] via-[#7928CA] to-[#FE2C55] shadow-neon-glow'}`}>
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#07090E]"
            />
            {userProfile.isVerified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#00F2FE] text-[#07090E] text-xs font-bold flex items-center justify-center border-2 border-[#07090E]">
                ✓
              </span>
            )}
            {userProfile.isLive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full shadow-lg">
                LIVE
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <h2 className="text-base font-extrabold text-white font-heading">
              {userProfile.name}
            </h2>
            {userProfile.securitySettings?.isPrivateAccount && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-white/10">
                <Lock className="w-3 h-3 text-[#00F2FE]" />
                <span>حساب خاص</span>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">@{userProfile.username}</span>
        </div>
      </div>

      {/* Pending Follow Requests Banner (if any) */}
      {followRequests.length > 0 && (
        <div className="mx-4 mt-3">
          <div
            onClick={() => setIsFollowRequestsModalOpen(true)}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#00F2FE]/20 via-[#7928CA]/20 to-[#FE2C55]/20 border border-[#00F2FE]/40 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.15)] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00F2FE]/20 flex items-center justify-center border border-[#00F2FE]/40 text-[#00F2FE]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  لديك {followRequests.length} طلبات متابعة جديدة
                </span>
                <span className="text-[10px] text-slate-300">
                  انقر هنا لمراجعة الطلبات والقبول أو الرفض
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#00F2FE] text-[#07090E] text-xs font-black font-mono">
              {followRequests.length}
            </span>
          </div>
        </div>
      )}

      {/* Stats Counter Row: المتابعون / أتابع / المنشورات */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 py-4 border-b border-white/5 my-2">
        <div
          className="text-center cursor-pointer group"
          onClick={() => {
            setFollowersModalType('following');
            setIsFollowersModalOpen(true);
          }}
        >
          <div className="text-sm font-black text-white font-mono tabular-nums group-hover:text-[#FE2C55] transition-colors">
            {userProfile.followingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">أتابع</div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div
          className="text-center cursor-pointer group"
          onClick={() => {
            setFollowersModalType('followers');
            setIsFollowersModalOpen(true);
          }}
        >
          <div className="text-sm font-black text-white font-mono tabular-nums group-hover:text-[#00F2FE] transition-colors">
            {(userProfile.followersCount / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">المتابعون</div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="text-center">
          <div className="text-sm font-black text-white font-mono tabular-nums">
            {myVideos.length + myPhotos.length + myThoughtPosts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">المنشورات</div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="text-center">
          <div className="text-sm font-black text-white font-mono tabular-nums">
            {(userProfile.likesCount / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">الإعجابات</div>
        </div>
      </div>

      {/* Bio and Links */}
      <div className="px-6 text-center space-y-2">
        <p className="text-xs text-slate-200 leading-relaxed font-arabic max-w-sm mx-auto">
          {userProfile.bio}
        </p>

        {userProfile.website && (
          <a
            href={`https://${userProfile.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#00F2FE] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{userProfile.website}</span>
          </a>
        )}

        {/* Action Buttons: تعديل الملف الشخصي / تسجيل الدخول / مشاركة الحساب */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          {!isAuthenticated && (
            <button
              onClick={() => {
                setCurrentTab('auth');
              }}
              className="px-4 py-2 rounded-xl bg-tokfxe-gradient text-white text-xs font-bold shadow-neon-glow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تسجيل الدخول / إنشاء حساب</span>
            </button>
          )}

          <button
            onClick={() => {
              setName(userProfile.name);
              setUsername(userProfile.username);
              setBio(userProfile.bio);
              setWebsite(userProfile.website);
              setAvatar(userProfile.avatar);
              setCoverImage(userProfile.coverImage || '');
              setIsEditModalOpen(true);
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل الملف الشخصي</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('تم نسخ رابط ملفك الشخصي في Tok Fxe 🔗');
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all active:scale-95 cursor-pointer"
            title="مشاركة الملف"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Content Grid Tabs as requested: فيديوهات / صور / منشورات / تسجيلات البث / المعجب بها */}
      <div className="mt-6 border-t border-white/10">
        <div className="flex items-center justify-around border-b border-white/10 bg-[#07090E]">
          {/* Tab 1: Videos */}
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 text-xs font-bold relative transition-colors cursor-pointer ${
              activeTab === 'videos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="فيديوهاتي"
          >
            <Grid className="w-4 h-4" />
            <span>الفيديوهات</span>
            {activeTab === 'videos' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-neon-gradient rounded-full" />
            )}
          </button>

          {/* Tab 2: Photos */}
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 text-xs font-bold relative transition-colors cursor-pointer ${
              activeTab === 'photos' ? 'text-[#00F2FE]' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="صوري"
          >
            <ImageIcon className="w-4 h-4" />
            <span>الصور</span>
            {activeTab === 'photos' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#00F2FE] rounded-full" />
            )}
          </button>

          {/* Tab 3: Posts */}
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 text-xs font-bold relative transition-colors cursor-pointer ${
              activeTab === 'posts' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="منشوراتي"
          >
            <FileText className="w-4 h-4" />
            <span>المنشورات</span>
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#7928CA] rounded-full" />
            )}
          </button>

          {/* Tab 4: Saved Live Replays */}
          <button
            onClick={() => setActiveTab('replays')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 text-xs font-bold relative transition-colors cursor-pointer ${
              activeTab === 'replays' ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="تسجيلات البث"
          >
            <Tv className="w-4 h-4" />
            <span>التسجيلات</span>
            {activeTab === 'replays' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Tab 5: Liked */}
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 text-xs font-bold relative transition-colors cursor-pointer ${
              activeTab === 'liked' ? 'text-[#FE2C55]' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="المعجب بها"
          >
            <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'fill-current' : ''}`} />
            <span>الإعجابات</span>
            {activeTab === 'liked' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#FE2C55] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Videos Grid */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-3 gap-1 p-1">
            {myVideos.length > 0 ? (
              myVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleOpenVideo(video)}
                  className="relative aspect-[3/4] bg-slate-900 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={video.posterUrl}
                    alt={video.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Privacy badge */}
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white flex items-center gap-0.5">
                    {video.privacy === 'private' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                    {video.privacy === 'followers' && <Users className="w-2.5 h-2.5 text-[#00F2FE]" />}
                    {(!video.privacy || video.privacy === 'public') && <Globe className="w-2.5 h-2.5 text-slate-300" />}
                  </div>

                  {/* Options button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePostOptions(video);
                    }}
                    className="absolute top-1 left-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-1 text-[10px] text-white font-mono drop-shadow-md pointer-events-none">
                    <Play className="w-3 h-3 fill-white" />
                    <span>{(video.viewsCount / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 text-center text-slate-500 text-xs">
                لم تقم بنشر أي مقاطع فيديو بعد. اضغط على زر الإنشاء (+) لنشر أول فيديو!
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Photos Gallery */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-1 p-1">
            {myPhotos.length > 0 ? (
              myPhotos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxImage(item.posterUrl)}
                  className="relative aspect-square bg-slate-900 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={item.posterUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-1 right-1 p-1 rounded-md bg-black/60 backdrop-blur-xs text-white">
                    <Layers className="w-3 h-3" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePostOptions(item);
                    }}
                    className="absolute top-1 left-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-1 text-[10px] text-white font-mono pointer-events-none">
                    <Heart className="w-3 h-3 text-[#FE2C55] fill-current" />
                    <span>{(item.likesCount / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 text-center text-slate-500 text-xs">
                لا توجد صور منشورة بعد. يمكنك نشر ألبومات صور عبر زر الإنشاء (+).
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Text Posts / Thoughts */}
        {activeTab === 'posts' && (
          <div className="p-3 space-y-3">
            {myThoughtPosts.length > 0 ? (
              myThoughtPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={userProfile.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-[#00F2FE]/30"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{userProfile.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300">
                        {post.privacy === 'private' ? '🔒 خاص' : post.privacy === 'followers' ? '👥 متابعون' : '🌐 عام'}
                      </span>
                      <button
                        onClick={() => setActivePostOptions(post)}
                        className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-arabic">
                    {post.textContent || post.caption}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                لم تشارك أي منشورات نصية بعد. يمكنك مشاركة خواطرك وأفكارك من زر الإنشاء (+).
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Saved Live Replays */}
        {activeTab === 'replays' && (
          <div className="p-3 space-y-3">
            {replays.length > 0 ? (
              replays.map((replay) => (
                <div
                  key={replay.id}
                  onClick={() => setSelectedReplay(replay)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 cursor-pointer hover:border-red-500/40 transition-colors"
                >
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img src={replay.coverUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{replay.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{replay.date} · المدة {replay.duration}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-300">
                      <span>👁️ {(replay.viewsCount / 1000).toFixed(0)}k مشاهدة</span>
                      <span className="text-[#00F2FE]">💎 {replay.diamondsEarned} ماسة</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                لا توجد تسجيلات بث مباشر محفوظة بعد. عند إنهاء البث يمكنك حفظ التسجيل هنا.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Liked */}
        {activeTab === 'liked' && (
          <div className="grid grid-cols-3 gap-1 p-1">
            {likedVideos.length > 0 ? (
              likedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleOpenVideo(video)}
                  className="relative aspect-[3/4] bg-slate-900 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={video.posterUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-1 text-[10px] text-white font-mono drop-shadow-md pointer-events-none">
                    <Heart className="w-3 h-3 fill-[#FE2C55] text-[#FE2C55]" />
                    <span>{(video.likesCount / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 text-center text-slate-500 text-xs">
                لم تسجل إعجابك بأي محتوى بعد.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Privacy & Options Modal */}
      {activePostOptions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0E1424] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-right animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white font-heading">خيارات المنشور والخصوصية</h3>
              <button
                onClick={() => setActivePostOptions(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-xs text-slate-400 block mb-2">تحديد من يمكنه رؤية هذا المنشور:</span>

              {/* Public */}
              <button
                onClick={() => {
                  changePostPrivacy(activePostOptions.id, 'public');
                  setActivePostOptions(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  (!activePostOptions.privacy || activePostOptions.privacy === 'public')
                    ? 'bg-[#00F2FE]/15 border-[#00F2FE] text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00F2FE]" />
                  <div className="text-right">
                    <span className="text-xs font-bold block">عام (متاح للجميع)</span>
                    <span className="text-[10px] text-slate-400">يظهر في خلاصة الاستكشاف والملف الشخصي</span>
                  </div>
                </div>
                {(!activePostOptions.privacy || activePostOptions.privacy === 'public') && (
                  <span className="text-xs font-bold text-[#00F2FE]">✓</span>
                )}
              </button>

              {/* Followers only */}
              <button
                onClick={() => {
                  changePostPrivacy(activePostOptions.id, 'followers');
                  setActivePostOptions(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activePostOptions.privacy === 'followers'
                    ? 'bg-[#7928CA]/20 border-[#7928CA] text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#7928CA]" />
                  <div className="text-right">
                    <span className="text-xs font-bold block">المتابعون فقط</span>
                    <span className="text-[10px] text-slate-400">يظهر فقط للأشخاص الذين يتابعونك</span>
                  </div>
                </div>
                {activePostOptions.privacy === 'followers' && (
                  <span className="text-xs font-bold text-purple-400">✓</span>
                )}
              </button>

              {/* Private */}
              <button
                onClick={() => {
                  changePostPrivacy(activePostOptions.id, 'private');
                  setActivePostOptions(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activePostOptions.privacy === 'private'
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div className="text-right">
                    <span className="text-xs font-bold block">خاص (أنا فقط)</span>
                    <span className="text-[10px] text-slate-400">مخفي تماماً ولن يظهر لأي مستخدم آخر</span>
                  </div>
                </div>
                {activePostOptions.privacy === 'private' && (
                  <span className="text-xs font-bold text-amber-400">✓</span>
                )}
              </button>
            </div>

            {/* Delete Post */}
            <button
              onClick={() => {
                deletePost(activePostOptions.id);
                setActivePostOptions(null);
              }}
              className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف هذا المنشور نهائياً</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#0E1424] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-right max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white font-heading">تعديل الملف الشخصي</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image pickers for Avatar and Cover */}
            <div className="space-y-4 mb-4">
              {/* Cover preview & upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">صورة الغلاف</label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative h-24 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 cursor-pointer group flex items-center justify-center"
                >
                  <img src={coverImage || userProfile.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs text-white font-bold bg-black/40">
                    <Camera className="w-4 h-4" />
                    <span>تغيير الغلاف</span>
                  </div>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </div>
              </div>

              {/* Avatar preview & upload */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00F2FE] cursor-pointer group shrink-0"
                >
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">الصورة الشخصية</span>
                  <span className="text-[11px] text-slate-400 block">انقر على الصورة لرفع صورة جديدة من جهازك</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم المستخدم (@)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F2FE]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">الموقع الإلكتروني</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-bold hover:bg-white/15 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-neon-gradient text-white text-xs font-bold shadow-neon-glow cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for Photo View */}
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

      {/* Replay Video Player Modal */}
      {selectedReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0E1424] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-right">
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-black/50">
              <button
                onClick={() => setSelectedReplay(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-xs font-bold text-white truncate max-w-[220px]">
                {selectedReplay.title}
              </h4>
            </div>

            <div className="relative aspect-9/14 bg-black">
              <video
                src={selectedReplay.videoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3.5 bg-[#0E1424] flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono">{selectedReplay.date}</span>
              <span className="text-[#00F2FE] font-mono">المدة: {selectedReplay.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
