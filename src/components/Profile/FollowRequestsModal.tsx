import React from 'react';
import { X, UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FollowRequestsModal: React.FC = () => {
  const {
    isFollowRequestsModalOpen,
    setIsFollowRequestsModalOpen,
    followRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    openUserProfile,
  } = useApp();

  if (!isFollowRequestsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={() => setIsFollowRequestsModalOpen(false)}
      />

      <div className="relative w-full max-w-md bg-[#0E131F] border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-250">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00F2FE]/15 flex items-center justify-center border border-[#00F2FE]/30">
              <Shield className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                طلبات المتابعة
              </h3>
              <p className="text-[11px] text-slate-400">
                حسابك الخاص يتطلب موافقتك لرؤية منشوراتك
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFollowRequestsModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {followRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <UserCheck className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-300">لا توجد طلبات متابعة معلقة</p>
              <p className="text-xs text-slate-500">
                ستظهر هنا طلبات المتابعة الجديدة عندما يكون حسابك خاصاً
              </p>
            </div>
          ) : (
            followRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
              >
                {/* User info */}
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => {
                    openUserProfile(req.user);
                    setIsFollowRequestsModalOpen(false);
                  }}
                >
                  <img
                    src={req.user.avatar}
                    alt={req.user.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#00F2FE]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {req.user.name}
                      </span>
                      {req.user.isVerified && (
                        <span className="text-[10px] text-[#00F2FE]">✓</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      @{req.user.username}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{req.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Accept / Reject actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => acceptFollowRequest(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#7928CA] text-white text-xs font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>قبول</span>
                  </button>

                  <button
                    onClick={() => rejectFollowRequest(req.id)}
                    className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
                    title="رفض"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
