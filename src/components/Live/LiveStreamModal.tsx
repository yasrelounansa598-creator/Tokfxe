import React, { useState } from 'react';
import { X, Radio, Sparkles, Image, ShieldCheck, MessageSquare, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveStreamModal: React.FC = () => {
  const { isSetupLiveModalOpen, setIsSetupLiveModalOpen, startBroadcasting, userProfile } = useApp();

  const [title, setTitle] = useState('سهرة وسوالف مع المتابعين وتحديات نيون 🌟');
  const [category, setCategory] = useState('سوالف ومواهب');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isSetupLiveModalOpen) return null;

  const categories = [
    'سوالف ومواهب',
    'ألعاب وجيمنج',
    'طبخ ومشروبات',
    'موسيقى وغناء',
    'تقنية وتصميم',
  ];

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await startBroadcasting({
      title,
      category,
      coverUrl: userProfile.avatar,
      isPrivate,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-[#00F2FE]/30 rounded-3xl p-5 shadow-neon-glow animate-in zoom-in-95 duration-200 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <button
            onClick={() => setIsSetupLiveModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-heading">إعداد البث المباشر</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
        </div>

        <form onSubmit={handleStart} className="space-y-4">
          {/* Cover & Title Block */}
          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/20">
              <img
                src={userProfile.avatar}
                alt="Live Cover"
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white/80">
                <Camera className="w-4 h-4" />
              </span>
            </div>

            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                عنوان البث المباشر
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                placeholder="اكتب عنواناً جذاباً لمشاهديك..."
                className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] resize-none"
                required
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              تصنيف البث
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    category === cat
                      ? 'bg-neon-gradient text-white shadow-neon-glow'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Comments Options */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
                <span>خصوصية البث</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  isPrivate ? 'bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isPrivate ? 'الأصدقاء فقط 🔒' : 'عام للجميع 🌍'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#FE2C55]" />
                <span>السماح بتعليقات المشاهدين</span>
              </div>
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-[#FE2C55] to-pink-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(254,44,85,0.5)] active:scale-98 transition-all cursor-pointer"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>{isLoading ? 'جارِ تهيئة البث...' : 'ابدأ البث المباشر الآن 🔴'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
