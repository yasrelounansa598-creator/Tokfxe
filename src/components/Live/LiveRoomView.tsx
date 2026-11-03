import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Users,
  Heart,
  Gift,
  Share2,
  Send,
  Radio,
  Swords,
  RefreshCw,
  Plus,
  Check,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GiftDrawer } from './GiftDrawer';
import { InviteCoHostDrawer } from './InviteCoHostDrawer';
import { EndStreamModal } from './EndStreamModal';

interface FloatingHeartItem {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const LiveRoomView: React.FC = () => {
  const {
    activeLiveRoom,
    leaveLiveRoom,
    isBroadcasting,
    userCameraStream,
    activeLiveComments,
    activeGiftBanner,
    sendLiveComment,
    sendLiveHeart,
    setIsGiftDrawerOpen,
    setIsInviteGuestDrawerOpen,
    endCoHost,
    showToast,
    toggleFollow,
  } = useApp();

  const hostVideoRef = useRef<HTMLVideoElement>(null);
  const guestVideoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [chatText, setChatText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [cameraFlipped, setCameraFlipped] = useState(false);

  // Bind real camera stream if broadcasting
  useEffect(() => {
    if (hostVideoRef.current && userCameraStream) {
      hostVideoRef.current.srcObject = userCameraStream;
    }
  }, [userCameraStream]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLiveComments]);

  if (!activeLiveRoom) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendLiveComment(chatText);
    setChatText('');
  };

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    sendLiveHeart();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = ['#FE2C55', '#00F2FE', '#FFD700', '#FF007F', '#A855F7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y, color: randomColor }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 900);
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('تم نسخ رابط البث المباشر 🔗');
  };

  const isCoHostActive = activeLiveRoom.isCoHost && activeLiveRoom.coHost;
  const pk = activeLiveRoom.pkBattle;

