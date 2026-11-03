import React from 'react';
import { X, Users, Swords, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InviteCoHostDrawer: React.FC = () => {
  const { isInviteGuestDrawerOpen, setIsInviteGuestDrawerOpen, inviteCoHost, videos } = useApp();

  if (!isInviteGuestDrawerOpen) return null;

  // Potential co-hosts
  const coHostCandidates = videos.map((v) => v.creator).filter(
    (c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsInviteGuestDrawerOpen(false)} />

      <div className="relative w-full max-w-lg bg-[#0E1424] border-t border-white/10 rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 text-right mx-auto">
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="w-7" />
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#FE2C55]" />
            <h3 className="text-sm font-bold text-white font-heading">دعوة لبث مشترك وتحدي (PK)</h3>
          </div>
          <button
            onClick={() => setIsInviteGuestDrawerOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          اختر صديقاً للانضمام معك في شاشة مقسمة لبدء جولة حماسية وتحدي مباشر أمام الجمهور! 🔥
        </p>

        <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
          {coHostCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00F2FE]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0E1424]" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{candidate.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">@{candidate.username}</span>
                </div>
              </div>

              <button
                onClick={() => inviteCoHost(candidate)}
                className="px-4 py-1.5 rounded-full bg-neon-gradient text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>دعوة للبث</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
