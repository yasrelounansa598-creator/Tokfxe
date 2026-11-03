import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  VideoItem,
  CommentItem,
  CommentReply,
  Conversation,
  NotificationItem,
  UserProfile,
  TabType,
  FeedSubTab,
  LiveStreamRoom,
  LiveComment,
  LiveGift,
  Creator,
  CoinPackage,
  WalletTransaction,
  CallLogItem,
  ActiveCallState,
  ContentReport,
  FollowRequest,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_VIDEOS,
  INITIAL_COMMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LIVE_ROOMS,
  GIFTS_CATALOG,
  INITIAL_TRANSACTIONS,
  INITIAL_CALL_LOGS,
  INITIAL_REPORTS,
  INITIAL_FOLLOW_REQUESTS,
} from '../data/mockData';
import { soundEffects } from '../utils/audioSynthesizer';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  getMissingFirebaseKeys,
  mapFirebaseAuthError,
} from '../firebase/config';
import { db } from '../firebase/firestore';
import {
  getUserProfile,
  getUserProfileByUsername,
  createUserProfileWithUniqueUsername,
  isUsernameAvailable,
  updateUserProfile as updateFirestoreUserProfile,
} from '../services/userService';
import {
  createFirestorePost,
  subscribeToPublicPosts,
  getUserPosts,
  deleteFirestorePost,
} from '../services/postService';
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  acceptFollowRequest as acceptFsFollowRequest,
  rejectFollowRequest as rejectFsFollowRequest,
} from '../services/followService';
import {
  toggleLikePost,
  hasUserLikedPost,
  addPostComment,
  subscribeToPostComments,
} from '../services/interactionService';
import {
  RTC_CONFIG,
  acquireUserMedia,
  initiateFirestoreCall,
  answerFirestoreCall,
  endFirestoreCall,
  sendFirestoreIceCandidate,
  subscribeToIncomingCalls,
  subscribeToCallSession,
  subscribeToRemoteIceCandidates,
} from '../services/callService';

interface AppContextType {
  // Navigation
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  feedSubTab: FeedSubTab;
  setFeedSubTab: (tab: FeedSubTab) => void;

  // Video Feed & Actions
  videos: VideoItem[];
  activeVideoIndex: number;
  setActiveVideoIndex: (index: number) => void;
  toggleLike: (videoId: string) => void;
  toggleBookmark: (videoId: string) => void;
  toggleFollow: (creatorId: string) => void;
  comments: Record<string, CommentItem[]>;
  addComment: (videoId: string, text: string) => void;
  addCommentReply: (videoId: string, commentId: string, text: string) => void;
  toggleCommentLike: (videoId: string, commentId: string) => void;
  addNewVideo: (video: Partial<VideoItem>) => void;
  downloadVideo: (video: VideoItem) => void;

  // Live Streaming Suite
  liveRooms: LiveStreamRoom[];
  activeLiveRoom: LiveStreamRoom | null;
  isBroadcasting: boolean;
  isSetupLiveModalOpen: boolean;
  setIsSetupLiveModalOpen: (open: boolean) => void;
  isEndStreamModalOpen: boolean;
  setIsEndStreamModalOpen: (open: boolean) => void;
  isGiftDrawerOpen: boolean;
  setIsGiftDrawerOpen: (open: boolean) => void;
  isInviteGuestDrawerOpen: boolean;
  setIsInviteGuestDrawerOpen: (open: boolean) => void;
  activeLiveComments: LiveComment[];
  activeGiftBanner: { gift: LiveGift; senderName: string } | null;
  userCameraStream: MediaStream | null;
  lastStreamSummary: {
    title: string;
    duration: string;
    peakViewers: number;
    likes: number;
    diamonds: number;
  } | null;

  startBroadcasting: (params: { title: string; category: string; coverUrl?: string; isPrivate?: boolean; type?: 'video' | 'audio' }) => Promise<void>;
  endBroadcasting: () => void;
  confirmEndStreamAndSave: (saveReplay: boolean) => void;
  joinLiveRoom: (roomId: string) => void;
  leaveLiveRoom: () => void;
  sendLiveComment: (text: string) => void;
  sendLiveGift: (giftId: string) => void;
  sendLiveHeart: () => void;
  inviteCoHost: (creator: Creator) => void;
  endCoHost: () => void;

  // Messaging & Calling
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendDirectMessage: (conversationId: string, text: string, mediaType?: 'text' | 'image' | 'video' | 'audio', mediaUrl?: string) => void;
  activeCall: ActiveCallState | null;
  incomingCall: ActiveCallState | null;
  callLogs: CallLogItem[];
  startCall: (partner: Creator, type: 'voice' | 'video') => void;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallCamera: () => void;

  // Wallet & Store
  walletTransactions: WalletTransaction[];
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  buyCoins: (pkg: CoinPackage) => void;

  // Profile & Auth
  userProfile: UserProfile;
  currentUser: FirebaseUser | null;
  isAuthReady: boolean;
  isFirebaseConfigured: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupUser: (name: string, username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => void;

  // Settings & Moderation
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  reports: ContentReport[];
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportTarget: { type: 'video' | 'comment' | 'user'; id: string } | null;
  openReportModal: (type: 'video' | 'comment' | 'user', id: string) => void;
  submitReport: (reason: string, details?: string) => void;
  resolveReport: (reportId: string, action: 'delete_content' | 'ban_user' | 'dismiss') => void;
  blockUser: (creator: Creator) => void;
  unblockUser: (creatorId: string) => void;

  // User Profile Viewing & Social Network
  selectedUserProfile: Creator | null;
  openUserProfile: (creator: Creator) => void;
  closeUserProfile: () => void;
  followRequests: FollowRequest[];
  requestFollow: (creatorId: string) => void;
  acceptFollowRequest: (requestId: string) => void;
  rejectFollowRequest: (requestId: string) => void;
  isFollowRequestsModalOpen: boolean;
  setIsFollowRequestsModalOpen: (open: boolean) => void;
  changePostPrivacy: (postId: string, privacy: 'public' | 'followers' | 'friends' | 'private') => void;
  deletePost: (postId: string) => void;

  // Followers & Following Modal
  isFollowersModalOpen: boolean;
  setIsFollowersModalOpen: (open: boolean) => void;
  followersModalType: 'followers' | 'following';
  setFollowersModalType: (type: 'followers' | 'following') => void;

  // Notifications & Sound
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
  activeDrawer: 'none' | 'comment' | 'share' | 'sound';
  setActiveDrawer: (drawer: 'none' | 'comment' | 'share' | 'sound') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & SubTabs
  const [currentTab, setCurrentTab] = useState<TabType>('feed');
  const [feedSubTab, setFeedSubTab] = useState<FeedSubTab>('foryou');
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'comment' | 'share' | 'sound'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Firebase Auth State (Zero reliance on localStorage for authentication status)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Modals & Panels State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'video' | 'comment' | 'user'; id: string } | null>(null);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');

  // Selected other user profile to view & follow requests
  const [selectedUserProfile, setSelectedUserProfile] = useState<Creator | null>(null);
  const [isFollowRequestsModalOpen, setIsFollowRequestsModalOpen] = useState(false);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>(() => {
    const saved = localStorage.getItem('tokfxe_follow_requests');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem('tokfxe_follow_requests', JSON.stringify(followRequests));
  }, [followRequests]);

  // Calling State
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<ActiveCallState | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(() => {
    const saved = localStorage.getItem('fextok_call_logs');
    return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
  });

