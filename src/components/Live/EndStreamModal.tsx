import React, { useState } from 'react';
import { Trophy, Clock, Users, Heart, Gem, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EndStreamModal: React.FC = () => {
  const { isEndStreamModalOpen, lastStreamSummary, confirmEndStreamAndSave, showToast } = useApp();
  const [saveToProfile, setSaveToProfile] = useState(true);

  if (!isEndStreamModalOpen || !lastStreamSummary) return null;

  const handleDownload = () => {
    showToast('جارِ تجهيز ملف الفيديو للتحميل 📥');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-[#FE2C55]/30 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FE2C55] to-amber-500 mx-auto flex items-center justify-center shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white font-heading">انتهى البث المباشر</h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">{lastStreamSummary.title}</p>
        </div>

        {/* 4-Stat Box */}
        <div className="grid grid-cols-2 gap-3 text-right">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#00F2FE] shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">مدة البث</span>
              <span className="text-sm font-bold text-white font-mono">{lastStreamSummary.duration}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">أعلى مشاهدة</span>
              <span className="text-sm font-bold text-white font-mono">{lastStreamSummary.peakViewers}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#FE2C55] shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">الإعجابات</span>
              <span className="text-sm font-bold text-white font-mono">{(lastStreamSummary.likes / 1000).toFixed(1)}k</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Gem className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">الماس المكتسب</span>
              <span className="text-sm font-bold text-white font-mono">{lastStreamSummary.diamonds}</span>
            </div>
          </div>
        </div>

        {/* Save Replay Checkbox */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-right">
          <label className="text-xs text-white font-medium cursor-pointer" htmlFor="save-check">
            حفظ تسجيل البث في تبويب الملف الشخصي
          </label>
          <input
            id="save-check"
            type="checkbox"
            checked={saveToProfile}
            onChange={(e) => setSaveToProfile(e.target.checked)}
            className="w-4 h-4 accent-[#FE2C55] cursor-pointer"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00F2FE]" />
            <span>تحميل تسجيل الفيديو</span>
          </button>

          <button
            onClick={() => confirmEndStreamAndSave(saveToProfile)}
            className="w-full py-3.5 rounded-xl bg-neon-gradient text-white text-xs font-extrabold shadow-neon-glow active:scale-98 transition-transform cursor-pointer"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
