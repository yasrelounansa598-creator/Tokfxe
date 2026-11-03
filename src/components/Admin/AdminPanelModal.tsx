import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Trash2, Ban, Eye, FileText, AlertTriangle, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContentReport } from '../../types';

export const AdminPanelModal: React.FC = () => {
  const { isAdminPanelOpen, setIsAdminPanelOpen, reports, resolveReport, videos } = useApp();
  const [filter, setFilter] = useState<'pending' | 'resolved'>('pending');

  if (!isAdminPanelOpen) return null;

  const filteredReports = reports.filter((r) => r.status === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0E1424] border border-[#FE2C55]/40 rounded-3xl p-5 shadow-2xl text-right animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
          <button
            onClick={() => setIsAdminPanelOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-heading">لوحة الإدارة والإشراف</h3>
            <ShieldAlert className="w-4 h-4 text-[#FE2C55]" />
          </div>
        </div>

        {/* Platform Overview Strip */}
        <div className="grid grid-cols-3 gap-2 mb-4 shrink-0 text-center">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block">إجمالي الفيديوهات</span>
            <span className="text-sm font-black text-white font-mono">{videos.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block">البلاغات المعلقة</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {reports.filter((r) => r.status === 'pending').length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block">البلاغات المنجزة</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {reports.filter((r) => r.status === 'resolved').length}
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-3 shrink-0">
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending' ? 'bg-[#FE2C55] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            البلاغات المعلقة ({reports.filter((r) => r.status === 'pending').length})
          </button>

          <button
            onClick={() => setFilter('resolved')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'resolved' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            المكتملة ({reports.filter((r) => r.status === 'resolved').length})
          </button>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-0.5">
          {filteredReports.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              لا توجد بلاغات في هذا القسم 👍
            </div>
          ) : (
            filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-right"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-[#FE2C55] font-bold border border-red-500/30">
                    {rep.targetType === 'video' ? 'بلاغ عن فيديو' : rep.targetType === 'comment' ? 'بلاغ عن تعليق' : 'بلاغ عن مستخدم'}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{rep.timestamp}</span>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 block mb-0.5">السبب المبلغ عنه:</span>
                  <p className="font-bold text-white bg-black/30 p-2 rounded-lg border border-white/5">
                    {rep.reason}
                  </p>
                  {rep.details && (
                    <p className="text-[11px] text-slate-300 mt-1 italic">"{rep.details}"</p>
                  )}
                </div>

                <div className="text-[10px] text-slate-400">
                  <span>المبلغ: {rep.reporterName}</span>
                </div>

                {rep.status === 'pending' && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                    <button
                      onClick={() => resolveReport(rep.id, 'delete_content')}
                      className="py-1.5 rounded-lg bg-red-600/25 border border-red-500/40 text-red-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-600/40 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>إزالة المحتوى</span>
                    </button>

                    <button
                      onClick={() => resolveReport(rep.id, 'ban_user')}
                      className="py-1.5 rounded-lg bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-amber-500/40 cursor-pointer"
                    >
                      <Ban className="w-3 h-3" />
                      <span>حظر الحساب</span>
                    </button>

                    <button
                      onClick={() => resolveReport(rep.id, 'dismiss')}
                      className="py-1.5 rounded-lg bg-white/10 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-white/20 cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>تجاهل</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