  // WebRTC Peer Connection & Stream References
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callSessionUnsubRef = useRef<(() => void) | null>(null);
  const iceCandidatesUnsubRef = useRef<(() => void) | null>(null);
  const activeCallIdRef = useRef<string | null>(null);


  // Wallet & Reports State
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('fextok_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [reports, setReports] = useState<ContentReport[]>(() => {
    const saved = localStorage.getItem('fextok_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Live Stream State
  const [liveRooms, setLiveRooms] = useState<LiveStreamRoom[]>(() => {
    const saved = localStorage.getItem('fextok_live_rooms');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_ROOMS;
  });
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveStreamRoom | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSetupLiveModalOpen, setIsSetupLiveModalOpen] = useState(false);
  const [isEndStreamModalOpen, setIsEndStreamModalOpen] = useState(false);
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [isInviteGuestDrawerOpen, setIsInviteGuestDrawerOpen] = useState(false);
  const [activeLiveComments, setActiveLiveComments] = useState<LiveComment[]>([]);
  const [activeGiftBanner, setActiveGiftBanner] = useState<{ gift: LiveGift; senderName: string } | null>(null);
  const [userCameraStream, setUserCameraStream] = useState<MediaStream | null>(null);
  const [broadcastStartTime, setBroadcastStartTime] = useState<number | null>(null);
  const [lastStreamSummary, setLastStreamSummary] = useState<{
    title: string;
    duration: string;
    peakViewers: number;
    likes: number;
    diamonds: number;
  } | null>(null);

  // User & Data State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fextok_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_USER,
          ...parsed,
          securitySettings: {
            ...INITIAL_USER.securitySettings,
            ...(parsed.securitySettings || {}),
            activeSessions:
              parsed.securitySettings?.activeSessions ||
              INITIAL_USER.securitySettings.activeSessions,
            blockedUsers: parsed.securitySettings?.blockedUsers || [],
          },
          notificationSettings: {
            ...INITIAL_USER.notificationSettings,
            ...(parsed.notificationSettings || {}),
          },
          replays: Array.isArray(parsed.replays) ? parsed.replays : INITIAL_USER.replays,
        };
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('fextok_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [comments, setComments] = useState<Record<string, CommentItem[]>>(() => {
    const saved = localStorage.getItem('fextok_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('fextok_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Persistence
  useEffect(() => {
    localStorage.setItem('fextok_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('fextok_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fextok_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('fextok_transactions', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  useEffect(() => {
    localStorage.setItem('fextok_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('fextok_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Real Firebase Auth Lifecycle (onAuthStateChanged) & Firestore Profile Sync
  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      setIsAuthenticated(false);
      setCurrentUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Attempt to load Firestore profile
        if (db) {
          try {
            let profile = await getUserProfile(user.uid);
            if (!profile) {
              // First time signin or missing Firestore doc: auto-reserve
              const fallbackUsername = (user.displayName || user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`)
                .replace(/[^a-zA-Z0-9_]/g, '')
                .toLowerCase() || `user_${user.uid.slice(0, 5)}`;

              const res = await createUserProfileWithUniqueUsername(user.uid, {
                displayName: user.displayName || 'مستخدم Tok Fxe',
                username: fallbackUsername,
                email: user.email || '',
                photoURL: user.photoURL || undefined,
              });
              if (res.profile) {
                profile = res.profile;
              }
            }

            if (profile) {
              setUserProfile((prev) => ({
                ...prev,
                id: profile.uid,
                name: profile.displayName || prev.name,
                username: profile.username || prev.username,
                email: profile.email || prev.email,
                avatar: profile.photoURL || prev.avatar,
                bio: profile.bio || prev.bio,
                followersCount: profile.followersCount ?? prev.followersCount,
                followingCount: profile.followingCount ?? prev.followingCount,
                postsCount: profile.postsCount ?? prev.postsCount,
                isPrivate: profile.isPrivate ?? false,
                isVerified: profile.isVerified ?? false,
              }));
            }
          } catch (e) {
            console.warn('[Tok Fxe] Error syncing Firestore user profile:', e);
          }
        } else {
          setUserProfile((prev) => ({
            ...prev,
            id: user.uid,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Real-time WebRTC incoming calls listener via Firestore
  useEffect(() => {
    if (!db || !currentUser?.uid) return;

    const unsub = subscribeToIncomingCalls(db, currentUser.uid, (incoming) => {
      // Don't interrupt if already in active call
      if (activeCallIdRef.current && activeCallIdRef.current !== incoming.callId) return;

      activeCallIdRef.current = incoming.callId;
      setIncomingCall({
        callId: incoming.callId,
        isActive: true,
        isIncoming: true,
        callType: incoming.callType,
        partner: {
          id: incoming.callerId,
          name: incoming.callerName,
          username: incoming.callerUsername,
          avatar: incoming.callerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          isVerified: false,
          isFollowed: false,
          followersCount: 0,
          followingCount: 0,
        },
        durationSeconds: 0,
        isMuted: false,
        isCameraOff: false,
      });
      soundEffects.playFollow();
      showToast(`مكالمة واردة من ${incoming.callerName} 📞`);
    });

    return () => {
      unsub();
    };
  }, [currentUser?.uid]);

  // Real-time Firestore Feed Subscription
  useEffect(() => {
    if (!db) return;

    try {
      const unsubscribe = subscribeToPublicPosts((fsPosts) => {
        if (!fsPosts || fsPosts.length === 0) return;

        const converted: VideoItem[] = fsPosts.map((fp) => ({
          id: fp.postId,
          videoUrl: fp.mediaURL || '',
          posterUrl: fp.thumbnailURL || (fp.photos && fp.photos[0]) || '/posters/fextok_cyber_city.jpg',
          creator: {
            id: fp.author.uid,
            name: fp.author.displayName,
            username: fp.author.username,
            avatar: fp.author.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            isVerified: fp.author.isVerified ?? false,
            isFollowed: false,
            followersCount: 0,
          },
          caption: fp.caption,
          hashtags: fp.hashtags || ['#TokFxe'],
          musicTitle: fp.musicTitle || 'الصوت الأصلي - ' + fp.author.displayName,
          musicAuthor: fp.author.displayName,
          likesCount: fp.likesCount || 0,
          commentsCount: fp.commentsCount || 0,
          sharesCount: fp.sharesCount || 0,
          bookmarksCount: 0,
          viewsCount: 1,
          isLiked: false,
          isBookmarked: false,
          category: 'trending',
          timestamp: 'منذ قليل',
          privacy: fp.visibility,
          mediaType: fp.mediaType || 'video',
          photos: fp.photos || [],
        }));

        setVideos((prevVideos) => {
          const fsIds = new Set(converted.map((p) => p.id));
          const localVideos = prevVideos.filter((v) => !fsIds.has(v.id));
          return [...converted, ...localVideos];
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('[Tok Fxe] Could not subscribe to public posts:', err);
    }
  }, []);

  // Real-time Firestore Comments for active video
  useEffect(() => {
    const currentVideo = videos[activeVideoIndex];
    if (!db || !currentVideo?.id) return;

    try {
      const unsubscribe = subscribeToPostComments(currentVideo.id, (fsComments) => {
        if (!fsComments || fsComments.length === 0) return;

        const converted: CommentItem[] = fsComments.map((fc) => ({
          id: fc.commentId,
          videoId: fc.postId,
          user: {
            id: fc.user.uid,
            name: fc.user.displayName,
            username: fc.user.username,
            avatar: fc.user.photoURL,
            isVerified: fc.user.isVerified ?? false,
          },
          text: fc.text,
          timestamp: 'الآن',
          likesCount: 0,
          isLiked: false,
          replies: [],
        }));

        setComments((prev) => {
          const existingList = prev[currentVideo.id] || [];
          const fsIds = new Set(converted.map((c) => c.id));
          const localOnly = existingList.filter((c) => !fsIds.has(c.id));
          return {
            ...prev,
            [currentVideo.id]: [...converted, ...localOnly],
          };
        });
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('[Tok Fxe] Comments subscription notice:', e);
    }
  }, [activeVideoIndex, videos.length]);

  // Sync real like state from Firestore for active video
  useEffect(() => {
    const currentVideo = videos[activeVideoIndex];
    if (!db || !currentUser || !currentVideo?.id) return;

    hasUserLikedPost(currentVideo.id, currentUser.uid)
      .then((liked) => {
        if (liked !== undefined) {
          setVideos((prev) =>
            prev.map((v) => (v.id === currentVideo.id ? { ...v, isLiked: liked } : v))
          );
        }
      })
      .catch((err) => console.warn('[Tok Fxe] hasUserLikedPost check notice:', err));
  }, [activeVideoIndex, currentUser?.uid]);

  // Real Firebase Auth Methods
  const loginUser = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      const err = 'يرجى إدخال البريد الإلكتروني وكلمة المرور.';
      showToast(err);
      return { success: false, error: err };
    }

    if (!isFirebaseConfigured() || !auth) {
      const missing = getMissingFirebaseKeys();
      const err = `إعدادات Firebase غير مكتملة في متغيرات البيئة (${missing.join(', ')}). يرجى إدخال إعدادات المشروع في ملف .env أولاً.`;
      showToast(err);
      return { success: false, error: err };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (db) {
        try {
          const profile = await getUserProfile(cred.user.uid);
          if (profile) {
            setUserProfile((prev) => ({
              ...prev,
              id: profile.uid,
              name: profile.displayName || prev.name,
              username: profile.username || prev.username,
              email: profile.email || prev.email,
              avatar: profile.photoURL || prev.avatar,
              bio: profile.bio || prev.bio,
              followersCount: profile.followersCount ?? prev.followersCount,
              followingCount: profile.followingCount ?? prev.followingCount,
              postsCount: profile.postsCount ?? prev.postsCount,
              isPrivate: profile.isPrivate ?? false,
              isVerified: profile.isVerified ?? false,
            }));
          }
        } catch (e) {
          console.warn('[Tok Fxe] Firestore login sync warning:', e);
        }
      } else {
        setUserProfile((prev) => ({
          ...prev,
          id: cred.user.uid,
          email: cred.user.email || prev.email,
          name: cred.user.displayName || prev.name,
        }));
      }

      setIsAuthModalOpen(false);
      showToast(`مرحباً بعودتك يا ${cred.user.displayName || 'مستخدم Tok Fxe'}! 👋`);
      return { success: true };
    } catch (err: unknown) {
      const errorText = mapFirebaseAuthError(err);
      showToast(errorText);
      return { success: false, error: errorText };
    }
  };

  const signupUser = async (
    name: string,
    username: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || !username || !email || !pass) {
      const err = 'يرجى ملء جميع الحقول المطلوبة.';
      showToast(err);
      return { success: false, error: err };
    }

    if (!isFirebaseConfigured() || !auth) {
      const missing = getMissingFirebaseKeys();
      const err = `إعدادات Firebase غير مكتملة في متغيرات البيئة (${missing.join(', ')}). يرجى إدخال إعدادات المشروع في ملف .env أولاً.`;
      showToast(err);
      return { success: false, error: err };
    }

    try {
      const cleanUser = username.replace('@', '').trim();

      // Check username reservation in Firestore
      if (db) {
        try {
          const available = await isUsernameAvailable(cleanUser);
          if (!available) {
            const err = 'اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم مستخدم آخر.';
            showToast(err);
            return { success: false, error: err };
          }
        } catch (e) {
          console.warn('[Tok Fxe] Username check warning:', e);
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user) {
        try {
          await updateFirebaseProfile(cred.user, { displayName: name.trim() });
        } catch {
          // ignore profile update error
        }

        // Atomically create Firestore User profile and reserve username
        if (db) {
          try {
            await createUserProfileWithUniqueUsername(cred.user.uid, {
              displayName: name.trim(),
              username: cleanUser,
              email: cred.user.email || email.trim(),
            });
          } catch (e) {
            console.warn('[Tok Fxe] Failed to create Firestore user document:', e);
          }
        }
      }

      setUserProfile((prev) => ({
        ...prev,
        id: cred.user.uid,
        name: name.trim(),
        username: cleanUser,
        email: cred.user.email || email.trim(),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      }));

      setIsAuthModalOpen(false);
      showToast('تم إنشاء الحساب وحفظ الملف الشخصي في قاعدة البيانات بنجاح! 🎉');
      return { success: true };
    } catch (err: unknown) {
      const errorText = mapFirebaseAuthError(err);
      showToast(errorText);
      return { success: false, error: errorText };
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('fextok_auth');
      setIsSettingsModalOpen(false);
      showToast('تم تسجيل الخروج بنجاح 👋');
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) {
      const err = 'يرجى إدخال البريد الإلكتروني.';
      showToast(err);
      return { success: false, error: err };
    }

    if (!isFirebaseConfigured() || !auth) {
      const err = 'إعدادات Firebase غير مكتملة في متغيرات البيئة.';
      showToast(err);
      return { success: false, error: err };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(`تم إرسال رابط استعادة كلمة المرور إلى ${email} 📩`);
      return { success: true };
    } catch (err) {
      const errorText = mapFirebaseAuthError(err);
      showToast(errorText);
      return { success: false, error: errorText };
    }
  };

  const deleteAccount = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsSettingsModalOpen(false);
    showToast('تم حذف الحساب نهائياً');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Video Interactions
  // Video Interactions
  const toggleLike = async (videoId: string) => {
    const targetVideo = videos.find((vid) => vid.id === videoId);
    const newLiked = !targetVideo?.isLiked;

    setVideos((prev) =>
      prev.map((vid) => {
        if (vid.id === videoId) {
          if (newLiked) soundEffects.playLikePop();
          return {
            ...vid,
            isLiked: newLiked,
            likesCount: newLiked ? vid.likesCount + 1 : Math.max(0, vid.likesCount - 1),
          };
        }
        return vid;
      })
    );

    // Sync with Firestore if user is authenticated and DB is ready
    if (currentUser && db) {
      try {
        await toggleLikePost(videoId, currentUser.uid);
      } catch (err) {
        console.warn('[Tok Fxe] Firestore toggleLikePost error (fallback to local):', err);
      }
    }
  };

  const toggleBookmark = (videoId: string) => {
    setVideos((prev) =>
      prev.map((vid) => {
        if (vid.id === videoId) {
          const newBookmarked = !vid.isBookmarked;
          showToast(newBookmarked ? 'تمت الإضافة إلى المحفوظات' : 'تمت الإزالة من المحفوظات');
          return {
            ...vid,
            isBookmarked: newBookmarked,
            bookmarksCount: newBookmarked ? vid.bookmarksCount + 1 : vid.bookmarksCount - 1,
          };
        }
        return vid;
      })
    );
  };

  const toggleFollow = async (creatorId: string) => {
    const targetVideo = videos.find((vid) => vid.creator.id === creatorId);
    const targetCreator = targetVideo?.creator || selectedUserProfile;
    const isCurrentlyFollowed = targetCreator?.isFollowed;
    const willFollow = !isCurrentlyFollowed;

    setVideos((prev) =>
      prev.map((vid) => {
        if (vid.creator.id === creatorId) {
          return {
            ...vid,
            creator: {
              ...vid.creator,
              isFollowed: willFollow,
              followersCount: willFollow
                ? vid.creator.followersCount + 1
                : Math.max(0, vid.creator.followersCount - 1),
            },
          };
        }
        return vid;
      })
    );

    setUserProfile((prev) => ({
      ...prev,
      followingCount: willFollow ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
    }));

    showToast(
      willFollow
        ? `أنت الآن تتابع ${targetCreator?.name || creatorId}`
        : `ألغيت متابعة ${targetCreator?.name || creatorId}`
    );

    if (currentUser && db && creatorId) {
      try {
        if (willFollow) {
          await followUser(currentUser.uid, creatorId);
        } else {
          await unfollowUser(currentUser.uid, creatorId);
        }
      } catch (err) {
        console.warn('[Tok Fxe] Firestore follow sync error:', err);
      }
    }
  };

  const openUserProfile = async (creator: Creator) => {
    if (creator.id === userProfile.id || creator.username === userProfile.username) {
      setSelectedUserProfile(null);
      setCurrentTab('profile');
      return;
    }
    const isBlocked = userProfile?.securitySettings?.blockedUsers?.some(
      (b) => b.id === creator.id || b.username === creator.username
    );
    if (isBlocked) {
      showToast('لا يمكنك عرض ملف هذا المستخدم لأنك قمت بحظره 🚫');
      return;
    }
    const latestVideo = videos.find((v) => v.creator.id === creator.id || v.creator.username === creator.username);
    const enrichedCreator: Creator = {
      ...creator,
      isFollowed: latestVideo?.creator?.isFollowed ?? creator.isFollowed,
      followersCount: latestVideo?.creator?.followersCount ?? creator.followersCount,
      coverImage: creator.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      bio: creator.bio || 'صانع محتوى في مجتمع Tok Fxe 🚀✨ شاركوني رحلتي!',
      likesCount: creator.likesCount || 420000,
      postsCount: creator.postsCount || videos.filter((v) => v.creator.id === creator.id).length || 6,
    };
    setSelectedUserProfile(enrichedCreator);

    // Fetch live Firestore profile and relationship if available
    if (db && creator.id) {
      try {
        const fsProfile = await getUserProfile(creator.id);
        if (fsProfile) {
          let followStatus: 'none' | 'following' | 'requested' = 'none';
          if (currentUser) {
            followStatus = await getFollowStatus(currentUser.uid, creator.id);
          }
          setSelectedUserProfile((prev) => {
            if (!prev || (prev.id !== creator.id && prev.username !== creator.username)) return prev;
            return {
              ...prev,
              name: fsProfile.displayName,
              username: fsProfile.username,
              avatar: fsProfile.photoURL || prev.avatar,
              bio: fsProfile.bio || prev.bio,
              followersCount: fsProfile.followersCount ?? prev.followersCount,
              followingCount: fsProfile.followingCount ?? prev.followingCount,
              postsCount: fsProfile.postsCount ?? prev.postsCount,
              isPrivate: fsProfile.isPrivate ?? false,
              isFollowed: followStatus === 'following',
              followStatus,
            };
          });
        }
      } catch (err) {
        console.warn('[Tok Fxe] Firestore openUserProfile warning:', err);
      }
    }
  };

  const closeUserProfile = () => {
    setSelectedUserProfile(null);
  };

  const requestFollow = async (creatorId: string) => {
    const targetVideo = videos.find((v) => v.creator.id === creatorId);
    const targetCreator = targetVideo?.creator || selectedUserProfile;
    const isPrivate = targetCreator?.isPrivate;

    if (currentUser && db) {
      try {
        if (isPrivate && !targetCreator?.isFollowed) {
          const res = await followUser(currentUser.uid, creatorId);
          if (res.status === 'requested') {
            if (selectedUserProfile && selectedUserProfile.id === creatorId) {
              setSelectedUserProfile({ ...selectedUserProfile, followStatus: 'requested' });
            }
            soundEffects.playFollow();
            showToast(`تم إرسال طلب المتابعة بنجاح إلى @${targetCreator?.username} 📩 بانتظار الموافقة`);
            return;
          }
        }
      } catch (err) {
        console.warn('[Tok Fxe] Firestore requestFollow error:', err);
      }
    }

    if (isPrivate && !targetCreator?.isFollowed) {
      const currentStatus = targetCreator?.followStatus;
      if (currentStatus === 'requested') {
        if (selectedUserProfile && selectedUserProfile.id === creatorId) {
          setSelectedUserProfile({ ...selectedUserProfile, followStatus: 'none' });
        }
        showToast(`تم إلغاء طلب المتابعة لـ @${targetCreator?.username}`);
      } else {
        if (selectedUserProfile && selectedUserProfile.id === creatorId) {
          setSelectedUserProfile({ ...selectedUserProfile, followStatus: 'requested' });
        }
        soundEffects.playFollow();
        showToast(`تم إرسال طلب المتابعة بنجاح إلى @${targetCreator?.username} 📩 بانتظار الموافقة`);
      }
      return;
    }

    toggleFollow(creatorId);
    if (selectedUserProfile && selectedUserProfile.id === creatorId) {
      const willFollow = !selectedUserProfile.isFollowed;
      setSelectedUserProfile({
        ...selectedUserProfile,
        isFollowed: willFollow,
        followersCount: willFollow
          ? selectedUserProfile.followersCount + 1
          : Math.max(0, selectedUserProfile.followersCount - 1),
      });
    }
  };

  const acceptFollowRequest = async (requestId: string) => {
    const req = followRequests.find((r) => r.id === requestId);
    if (req) {
      setFollowRequests((prev) => prev.filter((r) => r.id !== requestId));
      setUserProfile((prev) => ({
        ...prev,
        followersCount: prev.followersCount + 1,
      }));
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'follow',
        user: {
          name: req.user.name,
          username: req.user.username,
          avatar: req.user.avatar,
        },
        text: 'أصبح يتابعك الآن بعد قبول الطلب 🎉',
        time: 'الآن',
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      soundEffects.playFollow();
      showToast(`تم قبول طلب متابعة @${req.user.username} بنجاح ✅`);

      if (currentUser && db && req.user.id) {
        try {
          await acceptFsFollowRequest(req.user.id, currentUser.uid);
        } catch (err) {
          console.warn('[Tok Fxe] Firestore acceptFollowRequest warning:', err);
        }
      }
    }
  };

  const rejectFollowRequest = async (requestId: string) => {
    const req = followRequests.find((r) => r.id === requestId);
    setFollowRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (req) {
      showToast(`تم رفض طلب متابعة @${req.user.username}`);
      if (currentUser && db && req.user.id) {
        try {
          await rejectFsFollowRequest(req.user.id, currentUser.uid);
        } catch (err) {
          console.warn('[Tok Fxe] Firestore rejectFollowRequest warning:', err);
        }
      }
    }
  };


  const changePostPrivacy = (postId: string, privacy: 'public' | 'followers' | 'friends' | 'private') => {
    setVideos((prev) =>
      prev.map((v) => (v.id === postId ? { ...v, privacy } : v))
    );
    const privacyLabels: Record<string, string> = {
      public: 'عام (للجميع)',
      followers: 'المتابعون فقط',
      friends: 'الأصدقاء فقط',
      private: 'خاص (أنا فقط)',
    };
    showToast(`تم تغيير خصوصية المنشور إلى: ${privacyLabels[privacy] || privacy} 🔒`);
  };

  const deletePost = async (postId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== postId));
    setUserProfile((prev) => ({
      ...prev,
      postsCount: Math.max(0, prev.postsCount - 1),
    }));
    showToast('تم حذف المنشور بنجاح 🗑️');

    if (currentUser && db) {
      try {
        await deleteFirestorePost(postId, currentUser.uid);
      } catch (err) {
        console.warn('[Tok Fxe] Firestore deletePost warning:', err);
      }
    }
  };

  const addComment = async (videoId: string, text: string) => {
    if (!text.trim()) return;
    const cleanText = text.trim();
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      videoId,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
      },
      text: cleanText,
      timestamp: 'الآن',
      likesCount: 0,
      isLiked: false,
      replies: [],
    };

    setComments((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    setVideos((prev) =>
      prev.map((vid) => (vid.id === videoId ? { ...vid, commentsCount: vid.commentsCount + 1 } : vid))
    );

    soundEffects.playCommentSent();
    showToast('تم نشر تعليقك بنجاح');

    if (currentUser && db) {
      try {
        await addPostComment(
          videoId,
          {
            uid: currentUser.uid,
            displayName: userProfile.name,
            username: userProfile.username,
            photoURL: userProfile.avatar,
            isVerified: userProfile.isVerified,
          },
          cleanText
        );
      } catch (err) {
        console.warn('[Tok Fxe] Firestore addPostComment warning:', err);
      }
    }
  };


  const addCommentReply = (videoId: string, commentId: string, text: string) => {
    if (!text.trim()) return;
    const newReply: CommentReply = {
      id: `r-${Date.now()}`,
      commentId,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
      },
      text: text.trim(),
      timestamp: 'الآن',
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => {
      const list = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: list.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        }),
      };
    });

    soundEffects.playCommentSent();
    showToast('تم إضافة ردك بنجاح');
  };

  const toggleCommentLike = (videoId: string, commentId: string) => {
    setComments((prev) => {
      const list = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: list.map((c) => {
          if (c.id === commentId) {
            const nextLiked = !c.isLiked;
            return {
              ...c,
              isLiked: nextLiked,
              likesCount: nextLiked ? c.likesCount + 1 : c.likesCount - 1,
            };
          }
          return c;
        }),
      };
    });
  };

  const downloadVideo = (video: VideoItem) => {
    if (video.allowDownload === false) {
      showToast('صاحب هذا الفيديو منع تنزيله لحماية الخصوصية 🔒');
      return;
    }
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `FexTok_${video.id}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('جارِ تنزيل الفيديو إلى جهازك... 📥');
  };

  const addNewVideo = async (videoData: Partial<VideoItem>) => {
    const tempId = `vid-${Date.now()}`;
    const newVideo: VideoItem = {
      id: tempId,
      videoUrl: videoData.videoUrl || '',
      posterUrl: videoData.posterUrl || (videoData.photos && videoData.photos[0]) || '/src/assets/images/fextok_neon_card1_1793478794414.jpg',
      creator: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
        isFollowed: true,
        followersCount: userProfile.followersCount,
      },
      caption: videoData.caption || 'منشور جديد على Tok Fxe 🚀✨ #TokFxe',
      hashtags: videoData.hashtags || ['#TokFxe', '#جديد', '#إبداع'],
      musicTitle: videoData.musicTitle || 'الصوت الأصلي - ' + userProfile.name,
      musicAuthor: userProfile.name,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      viewsCount: 12,
      isLiked: true,
      isBookmarked: false,
      category: videoData.category || 'trending',
      timestamp: 'الآن',
      allowDownload: videoData.allowDownload !== false,
      privacy: videoData.privacy || 'public',
      mediaType: videoData.mediaType || 'video',
      photos: videoData.photos || [],
      textContent: videoData.textContent || '',
    };

    setVideos((prev) => [newVideo, ...prev]);
    setUserProfile((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }));
    setActiveVideoIndex(0);
    setCurrentTab('feed');
    soundEffects.playCommentSent();
    showToast('تم نشر المحتوى بنجاح على Tok Fxe! 🎉');

    if (currentUser && db) {
      try {
        const fsPost = await createFirestorePost({
          userId: currentUser.uid,
          author: {
            uid: currentUser.uid,
            displayName: userProfile.name,
            username: userProfile.username,
            photoURL: userProfile.avatar,
            isVerified: userProfile.isVerified,
          },
          caption: newVideo.caption,
          mediaType: newVideo.mediaType || 'video',
          mediaURL: newVideo.videoUrl,
          thumbnailURL: newVideo.posterUrl,
          photos: newVideo.photos,
          musicTitle: newVideo.musicTitle,
          hashtags: newVideo.hashtags,
          visibility: (newVideo.privacy as any) || 'public',
        });
        // Update local video item id with real firestore postId
        setVideos((prev) =>
          prev.map((v) => (v.id === tempId ? { ...v, id: fsPost.postId } : v))
        );
      } catch (err) {
        console.warn('[Tok Fxe] Firestore createFirestorePost failed (retained locally):', err);
      }
    }
  };

  // Live Stream Simulation Chatter
  useEffect(() => {
    if (!activeLiveRoom) return;

    const chatPool = [
      'ما شاء الله إضاءة البث خرافية! ✨',
      'تحياتي من دبي يا غالي 🇦🇪❤️',
      'فيكس توك صاير مولع الليلة 🔥',
      'أحلى بث مباشر شفته اليوم 👏',
      'كفو والله استمر بالإبداع 🚀',
      'مين يدعم في تحدي الـ PK القادم؟ 🏆',
    ];

    const usersPool = [
      { name: 'خالد المطيري', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80' },
      { name: 'منى الشامسي', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80' },
      { name: 'سلطان الدوسري', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
    ];

    const interval = setInterval(() => {
      const randomUser = usersPool[Math.floor(Math.random() * usersPool.length)];
      const randomMsg = chatPool[Math.floor(Math.random() * chatPool.length)];

      const newComment: LiveComment = {
        id: `lc-${Date.now()}-${Math.random()}`,
        userId: `u-${Date.now()}`,
        userName: randomUser.name,
        userAvatar: randomUser.avatar,
        text: randomMsg,
        timestamp: 'الآن',
      };

      setActiveLiveComments((prev) => [...prev.slice(-40), newComment]);

      setActiveLiveRoom((prev) => {
        if (!prev) return null;
        const delta = Math.floor(Math.random() * 5) - 2;
        return {
          ...prev,
          viewersCount: Math.max(12, prev.viewersCount + delta),
          likesCount: prev.likesCount + Math.floor(Math.random() * 8),
        };
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [activeLiveRoom]);

  // Live Stream Methods
  const startBroadcasting = async (params: {
    title: string;
    category: string;
    coverUrl?: string;
    isPrivate?: boolean;
    type?: 'video' | 'audio';
  }) => {
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: params.type !== 'audio' ? { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } } : false,
          audio: true,
        });
      }
    } catch {
      showToast('تم تفعيل وضع استوديو البث الذكي 🎙️');
    }

    setUserCameraStream(stream);

    const newRoom: LiveStreamRoom = {
      id: `live-${Date.now()}`,
      host: {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
        isFollowed: true,
        followersCount: userProfile.followersCount,
        isLive: true,
      },
      title: params.title || 'بث مباشر جديد على FexTok 🚀',
      coverUrl: params.coverUrl || userProfile.avatar,
      category: params.category || 'سوالف ومواهب',
      type: params.type || 'video',
      viewersCount: 142,
      likesCount: 520,
      diamondsCount: 45,
      isCoHost: false,
      startedAt: 'الآن',
      isPrivate: params.isPrivate || false,
    };

    setLiveRooms((prev) => [newRoom, ...prev]);
    setActiveLiveRoom(newRoom);
    setIsBroadcasting(true);
    setBroadcastStartTime(Date.now());
    setUserProfile((prev) => ({ ...prev, isLive: true }));
    setIsSetupLiveModalOpen(false);

    setActiveLiveComments([
      {
        id: 'lc-welcome',
        userId: 'system',
        userName: 'نظام FexTok',
        userAvatar: '/src/assets/images/fextok_creator_avatar_1793478768692.jpg',
        text: 'أهلاً بكم في البث المباشر! يرجى الالتزام بإرشادات مجتمع فيكس توك والاحترام المتبادل 🛡️',
        isHost: true,
        timestamp: 'الآن',
      },
    ]);

    showToast('أنت الآن على الهواء مباشرة! 🔴');
  };

  const endBroadcasting = () => {
    const now = Date.now();
    const durationMs = broadcastStartTime ? now - broadcastStartTime : 120000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    setLastStreamSummary({
      title: activeLiveRoom?.title || 'بث مباشر',
      duration: durationStr,
      peakViewers: activeLiveRoom ? activeLiveRoom.viewersCount + 180 : 340,
      likes: activeLiveRoom ? activeLiveRoom.likesCount : 1200,
      diamonds: activeLiveRoom ? activeLiveRoom.diamondsCount : 85,
    });

    setIsEndStreamModalOpen(true);
  };

  const confirmEndStreamAndSave = (saveReplay: boolean) => {
    if (userCameraStream) {
      userCameraStream.getTracks().forEach((track) => track.stop());
      setUserCameraStream(null);
    }

    if (saveReplay && lastStreamSummary) {
      const newReplay: import('../types').StreamReplay = {
        id: `replay-${Date.now()}`,
        title: lastStreamSummary.title,
        coverUrl: userProfile.avatar,
        videoUrl: '/videos/fextok_cyber_city.mp4',
        duration: lastStreamSummary.duration,
        date: 'اليوم',
        viewsCount: lastStreamSummary.peakViewers * 4,
        likesCount: lastStreamSummary.likes,
        diamondsEarned: lastStreamSummary.diamonds,
      };

      setUserProfile((prev) => ({
        ...prev,
        isLive: false,
        replays: [newReplay, ...(prev.replays || [])],
      }));
      showToast('تم حفظ تسجيل البث المباشر في ملفك الشخصي 📼');
    } else {
      setUserProfile((prev) => ({ ...prev, isLive: false }));
    }

    if (activeLiveRoom) {
      setLiveRooms((prev) => prev.filter((r) => r.id !== activeLiveRoom.id));
    }

    setIsBroadcasting(false);
    setActiveLiveRoom(null);
    setIsEndStreamModalOpen(false);
    showToast('تم إنهاء البث المباشر بنجاح');
  };

  const joinLiveRoom = (roomId: string) => {
    const room = liveRooms.find((r) => r.id === roomId);
    if (room) {
      setActiveLiveRoom(room);
      setActiveLiveComments([
        {
          id: `lc-join-${Date.now()}`,
          userId: userProfile.id,
          userName: userProfile.name,
          userAvatar: userProfile.avatar,
          text: `انضم ${userProfile.name} إلى البث المباشر 👋`,
          timestamp: 'الآن',
        },
      ]);
    }
  };

  const leaveLiveRoom = () => {
    if (isBroadcasting) {
      endBroadcasting();
    } else {
      setActiveLiveRoom(null);
    }
  };

  const sendLiveComment = (text: string) => {
    if (!text.trim() || !activeLiveRoom) return;
    const newComment: LiveComment = {
      id: `lc-${Date.now()}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: text.trim(),
      isHost: activeLiveRoom.host.id === userProfile.id,
      timestamp: 'الآن',
    };

    setActiveLiveComments((prev) => [...prev, newComment]);
    soundEffects.playCommentSent();
  };

  const sendLiveGift = (giftId: string) => {
    const gift = GIFTS_CATALOG.find((g) => g.id === giftId);
    if (!gift || !activeLiveRoom) return;

    if (userProfile.coinsBalance < gift.diamonds) {
      showToast('رصيد العملات غير كافٍ! افتح المتجر للشحن 🪙');
      setIsGiftDrawerOpen(false);
      setIsWalletModalOpen(true);
      return;
    }

    // Deduct coins & record transaction
    setUserProfile((prev) => ({
      ...prev,
      coinsBalance: prev.coinsBalance - gift.diamonds,
    }));

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'sent_gift',
      amount: -gift.diamonds,
      description: `إرسال هدية ${gift.nameAr} إلى ${activeLiveRoom.host.name}`,
      timestamp: 'الآن',
      giftIcon: gift.icon,
    };
    setWalletTransactions((prev) => [tx, ...prev]);

    setActiveGiftBanner({ gift, senderName: userProfile.name });
    setTimeout(() => {
      setActiveGiftBanner(null);
    }, 3200);

    setActiveLiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        diamondsCount: prev.diamondsCount + gift.diamonds,
        pkBattle: prev.pkBattle?.isActive
          ? {
              ...prev.pkBattle,
              hostScore: prev.pkBattle.hostScore + gift.diamonds * 10,
            }
          : prev.pkBattle,
      };
    });

    const newGiftComment: LiveComment = {
      id: `lc-gift-${Date.now()}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: `أرسل ${gift.nameAr} ${gift.icon} (${gift.diamonds} ماسة)`,
      isGift: true,
      giftInfo: gift,
      timestamp: 'الآن',
    };

    setActiveLiveComments((prev) => [...prev, newGiftComment]);
    soundEffects.playLikePop();
    setIsGiftDrawerOpen(false);
    showToast(`تم إرسال ${gift.nameAr} بنجاح! 🎁`);
  };

  const sendLiveHeart = () => {
    if (!activeLiveRoom) return;
    soundEffects.playLikePop();
    setActiveLiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        likesCount: prev.likesCount + 1,
        pkBattle: prev.pkBattle?.isActive
          ? { ...prev.pkBattle, hostScore: prev.pkBattle.hostScore + 1 }
          : prev.pkBattle,
      };
    });
  };

  const inviteCoHost = (creator: Creator) => {
    if (!activeLiveRoom) return;
    setActiveLiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isCoHost: true,
        coHost: creator,
        pkBattle: {
          isActive: true,
          hostScore: 1200,
          guestScore: 1150,
          timeLeft: 180,
        },
      };
    });
    setIsInviteGuestDrawerOpen(false);
    showToast(`انضم ${creator.name} في بث مشترك وبدأت جولة التحدي (PK)! ⚔️`);
  };

  const endCoHost = () => {
    if (!activeLiveRoom) return;
    setActiveLiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isCoHost: false,
        coHost: undefined,
        pkBattle: undefined,
      };
    });
    showToast('تم إنهاء البث المشترك');
  };

  // Helper to safely tear down WebRTC and release camera/mic resources
  const cleanupCallResources = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('[Tok Fxe WebRTC] Error closing peer connection:', e);
      }
      peerConnectionRef.current = null;
    }

    if (callSessionUnsubRef.current) {
      callSessionUnsubRef.current();
      callSessionUnsubRef.current = null;
    }

    if (iceCandidatesUnsubRef.current) {
      iceCandidatesUnsubRef.current();
      iceCandidatesUnsubRef.current = null;
    }

    activeCallIdRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
  };

  // Calling System Engine with real WebRTC & Firestore Signaling
  const startCall = async (partner: Creator, type: 'voice' | 'video') => {
    const whoCanCall = userProfile?.securitySettings?.whoCanCall ?? 'friends';
    if (whoCanCall === 'no_one') {
      showToast('المكالمات معطلة في إعدادات الخصوصية لديك ⚙️');
      return;
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    activeCallIdRef.current = callId;

    try {
      showToast(`جارِ الاتصال بـ ${partner.name}... 📞`);

      // 1. Acquire Camera and/or Microphone
      const { stream: localStream } = await acquireUserMedia(type, userProfile.name);
      localStreamRef.current = localStream;

      // 2. Initialize RTCPeerConnection with STUN/TURN
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // 3. Add local tracks
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // 4. Handle incoming remote tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setActiveCall((prev) => (prev ? { ...prev, remoteStream, isConnecting: false } : null));
      };

      // 5. Send ICE candidates to Firestore
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendFirestoreIceCandidate(callId, 'caller', event.candidate);
        }
      };

      // 6. Generate SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 7. Update active call state immediately
      setActiveCall({
        callId,
        isActive: true,
        isIncoming: false,
        callType: type,
        partner,
        durationSeconds: 0,
        isMuted: false,
        isCameraOff: false,
        localStream,
        remoteStream: null,
        isConnecting: true,
      });

      // 8. Write call record with offer to Firestore
      if (db && currentUser?.uid) {
        await initiateFirestoreCall({
          callId,
          callerId: currentUser.uid,
          callerName: userProfile.name,
          callerUsername: userProfile.username,
          callerAvatar: userProfile.avatar,
          receiverId: partner.id,
          receiverName: partner.name,
          receiverUsername: partner.username,
          receiverAvatar: partner.avatar,
          callType: type,
          offer: { type: offer.type as RTCSdpType, sdp: offer.sdp || '' },
        });

        // 9. Listen for receiver's answer and state transitions
        callSessionUnsubRef.current = subscribeToCallSession(callId, async (updatedCall) => {
          if (!pc.currentRemoteDescription && updatedCall.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.answer as RTCSessionDescriptionInit));
            setActiveCall((prev) => (prev ? { ...prev, isConnecting: false } : null));
          }
          if (updatedCall.status === 'rejected') {
            showToast('تم رفض المكالمة من الطرف الآخر');
            cleanupCallResources();
          } else if (updatedCall.status === 'ended') {
            showToast('أنهى الطرف الآخر المكالمة');
            cleanupCallResources();
          }
        });

