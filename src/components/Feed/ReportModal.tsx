import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportTarget, submitReport } = useApp();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  if (!isReportModalOpen) return null;

  const reasons = [
    { id: 'inappropriate', label: 'محتوى غير لائق أو حساس', desc: 'مشاهد غير ملائمة للجمهور العام' },
    { id: 'harassment', label: 'تنمر ومضايقات أو تهديد', desc: 'سلوك عدواني أو استهداف مباشر لشخص ما' },
    { id: 'hate_speech', label: 'خطاب كراهية وتمييز', desc: 'تحريض على العنف أو كراهية بسبب العرق أو المعتقد' },
    { id: 'fraud', label: 'احتيال وتضليل أو روابط وهمية', desc: 'محاولات احتيال مالي أو انتحال شخصية' },
    { id: 'violence', label: 'عنف أو أفعال خطرة وغير قانونية', desc: 'إيذاء النفس أو ترويج لأنشطة خطرة' },
    { id: 'copyright', label: 'انتهاك حقوق الملكية الفكرية', desc: 'استخدام مواد دون إذن صاحب الحقوق' },
    { id: 'other', label: 'أسباب أخرى', desc: 'مخالفات أخرى لشروط مجتمع FexTok' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    submitReport(selectedReason, details);
    setSelectedReason('');
    setDetails('');
  };

  const targetLabel =
    reportTarget?.type === 'video'
      ? 'هذا الفيديو'
      : reportTarget?.type === 'comment'
      ? 'هذا التعليق'
      : 'هذا المستخدم';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="absolute inset-0" onClick={() => setIsReportModalOpen(false)} />

      <div className="relative w-full max-w-md bg-[#0E131F] border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-rose-500">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-heading">
              إبلاغ عن {targetLabel}
            </h3>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 mb-4 leading-relaxed">
          نحن في FexTok نأخذ سلامة المجتمع بجدية تامة. اختر سبب البلاغ ليقوم فريق الإشراف بمراجعته فوراً:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {reasons.map((r) => {
              const isSelected = selectedReason === r.label;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setSelectedReason(r.label)}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">{r.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-slate-500'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              تفاصيل إضافية (اختياري)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="صف المشكلة بدقة لمساعدة فريق الإشراف..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedReason}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950/40"
            >
              إرسال البلاغ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
