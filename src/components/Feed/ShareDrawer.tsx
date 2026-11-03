import React from 'react';
import { X, Copy, Share2, Send, Bookmark, Download, Sparkles, Flag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, showToast, openReportModal, videos, activeVideoIndex } = useApp();

  if (activeDrawer !== 'share') return null;

  const currentVideo = videos[activeVideoIndex];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('تم نسخ رابط الفيديو إلى الحافظة 📋');
    setActiveDrawer('none');
  };

  const handleAction = (label: string) => {
    showToast(`تم تنفيذ: ${label}`);
    setActiveDrawer('none');
  };

  const handleReport = () => {
    setActiveDrawer('none');
    if (currentVideo) {
      openReportModal('video', currentVideo.id);
    }
  };

  const shareTargets = [
    { id: 'whatsapp', label: 'واتساب', icon: '💬', color: 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/40' },
    { id: 'telegram', label: 'تيليجرام', icon: '✈️', color: 'bg-[#0088cc]/20 text-[#0088cc] border-[#0088cc]/40' },
    { id: 'story', label: 'قصتي', icon: '🌟', color: 'bg-[#FE2C55]/20 text-[#FE2C55] border-[#FE2C55]/40' },
    { id: 'dm', label: 'رسالة خاصة', icon: '✉️', color: 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/40' },
  ];

  const quickActions = [
    { label: 'نسخ الرابط', icon: <Copy className="w-5 h-5 text-slate-200" />, action: handleCopyLink },
    { label: 'حفظ الفيديو', icon: <Download className="w-5 h-5 text-slate-200" />, action: () => handleAction('حفظ الفيديو على جهازك') },
    { label: 'إعادة نشر', icon: <Share2 className="w-5 h-5 text-slate-200" />, action: () => handleAction('إعادة نشر الفيديو') },
    { label: 'إضافة للمفضلة', icon: <Bookmark className="w-5 h-5 text-slate-200" />, action: () => handleAction('إضافة للمفضلة') },
    { label: 'إبلاغ عن محتوى', icon: <Flag className="w-5 h-5 text-rose-400" />, action: handleReport },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />

      <div className="relative w-full max-w-lg bg-[#0E131F] border-t border-white/10 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 mx-auto">
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="w-6" />
          <h3 className="text-sm font-bold text-white font-heading">مشاركة مع الأصدقاء</h3>
          <button
            onClick={() => setActiveDrawer('none')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share To Social Targets */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {shareTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => handleAction(`مشاركة عبر ${target.label}`)}
              className="flex flex-col items-center gap-1.5 group min-h-[44px]"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border transition-transform group-hover:scale-105 active:scale-95 ${target.color}`}>
                {target.icon}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">{target.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Utilities */}
        <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/10">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="flex flex-col items-center gap-1.5 group min-h-[44px]"
            >
              <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95">
                {action.icon}
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[65px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
