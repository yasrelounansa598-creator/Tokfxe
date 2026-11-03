/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/Navigation/BottomNav';
import { FeedView } from './components/Feed/FeedView';
import { ExploreView } from './components/Explore/ExploreView';
import { CreateModal } from './components/Create/CreateModal';
import { InboxView } from './components/Inbox/InboxView';
import { ProfileView } from './components/Profile/ProfileView';
import { LiveRoomView } from './components/Live/LiveRoomView';
import { LiveStreamModal } from './components/Live/LiveStreamModal';
import { IncomingCallModal } from './components/Calling/IncomingCallModal';
import { ActiveCallModal } from './components/Calling/ActiveCallModal';
import { AuthModal } from './components/Auth/AuthModal';
import { WalletModal } from './components/Wallet/WalletModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { ReportModal } from './components/Feed/ReportModal';
import { FollowersModal } from './components/Profile/FollowersModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { FollowRequestsModal } from './components/Profile/FollowRequestsModal';
import { Toast } from './components/Common/Toast';
import { AndroidSplashScreen } from './components/Common/AndroidSplashScreen';
import { AuthPage } from './components/Auth/AuthPage';

const AppContent: React.FC = () => {
  const { currentTab, activeLiveRoom, isAuthenticated, setCurrentTab } = useApp();

  return (
    <div className="fixed inset-0 w-full h-full bg-[#05070B] text-white flex flex-col overflow-hidden font-arabic select-none antialiased">
      {/* Android Native Cold-Start Splash Screen */}
      <AndroidSplashScreen />

      {/* Fullscreen Live Broadcast / Spectator Room */}
      {activeLiveRoom ? (
        <LiveRoomView />
      ) : currentTab === 'auth' ? (
        <AuthPage onSuccess={() => setCurrentTab('feed')} />
      ) : (
        <>
          {/* Active Tab Screen */}
          <main className="flex-1 w-full h-full relative overflow-hidden">
            {currentTab === 'feed' && <FeedView />}
            {currentTab === 'explore' && <ExploreView />}
            {currentTab === 'create' &&
              (isAuthenticated ? (
                <CreateModal />
              ) : (
                <AuthPage onSuccess={() => setCurrentTab('create')} />
              ))}
            {currentTab === 'inbox' &&
              (isAuthenticated ? (
                <InboxView />
              ) : (
                <AuthPage onSuccess={() => setCurrentTab('inbox')} />
              ))}
            {currentTab === 'profile' && <ProfileView />}
          </main>

          {/* Bottom Navigation (strictly inside the app at the very bottom) */}
          {currentTab !== 'create' && <BottomNav />}
        </>
      )}

      {/* Live Stream Setup Modal */}
      <LiveStreamModal />

      {/* Calling Overlays */}
      <IncomingCallModal />
      <ActiveCallModal />

      {/* Auth, Wallet, Settings & Admin Modals */}
      <AuthModal />
      <WalletModal />
      <SettingsModal />
      <AdminPanelModal />

      {/* Safety & Social Modals */}
      <ReportModal />
      <FollowersModal />
      <UserProfileModal />
      <FollowRequestsModal />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
