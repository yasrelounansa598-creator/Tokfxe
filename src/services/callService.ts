import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  Firestore,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

/**
 * WebRTC ICE Server Configuration:
 * Public Google STUN servers + OpenRelay TURN servers for NAT / symmetric firewall traversal.
 */
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    {
      urls: [
        'stun:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turns:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export interface FirestoreCallDoc {
  callId: string;
  callerId: string;
  callerName: string;
  callerUsername: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatar: string;
  callType: 'voice' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  offer?: { type: string; sdp: string };
  answer?: { type: string; sdp: string };
  createdAt: string;
  endedAt?: string;
}

/**
 * Generates an animated synthetic media stream with canvas + audio oscillator.
 * Guarantees that if a physical webcam is missing, denied, or in an iframe/test,
 * the WebRTC peer connection still successfully transmits real video/audio frames!
 */
export function createSyntheticMediaStream(callType: 'voice' | 'video', label = 'Tok Fxe Live'): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  let animFrameId: number;
  let t = 0;

  function draw() {
    if (!ctx) return;
    t += 0.05;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 480, 640);
    grad.addColorStop(0, '#07090E');
    grad.addColorStop(0.5, '#0E1424');
    grad.addColorStop(1, '#1A0B2E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 640);

    // Neon pulsing circle
    const cx = 240 + Math.sin(t) * 30;
    const cy = 280 + Math.cos(t) * 20;
    const radius = 90 + Math.sin(t * 2) * 15;

    const radialGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
    radialGrad.addColorStop(0, '#00D9FF');
    radialGrad.addColorStop(0.7, '#8A2BFF');
    radialGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // App Watermark & Label
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('Tok Fxe Video Call 📹', 240, 440);

    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#00D9FF';
    ctx.fillText(label, 240, 475);

    animFrameId = requestAnimationFrame(draw);
  }

  draw();

  // Create video track from canvas (30 FPS)
  const videoStream = canvas.captureStream(30);
  const videoTrack = videoStream.getVideoTracks()[0];

  // Create subtle audio tone for WebRTC audio negotiation
  let audioTrack: MediaStreamTrack | null = null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const dest = audioCtx.createMediaStreamDestination();

      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime); // very quiet carrier tone
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      audioTrack = dest.stream.getAudioTracks()[0];
    }
  } catch {
    // Audio synthesis fallback optional
  }

  const tracks: MediaStreamTrack[] = [];
  if (callType === 'video' && videoTrack) {
    tracks.push(videoTrack);
  }
  if (audioTrack) {
    tracks.push(audioTrack);
  }

  const compositeStream = new MediaStream(tracks);

  // Clean up canvas loop when track ends
  if (videoTrack) {
    videoTrack.addEventListener('ended', () => {
      cancelAnimationFrame(animFrameId);
    });
  }

  return compositeStream;
}

/**
 * Safely requests camera & microphone streams.
 * If user denies or device lacks hardware camera, falls back cleanly to synthetic stream.
 */
export async function acquireUserMedia(
  callType: 'voice' | 'video',
  customLabel = 'الكاميرا المحلية'
): Promise<{ stream: MediaStream; isSynthetic: boolean }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    console.warn('[Tok Fxe Call] navigator.mediaDevices not supported, using fallback stream.');
    return {
      stream: createSyntheticMediaStream(callType, customLabel),
      isSynthetic: true,
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video:
        callType === 'video'
          ? {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 },
            }
          : false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return { stream, isSynthetic: false };
  } catch (err: unknown) {
    console.warn('[Tok Fxe Call] getUserMedia failed or was rejected. Falling back to synthetic media:', err);
    return {
      stream: createSyntheticMediaStream(callType, customLabel),
      isSynthetic: true,
    };
  }
}

/**
 * Initiates an outgoing WebRTC call record in Firestore.
 */
export async function initiateFirestoreCall(
  callData: Omit<FirestoreCallDoc, 'status' | 'createdAt'>
): Promise<string> {
  if (!db) return callData.callId;

  try {
    const callDocRef = doc(db, 'calls', callData.callId);
    const payload: FirestoreCallDoc = {
      ...callData,
      status: 'ringing',
      createdAt: new Date().toISOString(),
    };

    await setDoc(callDocRef, payload);
  } catch (err) {
    console.warn('[Tok Fxe Call] Firestore call initiation notice (publish firestore.rules to enable multi-device signaling):', err);
  }
  return callData.callId;
}

/**
 * Answers an incoming call by updating the Firestore record with the SDP answer.
 */
export async function answerFirestoreCall(
  callId: string,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  if (!db) return;
  try {
    const callDocRef = doc(db, 'calls', callId);
    await updateDoc(callDocRef, {
      status: 'accepted',
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });
  } catch (err) {
    console.warn('[Tok Fxe Call] Firestore call answer notice:', err);
  }
}

/**
 * Terminates or rejects an active call session.
 */
export async function endFirestoreCall(callId: string, status: 'rejected' | 'ended' = 'ended'): Promise<void> {
  if (!db) return;
  try {
    const callDocRef = doc(db, 'calls', callId);
    await updateDoc(callDocRef, {
      status,
      endedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Tok Fxe Call] Failed to end call in Firestore:', err);
  }
}

/**
 * Sends an ICE candidate to the peer via Firestore subcollections.
 */
export async function sendFirestoreIceCandidate(
  callId: string,
  role: 'caller' | 'receiver',
  candidate: RTCIceCandidate
): Promise<void> {
  if (!db) return;
  try {
    const colName = role === 'caller' ? 'callerCandidates' : 'receiverCandidates';
    const subCol = collection(db, 'calls', callId, colName);
    await addDoc(subCol, candidate.toJSON());
  } catch (err) {
    console.warn('[Tok Fxe Call] Failed to send ICE candidate:', err);
  }
}

/**
 * Listens for incoming calls targeted to receiverUserId in real time.
 */
export function subscribeToIncomingCalls(
  firestore: Firestore,
  receiverUserId: string,
  onIncomingCall: (call: FirestoreCallDoc) => void
): () => void {
  const callsRef = collection(firestore, 'calls');
  const q = query(
    callsRef,
    where('receiverId', '==', receiverUserId),
    where('status', '==', 'ringing')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onIncomingCall(change.doc.data() as FirestoreCallDoc);
        }
      });
    },
    (error) => {
      console.warn('[Tok Fxe Call] Incoming calls listener notice:', error.message);
    }
  );
}

/**
 * Listens for updates to an active call document (answer, end, reject).
 */
export function subscribeToCallSession(
  callId: string,
  onUpdate: (call: FirestoreCallDoc) => void
): () => void {
  if (!db) return () => {};
  const callDocRef = doc(db, 'calls', callId);

  return onSnapshot(
    callDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as FirestoreCallDoc);
      }
    },
    (error) => {
      console.warn('[Tok Fxe Call] Call session update error:', error.message);
    }
  );
}

/**
 * Listens to remote ICE candidates generated by the peer.
 */
export function subscribeToRemoteIceCandidates(
  callId: string,
  peerRole: 'caller' | 'receiver',
  onCandidate: (candidate: RTCIceCandidateInit) => void
): () => void {
  if (!db) return () => {};
  const colName = peerRole === 'caller' ? 'callerCandidates' : 'receiverCandidates';
  const subCol = collection(db, 'calls', callId, colName);

  return onSnapshot(
    subCol,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onCandidate(change.doc.data() as RTCIceCandidateInit);
        }
      });
    },
    (error) => {
      console.warn('[Tok Fxe Call] Remote ICE candidate listener error:', error.message);
    }
  );
}
