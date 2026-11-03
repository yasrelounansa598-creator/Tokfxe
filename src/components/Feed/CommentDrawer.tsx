import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommentDrawer: React.FC = () => {
  const {
    activeDrawer,
    setActiveDrawer,
    videos,
    activeVideoIndex,
    comments,
    addComment,
    toggleCommentLike,
    openUserProfile,
  } = useApp();
  const [commentInput, setCommentInput] = useState('');

  if (activeDrawer !== 'comment') return null;

  const currentVideo = videos[activeVideoIndex];
  const videoComments = currentVideo ? comments[currentVideo.id] || [] : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentVideo) return;
    addComment(currentVideo.id, commentInput);
    setCommentInput('');
  };

  const handleUserClick = (user: { id: string; name: string; username: string; avatar: string; isVerified?: boolean }) => {
    openUserProfile({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      isVerified: Boolean(user.isVerified),
      isFollowed: false,
      followersCount: 24500,
    });
    setActiveDrawer('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={() => setActiveDrawer('none')} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-[#0E131F] border-t border-white/10 rounded-t-3xl h-[65vh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 mx-auto">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-white/10">
          <div className="w-8" /> {/* spacer */}
          <h3 className="text-sm font-bold text-white font-heading">
            التعليقات ({videoComments.length})
          </h3>
          <button
            onClick={() => setActiveDrawer('none')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scrollbar">
          {videoComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-12">
              <p>لا توجد تعليقات بعد.</p>
              <p className="text-xs text-slate-500 mt-1">كن أول من يترك تعليقاً لطيفاً!</p>
            </div>
          ) : (
            videoComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 text-right">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  onClick={() => handleUserClick(comment.user)}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 cursor-pointer hover:border-[#00F2FE]"
                />
                <div className="flex-1 min-w-0">
                  <div
                    onClick={() => handleUserClick(comment.user)}
                    className="flex items-center gap-1.5 mb-0.5 cursor-pointer group w-fit"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-[#00F2FE] truncate">
                      {comment.user.name}
                    </span>
                    {comment.user.isVerified && (
                      <span className="text-[10px] text-[#00F2FE]">✓</span>
                    )}
                    <span className="text-[10px] text-slate-500">· {comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
                {/* Like Comment */}
                <button
                  onClick={() => toggleCommentLike(currentVideo.id, comment.id)}
                  className="flex flex-col items-center gap-0.5 pt-1 text-slate-400 hover:text-[#FE2C55] transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      comment.isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {comment.likesCount}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#07090E] flex items-center gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="أضف تعليقاً لطيفاً..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F2FE] transition-colors"
          />
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              commentInput.trim()
                ? 'bg-fextok-btn text-white shadow-md active:scale-95'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