  // Compute PK percentages
  const totalPK = pk ? pk.hostScore + pk.guestScore : 100;
  const hostPKPercent = pk ? Math.min(85, Math.max(15, (pk.hostScore / totalPK) * 100)) : 50;
  const guestPKPercent = 100 - hostPKPercent;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] select-none flex flex-col justify-between overflow-hidden w-full h-full">
      {/* Tap Surface for Reactions & Video Player */}
      <div
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
        onClick={handleScreenTap}
      >
        {!isCoHostActive ? (
          /* Single Host Stream View */
          <div className="relative w-full h-full bg-black">
            {isBroadcasting && userCameraStream ? (
              <video
                ref={hostVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFlipped ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <video
                src={activeLiveRoom.streamUrl || '/videos/fextok_cyber_city.mp4'}
                autoPlay
                loop
                playsInline
                muted={isAudioMuted}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
          </div>
        ) : (
          /* Split-Screen Dual Host & Co-Host PK Battle */
          <div className="relative w-full h-full flex flex-col bg-black">
            {/* Top Half: Host */}
            <div className="relative flex-1 border-b-2 border-white/20 overflow-hidden">
              {isBroadcasting && userCameraStream ? (
                <video
                  ref={hostVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFlipped ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <video
                  src={activeLiveRoom.streamUrl || '/videos/fextok_cyber_city.mp4'}
                  autoPlay
                  loop
                  playsInline
                  muted={isAudioMuted}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-16 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1">
                <span>{activeLiveRoom.host.name}</span>
                <span className="text-[#00F2FE]">({pk ? pk.hostScore : 0} نقطة)</span>
              </div>
            </div>

            {/* Center PK Battle Progress Gauge */}
            {pk && (
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center">
                <div className="flex items-center gap-2 bg-[#0E1424]/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-500/40 shadow-neon-glow mb-1">
                  <Swords className="w-3.5 h-3.5 text-[#FE2C55]" />
                  <span className="text-[11px] font-black text-amber-400 font-mono">
                    جولة التحدي (PK) · 02:15
                  </span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>

                {/* Split Bar */}
                <div className="w-[88%] h-3 rounded-full bg-slate-900 border border-white/20 overflow-hidden flex shadow-lg">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-300"
                    style={{ width: `${hostPKPercent}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300"
                    style={{ width: `${guestPKPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Half: Guest */}
            <div className="relative flex-1 overflow-hidden">
              <video
                ref={guestVideoRef}
                src="/videos/fextok_neon_dance.mp4"
                autoPlay
                loop
                playsInline
                muted={isAudioMuted}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1">
                <span>{activeLiveRoom.coHost?.name}</span>
                <span className="text-[#FE2C55]">({pk ? pk.guestScore : 0} نقطة)</span>
              </div>

              {isBroadcasting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    endCoHost();
                  }}
                  className="absolute top-3 left-3 px-2 py-1 bg-red-600/80 rounded-md text-[10px] font-bold text-white shadow-sm"
                >
                  إنهاء البث المشترك
                </button>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />
          </div>
        )}

        {/* Floating Heart Bursts from Tap */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            style={{ left: h.x - 20, top: h.y - 20, color: h.color }}
            className="absolute pointer-events-none z-30 animate-in zoom-in fade-out-0 slide-out-to-top-16 duration-700"
          >
            <Heart className="w-10 h-10 fill-current drop-shadow-[0_0_12px_rgba(254,44,85,0.8)]" />
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-3 pt-3 pb-2 bg-gradient-to-b from-black/80 to-transparent">
        {/* Host Identity Pill */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1 pr-1.5 pl-2 rounded-full border border-white/15">
          <div className="relative">
            <img
              src={activeLiveRoom.host.avatar}
              alt={activeLiveRoom.host.name}
              className="w-8 h-8 rounded-full object-cover border border-[#FE2C55]"
            />
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-[#FE2C55] text-[8px] font-bold text-white rounded-full">
              LIVE
            </span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white truncate max-w-[85px]">
                {activeLiveRoom.host.name}
              </span>
              {activeLiveRoom.host.isVerified && (
                <span className="text-[9px] text-[#00F2FE]">✓</span>
              )}
            </div>
            <span className="text-[9px] text-slate-300 font-mono">
              {(activeLiveRoom.host.followersCount / 1000).toFixed(0)}k متابع
            </span>
          </div>

          {!isBroadcasting && (
            <button
              onClick={() => toggleFollow(activeLiveRoom.host.id)}
              className={`p-1 rounded-full ml-1 text-white text-[10px] font-bold flex items-center justify-center transition-all ${
                activeLiveRoom.host.isFollowed ? 'bg-white/20' : 'bg-[#FE2C55] shadow-sm'
              }`}
            >
              {activeLiveRoom.host.isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Live Viewers & Diamonds Strip */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white text-[11px] font-mono">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeLiveRoom.viewersCount}</span>
          </div>

          {/* Close Room */}
          <button
            onClick={leaveLiveRoom}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20"
            title="مغادرة البث"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Gift Announcement Banner */}
      {activeGiftBanner && (
        <div className="relative z-30 mx-4 my-2 animate-in slide-in-from-left duration-300 pointer-events-none">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-r ${activeGiftBanner.gift.bannerGradient} text-white flex items-center justify-between shadow-neon-glow border border-white/30`}>
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">{activeGiftBanner.gift.icon}</span>
              <div>
                <span className="text-xs font-black block">{activeGiftBanner.senderName}</span>
                <span className="text-[10px] text-white/90">
                  أرسل {activeGiftBanner.gift.nameAr} ({activeGiftBanner.gift.diamonds} ماسة) 🎁
                </span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          </div>
        </div>
      )}

      {/* Live Chat Stream (Bottom Left/Right Overlay) */}
      <div className="relative z-20 px-3 pb-2 flex flex-col justify-end max-h-[35vh]">
        <div className="space-y-2 overflow-y-auto no-scrollbar pr-1">
          {activeLiveComments.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-2 bg-black/45 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/10 text-right max-w-[90%]"
            >
              <img
                src={c.userAvatar}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="text-xs leading-snug">
                <span className={`font-bold ml-1.5 ${c.isHost ? 'text-[#00F2FE]' : c.isGift ? 'text-amber-400' : 'text-slate-300'}`}>
                  {c.userName}:
                </span>
                <span className="text-white font-arabic">{c.text}</span>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
      </div>

      {/* Bottom Interactive Toolbar */}
      <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-2">
        {/* Comment Input */}
        <form onSubmit={handleSendChat} className="flex-1 flex items-center bg-white/10 border border-white/15 rounded-full px-3 py-2">
          <input
            type="text"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="أرسل تعليقاً في البث..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatText.trim()}
            className="text-[#00F2FE] hover:text-white px-1 disabled:opacity-40"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

        {/* Co-Host Button (Host only) */}
        {isBroadcasting && (
          <button
            onClick={() => setIsInviteGuestDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-amber-400 active:scale-95"
            title="بث مشترك / تحدي PK"
          >
            <Swords className="w-5 h-5 text-amber-400" />
          </button>
        )}

        {/* Camera Flip Button (Host only) */}
        {isBroadcasting && (
          <button
            onClick={() => setCameraFlipped(!cameraFlipped)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white active:scale-95"
            title="قلب الكاميرا"
          >
            <RefreshCw className="w-4 h-4 text-[#00F2FE]" />
          </button>
        )}

        {/* Gift Button */}
        <button
          onClick={() => setIsGiftDrawerOpen(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FE2C55] to-amber-500 border border-white/20 flex items-center justify-center text-white shadow-neon-glow active:scale-95"
          title="إرسال هدية"
        >
          <Gift className="w-5 h-5" />
        </button>

        {/* Heart / Like Button */}
        <button
          onClick={sendLiveHeart}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#FE2C55] active:scale-125 transition-transform"
          title="إعجاب"
        >
          <Heart className="w-5 h-5 fill-current" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleCopyShare}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white active:scale-95"
          title="مشاركة البث"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Drawers & Modals */}
      <GiftDrawer />
      <InviteCoHostDrawer />
      <EndStreamModal />
    </div>
  );
};
