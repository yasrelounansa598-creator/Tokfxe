export type TabType = 'feed' | 'explore' | 'create' | 'inbox' | 'profile' | 'auth';

export type FeedSubTab = 'foryou' | 'following' | 'friends' | 'live';

export type VideoCategory = 'all' | 'trending' | 'tech' | 'music' | 'cooking' | 'gaming' | 'comedy';

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isFollowed: boolean;
  bio?: string;
  followersCount: number;
  followingCount?: number;
  likesCount?: number;
  postsCount?: number;
  coverImage?: string;
  isLive?: boolean;
  isBlocked?: boolean;
  isPrivate?: boolean;
  followStatus?: 'none' | 'following' | 'requested';
}

export interface FollowRequest {
  id: string;
  user: Creator;
  timestamp: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked: boolean;
}

export interface CommentItem {
  id: string;
  videoId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked: boolean;
  replies?: CommentReply[];
}

export interface VideoItem {
  id: string;
  videoUrl: string;
  posterUrl: string;
  creator: Creator;
  caption: string;
  hashtags: string[];
  musicTitle: string;
  musicAuthor: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  category: VideoCategory;
  timestamp: string;
  isFriend?: boolean;
  allowDownload?: boolean;
  mediaType?: 'video' | 'image' | 'text';
  photos?: string[];
  textContent?: string;
  privacy?: 'public' | 'followers' | 'friends' | 'private';
  isReported?: boolean;
}

// Direct Messaging & Calling
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status: MessageDeliveryStatus;
  mediaType?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
}

export interface CallLogItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    isVerified: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
  messages: DirectMessage[];
}

export interface ActiveCallState {
  callId?: string;
  isActive: boolean;
  isIncoming: boolean;
  callType: 'voice' | 'video';
  partner: Creator;
  durationSeconds: number;
  isMuted: boolean;
  isCameraOff: boolean;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isConnecting?: boolean;
}

// Notifications
export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'live' | 'gift';
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  time: string;
  videoPoster?: string;
  isRead: boolean;
}

export interface StreamReplay {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  duration: string;
  date: string;
  viewsCount: number;
  likesCount: number;
  diamondsEarned: number;
}

// Wallet & Gifts
export interface LiveGift {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  diamonds: number;
  color: string;
  bannerGradient: string;
}

export interface WalletTransaction {
  id: string;
  type: 'purchase' | 'sent_gift' | 'received_gift';
  amount: number; // positive or negative coins
  description: string;
  timestamp: string;
  giftIcon?: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceUSD: number;
  popular?: boolean;
  bonusCoins?: number;
}

// Content Moderation & Reports
export interface ContentReport {
  id: string;
  targetType: 'video' | 'comment' | 'user';
  targetId: string;
  reporterName: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
  details?: string;
  previewUrl?: string;
}

// User Profile & Settings
export interface UserSecuritySettings {
  isPrivateAccount: boolean;
  whoCanComment: 'everyone' | 'friends' | 'no_one';
  whoCanMessage: 'everyone' | 'friends' | 'no_one';
  whoCanCall: 'everyone' | 'friends' | 'no_one';
  allowDownloadMyVideos: boolean;
  activeSessions: { id: string; deviceName: string; location: string; lastActive: string }[];
  blockedUsers: Creator[];
}

export interface UserNotificationSettings {
  newFollowers: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  directMessages: boolean;
  liveStreams: boolean;
  gifts: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  website: string;
  email: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  coinsBalance: number;
  followingCount: number;
  followersCount: number;
  likesCount: number;
  postsCount: number;
  isVerified: boolean;
  isLive?: boolean;
  isAdmin: boolean;
  replays: StreamReplay[];
  securitySettings: UserSecuritySettings;
  notificationSettings: UserNotificationSettings;
}

// Live Streaming
export interface LiveComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  isHost?: boolean;
  isGift?: boolean;
  giftInfo?: LiveGift;
  timestamp: string;
}

export interface PKBattleState {
  isActive: boolean;
  hostScore: number;
  guestScore: number;
  timeLeft: number;
  winner?: 'host' | 'guest' | 'draw';
}

export interface LiveStreamRoom {
  id: string;
  host: Creator;
  title: string;
  coverUrl: string;
  category: string;
  type: 'video' | 'audio';
  viewersCount: number;
  likesCount: number;
  diamondsCount: number;
  streamUrl?: string;
  isCoHost: boolean;
  coHost?: Creator;
  pkBattle?: PKBattleState;
  startedAt: string;
  isPrivate?: boolean;
}
