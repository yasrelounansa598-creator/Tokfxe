import React, { useState } from 'react';
import { X, Search, UserCheck, UserPlus, Shield, UserX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CREATORS } from '../../data/mockData';

export const FollowersModal: React.FC = () => {
  const {
    isFollowersModalOpen,
    setIsFollowersModalOpen,
    followersModalType,
    setFollowersModalType,
    toggleFollow,
    requestFollow,
    openUserProfile,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [removedFollowerIds, setRemovedFollowerIds] = useState<string[]>([]);

  if (!isFollowersModalOpen) return null;

  // Derive list based on followersModalType
  const users = INITIAL_CREATORS.filter((c) => !removedFollowerIds.includes(c.id));

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const handleRemoveFollower = (id: string, name: string) => {
    setRemovedFollowerIds((prev) => [...prev, id]);
    showToast(`تمت إزالة ${name} من قائمة المتابعين`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="absolute inset-0" onClick={() => setIsFollowersModalOpen(false)} />

      <div className="relative w-full max-w-md bg-[#0E131F] border border-white/10 rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header with Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFollowersModalType('followers')}
              className={`text-sm font-bold pb-1 transition-colors relative ${
                followersModalType === 'followers'
                  ? 'text-white border-b-2 border-[#00F2FE]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المتابعون (128.4k)
            </button>
            <button
              onClick={() => setFollowersModalType('following')}
              className={`text-sm font-bold pb-1 transition-colors relative ${
                followersModalType === 'following'
                  ? 'text-white border-b-2 border-[#FE2C55]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              أتابع (342)
            </button>
          </div>
          <button
            onClick={() => setIsFollowersModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative my-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              followersModalType === 'followers'
                ? 'البحث في المتابعين...'
                : 'البحث في الحسابات التي تتابعها...'
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F2FE]"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar my-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد نتائج مطابقة لبحثك
            </div>
          ) : (
            filteredUsers.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  onClick={() => {
                    openUserProfile(creator);
                    setIsFollowersModalOpen(false);
                  }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:border-[#00F2FE]"
                    />
                    {creator.isLive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-red-600 text-[8px] font-bold rounded-full text-white">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00F2FE] flex items-center gap-1 truncate">
                      {creator.name}
                      {creator.isVerified && (
                        <span className="text-[10px] text-[#00F2FE]">✓</span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      @{creator.username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {followersModalType === 'following' ? (
                    <button
                      onClick={() => requestFollow(creator.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        creator.isFollowed
                          ? 'bg-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10'
                          : 'bg-neon-gradient text-white shadow-sm'
                      }`}
                    >
                      {creator.isFollowed ? 'أتابعه ✓' : 'متابعة'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleFollow(creator.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          creator.isFollowed
                            ? 'bg-white/10 text-slate-300 border border-white/10'
                            : 'bg-neon-gradient text-white'
                        }`}
                      >
                        {creator.isFollowed ? 'أتابعه' : 'رد المتابعة'}
                      </button>
                      <button
                        onClick={() => handleRemoveFollower(creator.id, creator.name)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-white/10"
                        title="إزالة من المتابعين"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
