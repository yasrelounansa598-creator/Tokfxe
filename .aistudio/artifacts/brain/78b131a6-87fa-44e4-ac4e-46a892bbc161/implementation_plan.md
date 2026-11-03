# FexTok Redesign & Real-Time Live Streaming Platform

A complete redesign of FexTok as an authentic, production-grade Arabic short-video and live streaming social application. Built with an immersive obsidian navy canvas, vibrant neon cyan-to-pink gradients, native RTL typography, and an interactive broadcast engine supporting device camera/mic access, split-screen joint co-hosting, PK battles, live gifts, viewer interactions, and saved stream replays.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The application will open directly to the fullscreen video feed on initial launch, with the FexTok neon wordmark and top navigation tabs (لك · المتابعون · الأصدقاء · مباشر).

- **Confirmed Decision 1 (Camera & Live Streaming)**: Uses real device camera and microphone (`navigator.mediaDevices.getUserMedia`) with video mirror, flash/torch toggle, beauty filter controls, and interactive simulated stream fallback.
- **Confirmed Decision 2 (Joint Stream & Co-Hosting)**: Features a split vertical dual-screen layout with an interactive PK Battle score bar, real-time cheering, gift animations (Roses, Crowns, Rockets), and guest audio controls.
- **Confirmed Decision 3 (Stream Replays & Privacy)**: Host receives an end-of-stream analytics card (peak viewers, duration, total diamonds/gifts) with an option to save the replay to their public profile, adjust privacy settings, or download the recording.

---

### 1. Overview & Core Concept

- **What It Does**: FexTok provides an all-in-one Arabic vertical media experience where users can watch curated auto-looping videos, explore trending hashtags, message friends, personalize their creator profile, and launch or watch interactive live video broadcasts with co-hosts.
- **Target Audience / Persona**: Arabic-speaking creators, live streamers, and mobile users looking for an engaging, high-performance social platform with seamless right-to-left ergonomics.
- **Key Value**: Delivers the visual identity, neon branding, and tactile interactions of FexTok with a functional live broadcasting suite and multi-screen navigation without static mocks.

---

### 2. User Experience & Visual Design

#### A. Screen Specifications & Flows

1. **Home Feed (الرئيسية)**:
   - **Initial View**: Opens immediately upon app launch to the vertical video feed.
   - **Top Header**:
     - FexTok logo with cyan/magenta musical glitch effect.
     - 4 top tabs: **لك** (For You), **المتابعون** (Following), **الأصدقاء** (Friends), and **مباشر** (Live Streams).
     - Live broadcast quick-trigger button with glowing red badge.
   - **Right-Side Interaction Rail (RTL thumb zone)**:
     - Creator avatar with glowing neon ring and one-tap follow `+` badge.
     - Animated Heart with live like counter and double-tap screen bursts.
     - Comment button opening threaded bottom drawer.
     - Bookmark button saving to personal collection.
     - Share button opening social share drawer (WhatsApp, Telegram, Copy Link).
     - Spinning vinyl disc with floating neon notes.
   - **Bottom Video Info**: Creator handle with verified badge, Arabic caption with hashtag chips, audio ticker marquee, and playback progress bar.

2. **Interactive Live Stream Room (البث المباشر)**:
   - **Setup & Launch Modal**:
     - Set stream title, category (ألعاب, سوالف ومواهب, طبخ, موسيقى), and cover thumbnail.
     - Toggle privacy (عام, الأصدقاء فقط) and comments permission.
     - Button: "ابدأ البث المباشر الآن" (Start Live Stream Now).
   - **Live Broadcasting Viewport**:
     - Real device camera preview (facing user or flipped) with live status badge (`🔴 مباشر`).
     - Live viewers counter with avatars of top active spectators.
     - **Co-Host / PK Battle Mode**: Split-screen dual video layout (Host vs Guest) with a dynamic horizontal PK Battle progress meter showing score points based on viewer gifts and likes.
     - **Live Chat Stream**: Transparent bottom-left/right overlay displaying real-time scrolling comments from viewers with user badges.
     - **Gift & Reaction Animations**: Floating animated gifts (وردة 🌹, تاج نيون 👑, صاروخ 🚀, ماسة 💎) with screen announcement banners, plus floating heart particle showers when viewers tap.
     - **Host Control Bar**: Camera flip, mic mute/unmute, invite guest button, live battle trigger, share link, and End Stream button.
   - **End Stream Summary**:
     - Broadcast duration, peak viewers, total likes, and virtual gifts received.
     - Toggle: "حفظ البث في الملف الشخصي" (Save replay to profile).
     - Action buttons: "تحميل التسجيل" (Download replay) and "العودة للرئيسية" (Exit to feed).

3. **Explore Page (استكشف)**:
   - Prominent Search bar with voice search and QR code scanner.
   - Dedicated **البث المباشر الآن (Live Now)** horizontal card strip showing active streamers with viewer counts and one-tap join.
   - Trending hashtags with post metrics and thumbnail carousels.
   - Popular categories (شائع, تقنية, طبخ, ألعاب, موسيقى).

4. **Inbox & Messages (الرسائل)**:
   - Direct messages list with avatar, online presence dot, unread message badges, and last message timestamp.
   - Active chat view with slide-over transition, message thread, voice note button, and real-time message sending.
   - Activity notifications tab (Likes, Comments, Mentions, Followers).

