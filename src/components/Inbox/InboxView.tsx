import React, { useState } from 'react';
import {
  MessageSquare,
  Bell,
  ArrowRight,
  Send,
  Phone,
  Video,
  MoreVertical,
  Heart,
  UserPlus,
  CheckCheck,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Creator } from '../../types';

export const InboxView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendDirectMessage,
    notifications,
    showToast,
    startCall,
    callLogs,
    openReportModal,
    openUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'messages' | 'calls' | 'activity'>('messages');
  const [activityFilter, setActivityFilter] = useState<'all' | 'like' | 'comment' | 'follow'>('all');
  const [chatInput, setChatInput] = useState('');
  const [showChatOptions, setShowChatOptions] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConversationId) return;
    sendDirectMessage(activeConversationId, chatInput);
    setChatInput('');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activityFilter === 'all') return true;
    return n.type === activityFilter;
  });

  const getPartnerCreator = (user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  }): Creator => {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isFollowed: true,
      followersCount: 12000,
    };
  };

  return (
    <div className="w-full h-full bg-[#07090E] text-white flex flex-col overflow-hidden pb-16">
      {/* If Chat Thread is active, show the conversation view */}
      {activeConversation ? (
        <div className="w-full h-full flex flex-col bg-[#07090E] animate-in slide-in-from-left duration-200 relative">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0E131F] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveConversationId(null);
                  setShowChatOptions(false);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                title="رجوع"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div
                onClick={() => openUserProfile(getPartnerCreator(activeConversation.user))}
                className="relative cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={activeConversation.user.avatar}
                  alt={activeConversation.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#00F2FE]/40"
                />
                {activeConversation.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0E131F]" />
                )}
              </div>
              <div
                onClick={() => openUserProfile(getPartnerCreator(activeConversation.user))}
                className="cursor-pointer group"
              >
                <h4 className="text-xs font-bold text-white group-hover:text-[#00F2FE] flex items-center gap-1">
                  {activeConversation.user.name}
                  {activeConversation.user.isVerified && (
                    <span className="text-[10px] text-[#00F2FE]">✓</span>
                  )}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {activeConversation.user.isOnline ? 'متصل الآن' : 'غير متصل'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 relative">
              <button
                onClick={() => startCall(getPartnerCreator(activeConversation.user), 'voice')}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center hover:text-[#00F2FE] transition-colors"
                title="مكالمة صوتية"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => startCall(getPartnerCreator(activeConversation.user), 'video')}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center hover:text-[#FE2C55] transition-colors"
                title="مكالمة فيديو"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowChatOptions(!showChatOptions)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors"
                title="خيارات المحادثة"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Chat Options Dropdown */}
              {showChatOptions && (
                <div className="absolute left-0 top-10 w-44 bg-[#0E131F] border border-white/10 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowChatOptions(false);
                      openUserProfile(getPartnerCreator(activeConversation.user));
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <span>عرض الملف الشخصي</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowChatOptions(false);
                      openReportModal('user', activeConversation.user.id);
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-rose-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>إبلاغ عن الحساب</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowChatOptions(false);
                      showToast('تم كتم إشعارات المحادثة 🔕');
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-slate-300 hover:bg-white/5"
                  >
                    كتم الإشعارات
                  </button>
                  <button
                    onClick={() => {
                      setShowChatOptions(false);
                      showToast('تم مسح المحادثة محلياً 🗑️');
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-slate-400 hover:bg-white/5 border-t border-white/5"
                  >
                    مسح المحادثة
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.isMine
                      ? 'bg-neon-gradient text-white rounded-br-xs shadow-md'
                      : 'bg-white/10 text-slate-100 rounded-bl-xs border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 flex items-center gap-1 font-mono">
                  {msg.timestamp}
                  {msg.isMine && <CheckCheck className="w-3 h-3 text-[#00F2FE]" />}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0E131F] border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="اكتب رسالة خاصة..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F2FE]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-9 h-9 rounded-full bg-neon-gradient text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      ) : (
        /* Conversations & Activity Main View */
        <div className="w-full h-full flex flex-col">
          {/* Top Tabs */}
          <div className="px-4 pt-3 pb-2 border-b border-white/10 bg-[#07090E]/95 backdrop-blur-md shrink-0">
            <div className="flex items-center justify-around bg-white/5 p-1 rounded-xl border border-white/10 mb-2">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'messages'
                    ? 'bg-neon-gradient text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>الرسائل</span>
              </button>

              <button
                onClick={() => setActiveTab('calls')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'calls'
                    ? 'bg-neon-gradient text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>المكالمات ({callLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'bg-neon-gradient text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>التنبيهات</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Messages List */}
          {activeTab === 'messages' && (
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={conv.user.avatar}
                        alt={conv.user.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      {conv.user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#07090E]" />
                      )}
                    </div>
                    <div className="min-w-0 text-right">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00F2FE] transition-colors flex items-center gap-1">
                        {conv.user.name}
                        {conv.user.isVerified && (
                          <span className="text-[10px] text-[#00F2FE]">✓</span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[200px]">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {conv.lastMessageTime}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-[#FE2C55] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Call Logs History */}
          {activeTab === 'calls' && (
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar">
              {callLogs.map((log) => {
                const partnerCreator: Creator = {
                  id: log.userId,
                  name: log.userName,
                  username: log.userName.toLowerCase().replace(/\s+/g, '_'),
                  avatar: log.userAvatar,
                  isVerified: true,
                  isFollowed: true,
                  followersCount: 15400,
                };

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={log.userAvatar}
                        alt={log.userName}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {log.userName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          {log.direction === 'incoming' && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <PhoneIncoming className="w-3.5 h-3.5" /> واردة
                            </span>
                          )}
                          {log.direction === 'outgoing' && (
                            <span className="text-sky-400 flex items-center gap-1">
                              <PhoneOutgoing className="w-3.5 h-3.5" /> صادرة
                            </span>
                          )}
                          {log.direction === 'missed' && (
                            <span className="text-rose-500 flex items-center gap-1">
                              <PhoneMissed className="w-3.5 h-3.5" /> فائتة
                            </span>
                          )}
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {log.timestamp} {log.duration && `(${log.duration})`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startCall(partnerCreator, 'voice')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-colors"
                        title="معاودة الاتصال الصوتي"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startCall(partnerCreator, 'video')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FE2C55]/20 text-slate-300 hover:text-[#FE2C55] border border-white/10 flex items-center justify-center transition-colors"
                        title="معاودة الاتصال المرئي"
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Activity & Notifications */}
          {activeTab === 'activity' && (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Activity Filters */}
              <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5">
                {[
                  { label: 'الكل', key: 'all' },
                  { label: 'الإعجابات ❤️', key: 'like' },
                  { label: 'التعليقات 💬', key: 'comment' },
                  { label: 'المتابعات 👤', key: 'follow' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActivityFilter(item.key as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                      activityFilter === item.key
                        ? 'bg-white text-[#07090E] border-white font-bold'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Notification Items */}
              <div className="divide-y divide-white/5">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 transition-colors ${
                      notif.isRead ? 'bg-transparent' : 'bg-white/[0.02]'
                    }`}
                  >
                    <img
                      src={notif.user.avatar}
                      alt={notif.user.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-xs text-white leading-relaxed">
                        <span className="font-bold">{notif.user.name}</span>{' '}
                        <span className="text-slate-300">{notif.text}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        {notif.time}
                      </span>
                    </div>

                    {notif.videoPoster ? (
                      <img
                        src={notif.videoPoster}
                        alt="video"
                        className="w-10 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <button
                        onClick={() => showToast(`تمت متابعة ${notif.user.name}`)}
                        className="px-3 py-1 bg-neon-gradient text-white text-[11px] font-bold rounded-lg shrink-0 shadow-sm"
                      >
                        رد المتابعة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
