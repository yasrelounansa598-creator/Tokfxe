import React from 'react';
import { X, Disc, Play, Bookmark, Music, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SoundDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, videos, activeVideoIndex, showToast, isMuted, toggleMute } = useApp();

  if (activeDrawer !== 'sound') return null;

  const currentVideo = videos[activeVideoIndex];
  if (!currentVideo) return null;

  const handleUseSound = () => {
    showToast(`تم اختيار الصوت: ${currentVideo.musicTitle}`);
    setActiveDrawer('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />

      <div className="relative w-full max-w-lg bg-[#0E131F] border-t border-white/10 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 mx-auto">
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="w-6" />
          <h3 className="text-sm font-bold text-white font-heading">تفاصيل الصوت والموسيقى</h3>
          <button
            onClick={() => setActiveDrawer('none')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Header with Vinyl Graphic */}
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/10 mb-5">
          <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-white/20 flex items-center justify-center shrink-0 shadow-lg">
            <Disc className="w-12 h-12 text-[#00F2FE] animate-spin-slow" />
            <div className="absolute w-4 h-4 rounded-full bg-[#FE2C55]" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{currentVideo.musicTitle}</h4>
            <p className="text-xs text-slate-400 truncate mt-0.5">{currentVideo.musicAuthor}</p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-[#00F2FE]">
              <span>🔥 1.4M فيديو يستخدم هذا الصوت</span>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
            title={isMuted ? 'تشغيل' : 'كتم'}
          >
            {isMuted ? <Play className="w-4 h-4 fill-white" /> : <Music className="w-4 h-4 text-[#00F2FE]" />}
          </button>
        </div>

        {/* CTA to use sound */}
        <button
          onClick={handleUseSound}
          className="w-full py-3 rounded-xl bg-neon-gradient text-white font-bold text-xs flex items-center justify-center gap-2 shadow-neon-glow active:scale-98 transition-transform mb-3"
        >
          <Sparkles className="w-4 h-4" />
          <span>استخدام هذا الصوت في فيديو جديد</span>
        </button>

        {/* Bookmark audio */}
        <button
          onClick={() => {
            showToast('تم حفظ الصوت في المفضلة ⭐');
            setActiveDrawer('none');
          }}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-[#00F2FE]" />
          <span>إضافة إلى الأصوات المفضلة</span>
        </button>
      </div>
    </div>
  );
};