5. **Profile Page (الملف الشخصي)**:
   - Cover photo and profile avatar with neon gradient ring and verified badge.
   - Real creator stats: المتابعون (Followers), أتابع (Following), المنشورات / الإعجابات (Posts / Likes).
   - Action buttons: "تعديل الملف الشخصي" (Edit Profile Modal) and "مشاركة الحساب".
   - Content grid tabs:
     - 3-column video grid with view counters and pinned video badge.
     - **تسجيلات البث المباشر (Saved Live Replays)** tab showing recorded live sessions with duration and views.
     - Liked videos and Saved bookmarks.

6. **Bottom Navigation**:
   - 5 functional buttons: الرئيسية (Feed), استكشف (Explore), Center Neon `+` / Live Button (Create/Live), صندوق الوارد (Inbox), and صفحتي (Profile).

#### B. Visual Identity & Color System

```
Background Primary:      #07090E (Obsidian Black)
Background Secondary:    #0E1424 (Dark Navy Surface)
Card & Sheet Surface:    #151D33 (Elevated Slate Navy)
Neon Cyan Accent:        #00F2FE (Electric Cyan)
Neon Magenta Accent:     #FE2C55 (FexTok Pink / Flame)
Neon Purple Accent:      #7928CA -> #9333EA (Electric Violet)
Live Stream Crimson:     #EF4444 (Live Red with pulse animation)
PK Battle Gold:          #F59E0B (Championship Amber)
Text Primary:            #FFFFFF
Text Secondary:          #94A3B8 (Slate 400)
```

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real Device Media Stream with Synthetic Fallback**:
  - *Chosen Approach*: Call `navigator.mediaDevices.getUserMedia({ video: true, audio: true })` when host clicks "Go Live", with a built-in virtual streamer simulation if camera permissions are blocked.
  - *Why*: Delivers an authentic broadcast studio experience on smartphones and web browsers while guaranteeing zero crashes.
- **Decision 2: Automated Live Viewer Activity Engine**:
  - *Chosen Approach*: Background simulation engine that generates dynamic viewer comments, join notices, heart reactions, and gift animations during live streams.
  - *Why*: Makes live streams immediately feel alive, crowded, and engaging with hundreds of active viewers.
- **Decision 3: Dedicated Live Tab & Explore Integration**:
  - *Chosen Approach*: Streamers are discoverable both in the dedicated top "مباشر" feed tab and as prominent live story rings in the Explore page.
  - *Why*: Maximizes live stream discovery throughout the entire app.

---

### 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FexTok App                                │
│                     (RTL Arabic & Neon Obsidian)                       │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation Header:                                                │
│  [ FexTok Logo ]  [ لك | المتابعون | الأصدقاء | مباشر ]  [ 🔴 بث مباشر ]│
├────────────────────────────────────────────────────────────────────────┤
│  Main View Router                                                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬──────┐  │
│  │   FeedView   │  ExploreView │ LiveBroadcast│   InboxView  │Profile│ │
│  │  (Fullscreen │ (Search, Live│  (Camera/Mic,│  (DMs, Chat  │(Grid,│  │
│  │   9:16 Video)│  cards, tags)│  PK Battle)  │   threads)   │Replay│  │
│  └──────┬───────┴──────────────┴──────┬───────┴──────────────┴──────┘  │
│         │                             │                                │
│         ├─► Action Rail & Drawers     ├─► Live Chat & Floating Emojis  │
│         │   (Like, Comment, Share)    ├─► Co-Host Split & PK Gauge     │
│         │                             ├─► Virtual Gifts & Diamonds     │
│         │                             └─► End Broadcast Analytics Card │
├────────────────────────────────────────────────────────────────────────┤
│  Persistent Bottom Navigation Bar (5 buttons with center neon button)  │
├────────────────────────────────────────────────────────────────────────┤
│  FexTok Global State (Videos, Live Rooms, PK State, DMs, Profile)      │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Data Lifecycle

- `liveRooms`: Collection of active streams with viewer counts, stream titles, hosts, and categories.
- `activeLiveStream`: Current viewing or broadcasting room state (hostId, isCoHost, pkScores, chatMessages, activeGifts, cameraStream).
- `handleStartLive`: Initiates camera stream, sets room title, and broadcasts to live list.
- `handleEndLive`: Stops media tracks, calculates session stats, and saves replay to user profile.
- `sendLiveComment` & `sendLiveGift`: Dispatches real-time chat messages and triggers flying gift animations.

---

### Verification & Testing Plan

1. **Compilation Check**: Verify TypeScript clean build with zero errors.
2. **Launch Verification**: Ensure initial view is the full-screen vertical video feed.
3. **Top Tabs & Navigation**: Test switching between "لك", "المتابعون", "الأصدقاء", and "مباشر".
4. **Live Stream Studio Verification**:
   - Open Live Stream Setup, enter title and select category.
   - Start Live Stream: verify camera preview, live viewer counter, and chat.
   - Test sending comments, floating hearts, and virtual gifts.
   - Toggle Co-Host PK Battle: verify split-screen mode and dynamic score meter.
   - End Live Stream: verify broadcast summary dialog and saving replay to Profile.
5. **Explore & Discovery**: Verify live stream cards section and category filters.
6. **Profile Replays Tab**: Verify saved live broadcast replays render with duration and play counters.
