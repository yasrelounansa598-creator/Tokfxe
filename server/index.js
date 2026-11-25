import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { AccessToken } from 'livekit-server-sdk';
import crypto from 'node:crypto';

const required = ['FIREBASE_SERVICE_ACCOUNT_JSON', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'LIVEKIT_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

const app = express();
app.use(express.json({ limit: '32kb' }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/i);
    if (!match) return res.status(401).json({ error: 'Missing Firebase bearer token' });
    req.user = await auth.verifyIdToken(match[1], true);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

function safeRoomName() {
  return `fx-${crypto.randomBytes(12).toString('hex')}`;
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'fextok-livekit-api' }));

app.post('/api/livekit/rooms', requireUser, async (req, res) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 100) : '';
    const category = typeof req.body?.category === 'string' ? req.body.category.trim().slice(0, 40) : 'عام';
    if (!title) return res.status(400).json({ error: 'A live title is required' });

    const roomName = safeRoomName();
    await db.collection('liveRooms').doc(roomName).create({
      roomName,
      ownerUid: req.user.uid,
      title,
      category,
      status: 'live',
      createdAt: FieldValue.serverTimestamp(),
      endedAt: null,
    });
    return res.status(201).json({ roomName, livekitUrl: process.env.LIVEKIT_URL });
  } catch (error) {
    console.error('Create room failed:', error);
    return res.status(500).json({ error: 'Could not create live room' });
  }
});

app.post('/api/livekit/token', requireUser, async (req, res) => {
  try {
    const roomName = typeof req.body?.roomName === 'string' ? req.body.roomName : '';
    if (!/^fx-[a-f0-9]{24}$/.test(roomName)) return res.status(400).json({ error: 'Invalid room name' });

    const roomSnap = await db.collection('liveRooms').doc(roomName).get();
    if (!roomSnap.exists || roomSnap.get('status') !== 'live') {
      return res.status(404).json({ error: 'Live room not found or already ended' });
    }

    const isOwner = roomSnap.get('ownerUid') === req.user.uid;
    const identity = req.user.uid;
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity,
      ttl: '10m',
      metadata: JSON.stringify({ uid: req.user.uid }),
    });
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canSubscribe: true,
      canPublish: isOwner,
      canPublishData: true,
    });
    return res.json({ token: await token.toJwt(), livekitUrl: process.env.LIVEKIT_URL });
  } catch (error) {
    console.error('Issue token failed:', error);
    return res.status(500).json({ error: 'Could not issue LiveKit token' });
  }
});

app.post('/api/livekit/rooms/:roomName/end', requireUser, async (req, res) => {
  try {
    const ref = db.collection('liveRooms').doc(req.params.roomName);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Live room not found' });
    if (snap.get('ownerUid') !== req.user.uid) return res.status(403).json({ error: 'Only the host can end this room' });
    if (snap.get('status') === 'ended') return res.json({ ok: true, alreadyEnded: true });
    await ref.update({ status: 'ended', endedAt: FieldValue.serverTimestamp() });
    return res.json({ ok: true });
  } catch (error) {
    console.error('End room failed:', error);
    return res.status(500).json({ error: 'Could not end live room' });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => console.log(`FexTok LiveKit API listening on ${port}`));
