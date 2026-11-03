import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Disc, Play, Plus, Music2, Volume2, VolumeX, Check } from 'lucide-react';
import { VideoItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive }) => {
  const {
    toggleLike,
    toggleBookmark,
    toggleFollow,
    requestFollow,
    openUserProfile,
    setActiveDrawer,
    isMuted,
    toggleMute,
  } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  const fallbackVideo = '/videos/fextok_cyber_city.mp4';
  const fallbackPoster = '/posters/fextok_cyber_city.jpg';

  const [currentSrc, setCurrentSrc] = useState<string>(video.videoUrl || fallbackVideo);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Keep src in sync if video prop changes
  useEffect(() => {
    setCurrentSrc(video.videoUrl || fallbackVideo);
    setVideoError(false);
    setIsLoading(true);
  }, [video.videoUrl]);

  // Auto-play / pause based on active index
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            // Autoplay with sound might be blocked, retry muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {
                setIsPlaying(false);
              });
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, currentSrc]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setShowPlayIcon(false);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleVideoError = () => {
    if (currentSrc !== fallbackVideo) {
      console.warn(`[Tok Fxe VideoCard] Error loading source ${currentSrc}. Switching to reliable fallback: ${fallbackVideo}`);
      setCurrentSrc(fallbackVideo);
      setVideoError(false);
      setIsLoading(true);
    } else {
      setVideoError(true);
      setIsLoading(false);
    }
  };

  // Double tap to like with animated heart particle
  const lastTapRef = useRef<number>(0);
  const handleTapScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      if (!video.isLiked) {
        toggleLike(video.id);
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const heartId = Date.now();
      setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 1000);

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current !== 0 && Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          togglePlay();
          lastTapRef.current = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#07090E] select-none overflow-hidden">
      {/* Video Media or Fallback Poster */}
      <div
        className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black"
        onClick={handleTapScreen}
      >
        {video.mediaType === 'text' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#07090E] via-[#0E131F] to-[#1F293D] p-8 text-center">
            <div className="p-8 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-md max-w-xs shadow-2xl">
              <span className="text-3xl mb-3 block">✨</span>
              <p className="text-sm font-bold text-white leading-relaxed font-arabic">
                {video.textContent || video.caption}
              </p>
            </div>
          </div>
        ) : video.mediaType === 'image' || (!video.videoUrl && video.posterUrl) ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={video.posterUrl || fallbackPoster}
              alt={video.caption}
              className="w-full h-full object-cover"
            />
            {video.photos && video.photos.length > 1 && (
              <div className="absolute top-16 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                ألبوم صور 📸 ({video.photos.length})
              </div>
            )}
          </div>
        ) : !videoError ? (
          <>
            <video
              ref={videoRef}
              src={currentSrc}
              poster={video.posterUrl || fallbackPoster}
              loop
              playsInline
              preload="auto"
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onError={handleVideoError}
              className="w-full h-full object-cover"
            />
            {isLoading && isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-[#00D9FF] border-r-[#8A2BFF] animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={video.posterUrl || fallbackPoster}
              alt={video.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Video Scrims for readability */}
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* Play/Pause Pulsing Indicator */}
        {!isPlaying && showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-75 duration-150">
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
              <Play className="w-10 h-10 text-white fill-white translate-x-1" />
            </div>
          </div>
        )}

        {/* Floating Heart Bursts from Double Tap */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            style={{ left: h.x - 30, top: h.y - 30 }}
            className="absolute pointer-events-none z-30 animate-in zoom-in fade-out-0 slide-out-to-top-12 duration-700"
          >
            <Heart className="w-16 h-16 text-[#FE2C55] fill-[#FE2C55] drop-shadow-[0_0_15px_rgba(254,44,85,0.8)]" />
          </div>
        ))}
      </div>

      {/* Floating Mute Quick Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-14 left-3 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
        aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-[#00F2FE]" />}
      </button>

      {/* Right Thumb Interaction Rail - Strictly on Right Side */}
      <div className="absolute bottom-16 right-3 z-30 flex flex-col items-center gap-3.5">
        {/* Creator Avatar with Follow Plus Badge */}
        <div className="relative group">
          <div
            onClick={(e) => {
              e.stopPropagation();
              openUserProfile(video.creator);
            }}
            className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#00F2FE] via-[#7928CA] to-[#FE2C55] shadow-lg cursor-pointer hover:scale-105 transition-transform"
            title={`عرض ملف ${video.creator.name}`}
          >
            <img
              src={video.creator.avatar}
              alt={video.creator.name}
              className="w-full h-full rounded-full object-cover border border-black"
            />
          </div>
          {!video.creator.isFollowed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                requestFollow(video.creator.id);
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
              title={video.creator.isPrivate ? 'طلب متابعة' : 'متابعة'}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(video.id);
          }}
          className="flex flex-col items-center group min-h-[44px] justify-center focus:outline-none cursor-pointer"
          aria-label="تسجيل إعجاب"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-125">
            <Heart
              className={`w-7 h-7 transition-colors ${
                video.isLiked
                  ? 'fill-[#FE2C55] text-[#FE2C55] drop-shadow-[0_0_12px_rgba(254,44,85,0.7)]'
                  : 'text-white stroke-[2] drop-shadow-md'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white font-mono tabular-nums -mt-1 drop-shadow-md">
            {(video.likesCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDrawer('comment');
          }}
          className="flex flex-col items-center group min-h-[44px] justify-center focus:outline-none cursor-pointer"
          aria-label="التعليقات"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-110">
            <MessageSquare className="w-6 h-6 text-white stroke-[2] drop-shadow-md" />
          </div>
          <span className="text-[11px] font-bold text-white font-mono tabular-nums -mt-1 drop-shadow-md">
            {video.commentsCount}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(video.id);
          }}
          className="flex flex-col items-center group min-h-[44px] justify-center focus:outline-none cursor-pointer"
          aria-label="حفظ في المفضلة"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-110">
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                video.isBookmarked
                  ? 'fill-[#FFD700] text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]'
                  : 'text-white stroke-[2] drop-shadow-md'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white font-mono tabular-nums -mt-1 drop-shadow-md">
            {(video.bookmarksCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDrawer('share');
          }}
          className="flex flex-col items-center group min-h-[44px] justify-center focus:outline-none cursor-pointer"
          aria-label="مشاركة"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-110">
            <Share2 className="w-6 h-6 text-white stroke-[2] drop-shadow-md" />
          </div>
          <span className="text-[11px] font-bold text-white font-mono tabular-nums -mt-1 drop-shadow-md">
            {(video.sharesCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Rotating Vinyl Disc with Floating Notes */}
        <div className="relative pt-1">
          <div className="absolute -top-2 -right-2 text-[#00F2FE] animate-float-note-1 pointer-events-none text-xs">
            ♫
          </div>
          <div className="absolute -top-4 -left-1 text-[#FE2C55] animate-float-note-2 pointer-events-none text-xs">
            ♩
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDrawer('sound');
            }}
            className="w-11 h-11 rounded-full p-1 bg-slate-900 border border-white/20 shadow-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="الصوت الأصلي"
          >
            <div className={`w-full h-full rounded-full flex items-center justify-center relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <Disc className="w-7 h-7 text-[#00F2FE]" />
              <img
                src={video.creator.avatar}
                alt=""
                className="w-3.5 h-3.5 rounded-full object-cover absolute"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Creator Info & Captions Overlay (Leaves clearance on right for rail) */}
      <div className="absolute bottom-16 right-18 left-4 z-20 text-right space-y-1.5 pointer-events-auto">
        {/* Creator Handle & Verified Badge */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            openUserProfile(video.creator);
          }}
          className="flex items-center justify-start gap-1.5 cursor-pointer group w-fit"
        >
          <span className="text-sm font-bold text-white tracking-wide group-hover:text-[#00F2FE] hover:underline">
            @{video.creator.username}
          </span>
          {video.creator.isVerified && (
            <span className="w-4 h-4 rounded-full bg-[#00F2FE] text-[#07090E] text-[10px] font-bold flex items-center justify-center">
              ✓
            </span>
          )}
        </div>

        {/* Caption */}
        <p className="text-xs text-slate-100 font-arabic leading-relaxed line-clamp-2">
          {video.caption}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {video.hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-bold text-white/90 hover:text-[#00F2FE] cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Audio Ticker Marquee */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDrawer('sound');
          }}
          className="flex items-center gap-1.5 text-xs text-slate-300 max-w-[85%] overflow-hidden bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 hover:border-[#00F2FE] transition-colors cursor-pointer"
        >
          <Music2 className="w-3 h-3 text-[#00F2FE] shrink-0" />
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-marquee font-arabic text-[11px]">
              {video.musicTitle}
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Timeline Scrubber */}
      <div className="absolute bottom-13 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          className="h-full bg-neon-gradient transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
