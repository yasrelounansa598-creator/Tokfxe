import React from 'react';
import { Home, Compass, MessageSquare, User, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, conversations, isAuthenticated, showToast } = useApp();

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  const handleTabSelection = (targetTab: TabType) => {
    if (!isAuthenticated && (targetTab === 'create' || targetTab === 'inbox' || targetTab === 'profile')) {
      showToast('هذه الصفحة مخصصة للأعضاء. يرجى تسجيل الدخول أو إنشاء حساب 🔒');
      setCurrentTab('auth');
      return;
    }
    setCurrentTab(targetTab);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'feed',
      label: 'الرئيسية',
      icon: <Home className="w-5 h-5 transition-transform" />,
    },
    {
      id: 'explore',
      label: 'استكشف',
      icon: <Compass className="w-5 h-5 transition-transform" />,
    },
    {
      id: 'create',
      label: 'إنشاء',
      icon: null, // Special neon plus button
    },
    {
      id: 'inbox',
      label: 'صندوق الوارد',
      icon: (
        <div className="relative">
          <MessageSquare className="w-5 h-5 transition-transform" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#FF00A8] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#05070B]">
              {totalUnread}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'profile',
      label: 'صفحتي',
      icon: <User className="w-5 h-5 transition-transform" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#05070B]/95 backdrop-blur-md border-t border-white/10 px-2 py-1 w-full pb-[env(safe-area-inset-bottom,4px)] select-none">
      <div className="max-w-lg mx-auto flex items-center justify-around h-13">
        {tabs.map((tab) => {
          if (tab.id === 'create') {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelection('create')}
                className="relative group min-w-[54px] min-h-[44px] flex items-center justify-center px-2 focus:outline-none cursor-pointer"
                aria-label="إنشاء محتوى جديد في Tok Fxe"
              >
                {/* Tok Fxe Neon Create Button with Cyan and Pink split background */}
                <div className="relative w-11 h-7 rounded-lg flex items-center justify-center transition-transform active:scale-90 shadow-lg">
                  {/* Cyan left tab */}
                  <div className="absolute inset-0 bg-[#00D9FF] rounded-lg -translate-x-1" />
                  {/* Pink right tab */}
                  <div className="absolute inset-0 bg-[#FF00A8] rounded-lg translate-x-1" />
                  {/* Dark center surface */}
                  <div className="relative w-10 h-7 bg-[#05070B] rounded-md flex items-center justify-center border border-white/20">
                    <Plus className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          }

          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelection(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
                isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-[#FF00A8] rounded-full shadow-[0_0_6px_#FF00A8]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