        // 10. Listen for remote ICE candidates
        iceCandidatesUnsubRef.current = subscribeToRemoteIceCandidates(callId, 'receiver', async (candidate) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('[Tok Fxe WebRTC] Error adding receiver ICE candidate:', e);
          }
        });
      } else {
        // Fallback for offline demo: loopback local stream after 800ms
        setTimeout(() => {
          setActiveCall((prev) => (prev ? { ...prev, remoteStream: localStream, isConnecting: false } : null));
        }, 800);
      }
    } catch (err) {
      console.error('[Tok Fxe WebRTC] Error starting call:', err);
      showToast('تعذر بدء المكالمة، تأكد من صلاحيات الكاميرا');
      cleanupCallResources();
    }
  };

  const answerCall = async () => {
    if (!incomingCall?.callId) return;
    const callId = incomingCall.callId;
    activeCallIdRef.current = callId;

    try {
      showToast('جارِ الاتصال بالمكالمة... 🟢');

      // 1. Acquire Local Camera/Mic
      const { stream: localStream } = await acquireUserMedia(incomingCall.callType, userProfile.name);
      localStreamRef.current = localStream;

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // 3. Add local tracks
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // 4. Handle incoming remote tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setActiveCall((prev) => (prev ? { ...prev, remoteStream, isConnecting: false } : null));
      };

      // 5. Send ICE candidates as receiver
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendFirestoreIceCandidate(callId, 'receiver', event.candidate);
        }
      };

      // 6. Transition state
      setActiveCall({
        ...incomingCall,
        isIncoming: false,
        localStream,
        remoteStream: null,
        isConnecting: true,
      });
      setIncomingCall(null);

      // 7. Subscribe to call session to receive offer and update with answer
      callSessionUnsubRef.current = subscribeToCallSession(callId, async (updatedCall) => {
        if (updatedCall.offer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.offer as RTCSessionDescriptionInit));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await answerFirestoreCall(callId, answer);
          setActiveCall((prev) => (prev ? { ...prev, isConnecting: false } : null));
        }

        if (updatedCall.status === 'ended') {
          showToast('أنهى الطرف الآخر المكالمة');
          cleanupCallResources();
        }
      });

      // 8. Listen for caller's ICE candidates
      iceCandidatesUnsubRef.current = subscribeToRemoteIceCandidates(callId, 'caller', async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('[Tok Fxe WebRTC] Error adding caller ICE candidate:', e);
        }
      });
    } catch (err) {
      console.error('[Tok Fxe WebRTC] Error answering call:', err);
      showToast('تعذر قبول المكالمة');
      cleanupCallResources();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      const callId = incomingCall.callId;
      if (callId) {
        endFirestoreCall(callId, 'rejected');
      }

      const logItem: CallLogItem = {
        id: `call-${Date.now()}`,
        userId: incomingCall.partner.id,
        userName: incomingCall.partner.name,
        userAvatar: incomingCall.partner.avatar,
        type: incomingCall.callType,
        direction: 'missed',
        timestamp: 'الآن',
      };
      setCallLogs((prev) => [logItem, ...prev]);
      showToast('تم رفض المكالمة');
    }
    cleanupCallResources();
  };

  const endCall = () => {
    if (activeCall) {
      const callId = activeCall.callId || activeCallIdRef.current;
      if (callId) {
        endFirestoreCall(callId, 'ended');
      }

      const mins = Math.floor(activeCall.durationSeconds / 60);
      const secs = activeCall.durationSeconds % 60;
      const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      const logItem: CallLogItem = {
        id: `call-${Date.now()}`,
        userId: activeCall.partner.id,
        userName: activeCall.partner.name,
        userAvatar: activeCall.partner.avatar,
        type: activeCall.callType,
        direction: activeCall.isIncoming ? 'incoming' : 'outgoing',
        timestamp: 'الآن',
        duration: durationStr,
      };
      setCallLogs((prev) => [logItem, ...prev]);
      showToast(`انتهت المكالمة (${durationStr})`);
    }
    cleanupCallResources();
  };

  const toggleCallMute = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      const nextMuted = !prev.isMuted;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !nextMuted;
        });
      }
      return { ...prev, isMuted: nextMuted };
    });
  };

  const toggleCallCamera = () => {
    setActiveCall((prev) => {
      if (!prev) return null;
      const nextCameraOff = !prev.isCameraOff;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = !nextCameraOff;
        });
      }
      return { ...prev, isCameraOff: nextCameraOff };
    });
  };

  // Call timer interval
  useEffect(() => {
    if (!activeCall?.isActive) return;
    const interval = setInterval(() => {
      setActiveCall((prev) => (prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.isActive]);

  // Wallet Purchases (Google Play Billing simulation)
  const buyCoins = (pkg: CoinPackage) => {
    const totalAdded = pkg.coins + (pkg.bonusCoins || 0);
    setUserProfile((prev) => ({
      ...prev,
      coinsBalance: prev.coinsBalance + totalAdded,
    }));

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'purchase',
      amount: totalAdded,
      description: `شراء ${totalAdded} عملة عبر Google Play (${pkg.priceUSD}$)`,
      timestamp: 'الآن',
    };
    setWalletTransactions((prev) => [tx, ...prev]);

    soundEffects.playCommentSent();
    showToast(`تم شراء ${totalAdded} عملة بنجاح عبر Google Play! 🪙`);
    setIsWalletModalOpen(false);
  };

  // Direct Messaging
  const sendDirectMessage = (conversationId: string, text: string, mediaType: 'text' | 'image' | 'video' | 'audio' = 'text', mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return;
    const newMsg: import('../types').DirectMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: 'me',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      status: 'sent',
      mediaType,
      mediaUrl,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim() || (mediaType === 'image' ? '📷 صورة' : '🎙️ رسالة صوتية'),
            lastMessageTime: newMsg.timestamp,
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
    soundEffects.playCommentSent();

    // Simulated read receipt after 1.5s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m)),
            };
          }
          return conv;
        })
      );
    }, 1500);
  };

  // Reporting & Moderation
  const openReportModal = (type: 'video' | 'comment' | 'user', id: string) => {
    setReportTarget({ type, id });
    setIsReportModalOpen(true);
  };

  const submitReport = (reason: string, details?: string) => {
    if (!reportTarget) return;
    const newRep: ContentReport = {
      id: `rep-${Date.now()}`,
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reporterName: userProfile.name,
      reason,
      details,
      timestamp: 'الآن',
      status: 'pending',
    };
    setReports((prev) => [newRep, ...prev]);
    setIsReportModalOpen(false);
    setReportTarget(null);
    showToast('تم استلام بلاغك وسيقوم فريق الإشراف بمراجعته فوراً 🛡️');
  };

  const resolveReport = (reportId: string, action: 'delete_content' | 'ban_user' | 'dismiss') => {
    const rep = reports.find((r) => r.id === reportId);
    if (!rep) return;

    if (action === 'delete_content') {
      if (rep.targetType === 'video') {
        setVideos((prev) => prev.filter((v) => v.id !== rep.targetId));
      } else if (rep.targetType === 'comment') {
        setComments((prev) => {
          const updated: Record<string, CommentItem[]> = {};
          Object.keys(prev).forEach((vId) => {
            updated[vId] = prev[vId].filter((c) => c.id !== rep.targetId);
          });
          return updated;
        });
      }
      showToast('تمت إزالة المحتوى المخالف بنجاح ✅');
    } else if (action === 'ban_user') {
      showToast('تم تعليق وحظر المستخدم المخالف بنجاح 🚫');
    } else {
      showToast('تم حفظ البلاغ كبلاغ غير مخالف');
    }

    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
  };

  const blockUser = (creator: Creator) => {
    setUserProfile((prev) => {
      const sec = prev.securitySettings || INITIAL_USER.securitySettings;
      const blocked = sec.blockedUsers || [];
      return {
        ...prev,
        securitySettings: {
          ...sec,
          blockedUsers: [...blocked.filter((u) => u.id !== creator.id), creator],
        },
      };
    });
    showToast(`تم حظر ${creator.name} بنجاح 🚫`);
  };

  const unblockUser = (creatorId: string) => {
    setUserProfile((prev) => {
      const sec = prev.securitySettings || INITIAL_USER.securitySettings;
      const blocked = sec.blockedUsers || [];
      return {
        ...prev,
        securitySettings: {
          ...sec,
          blockedUsers: blocked.filter((u) => u.id !== creatorId),
        },
      };
    });
    showToast('تم إلغاء الحظر بنجاح');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profile };
      if (currentUser && db) {
        updateFirestoreUserProfile(currentUser.uid, {
          displayName: updated.name,
          bio: updated.bio,
          photoURL: updated.avatar,
          coverImage: updated.coverImage,
          website: updated.website,
        }).catch((err) => console.warn('[Tok Fxe] Firestore updateProfile warning:', err));
      }
      return updated;
    });
    showToast('تم تحديث الملف الشخصي وحفظه');
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.toggleAmbientTrack(!nextMuted);
    showToast(nextMuted ? 'تم كتم الصوت' : 'تم تشغيل الصوت');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        feedSubTab,
        setFeedSubTab,
        videos,
        activeVideoIndex,
        setActiveVideoIndex,
        toggleLike,
        toggleBookmark,
        toggleFollow,
        comments,
        addComment,
        addCommentReply,
        toggleCommentLike,
        addNewVideo,
        downloadVideo,
        liveRooms,
        activeLiveRoom,
        isBroadcasting,
        isSetupLiveModalOpen,
        setIsSetupLiveModalOpen,
        isEndStreamModalOpen,
        setIsEndStreamModalOpen,
        isGiftDrawerOpen,
        setIsGiftDrawerOpen,
        isInviteGuestDrawerOpen,
        setIsInviteGuestDrawerOpen,
        activeLiveComments,
        activeGiftBanner,
        userCameraStream,
        lastStreamSummary,
        startBroadcasting,
        endBroadcasting,
        confirmEndStreamAndSave,
        joinLiveRoom,
        leaveLiveRoom,
        sendLiveComment,
        sendLiveGift,
        sendLiveHeart,
        inviteCoHost,
        endCoHost,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendDirectMessage,
        activeCall,
        incomingCall,
        callLogs,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleCallMute,
        toggleCallCamera,
        walletTransactions,
        isWalletModalOpen,
        setIsWalletModalOpen,
        buyCoins,
        userProfile,
        currentUser,
        isAuthReady,
        isFirebaseConfigured: isFirebaseConfigured(),
        updateProfile,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        loginUser,
        signupUser,
        logoutUser,
        sendPasswordReset,
        deleteAccount,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isAdminPanelOpen,
        setIsAdminPanelOpen,
        reports,
        isReportModalOpen,
        setIsReportModalOpen,
        reportTarget,
        openReportModal,
        submitReport,
        resolveReport,
        blockUser,
        unblockUser,
        selectedUserProfile,
        openUserProfile,
        closeUserProfile,
        followRequests,
        requestFollow,
        acceptFollowRequest,
        rejectFollowRequest,
        isFollowRequestsModalOpen,
        setIsFollowRequestsModalOpen,
        changePostPrivacy,
        deletePost,
        isFollowersModalOpen,
        setIsFollowersModalOpen,
        followersModalType,
        setFollowersModalType,
        notifications,
        markNotificationAsRead,
        isMuted,
        toggleMute,
        activeDrawer,
        setActiveDrawer,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
