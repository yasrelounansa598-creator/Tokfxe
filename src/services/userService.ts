import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firestore';

export interface FirestoreUserProfile {
  uid: string;
  displayName: string;
  username: string;
  usernameLowercase: string;
  email: string;
  photoURL: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  coverImage?: string;
  website?: string;
}

/**
 * Checks whether a given username is available or already reserved.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!db) return true;
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  if (!cleanUsername) return false;

  const path = `usernames/${cleanUsername}`;
  try {
    const docRef = doc(db, 'usernames', cleanUsername);
    const snap = await getDoc(docRef);
    return !snap.exists();
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      return true;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Atomically reserves a unique username and creates the user profile document.
 * Guarantees no two users can register the same username concurrently.
 */
export async function createUserProfileWithUniqueUsername(
  uid: string,
  data: {
    displayName: string;
    username: string;
    email: string;
    photoURL?: string;
    bio?: string;
    isPrivate?: boolean;
  }
): Promise<{ success: boolean; error?: string; profile?: FirestoreUserProfile }> {
  if (!db) {
    return { success: false, error: 'قاعدة بيانات Firestore غير متصلة.' };
  }

  const cleanUsername = data.username.replace('@', '').trim();
  const usernameLower = cleanUsername.toLowerCase();
  const now = new Date().toISOString();

  const userRef = doc(db, 'users', uid);
  const usernameRef = doc(db, 'usernames', usernameLower);

  try {
    const profile = await runTransaction(db, async (transaction) => {
      // 0. Check if user profile already exists
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        return userSnap.data() as FirestoreUserProfile;
      }

      // 1. Check if username is already claimed
      const usernameSnap = await transaction.get(usernameRef);
      if (usernameSnap.exists()) {
        const owner = usernameSnap.data();
        if (owner?.uid !== uid) {
          throw new Error('USERNAME_ALREADY_TAKEN');
        }
      }

      // 2. Prepare user profile
      const newProfile: FirestoreUserProfile = {
        uid,
        displayName: data.displayName.trim(),
        username: cleanUsername,
        usernameLowercase: usernameLower,
        email: data.email.trim(),
        photoURL:
          data.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: data.bio || 'صانع محتوى في مجتمع Tok Fxe 🚀✨',
        createdAt: now,
        updatedAt: now,
        isPrivate: data.isPrivate ?? false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: false,
      };

      // 3. Atomically write reservation and user profile
      if (!usernameSnap.exists()) {
        transaction.set(usernameRef, {
          uid,
          username: cleanUsername,
          createdAt: now,
        });
      }

      transaction.set(userRef, newProfile);
      return newProfile;
    });

    return { success: true, profile };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'USERNAME_ALREADY_TAKEN') {
      return {
        success: false,
        error: 'اسم المستخدم هذا محجوز مسبقاً. يرجى اختيار اسم مستخدم آخر.',
      };
    }
    const errStr = err instanceof Error ? err.message : String(err);
    console.warn('[Tok Fxe] User profile creation fallback:', errStr);
    return {
      success: false,
      error: errStr.includes('permission') || errStr.includes('Permission')
        ? 'تم تسجيل الدخول. صلاحيات الكتابة مقيدة أو قيد التحديث في Firebase Console.'
        : errStr,
    };
  }
}

/**
 * Fetches user profile document by UID.
 */
export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  if (!db) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.warn('[Tok Fxe Firestore] Offline mode: unable to fetch profile from server, using local fallback.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetches user profile by username.
 */
export async function getUserProfileByUsername(
  username: string
): Promise<FirestoreUserProfile | null> {
  if (!db) return null;
  const clean = username.replace('@', '').trim().toLowerCase();
  const path = 'users';

  try {
    const q = query(
      collection(db, 'users'),
      where('usernameLowercase', '==', clean),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as FirestoreUserProfile;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      return null;
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Updates user profile details (displayName, bio, photoURL, isPrivate, etc.).
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<FirestoreUserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> {
  if (!db) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('permission') || error.message.includes('Permission'))) {
      console.warn('[Tok Fxe] updateUserProfile warning:', error.message);
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
