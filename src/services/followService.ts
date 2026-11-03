import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firestore';
import { getUserProfile } from './userService';

export type FollowStatus = 'none' | 'following' | 'requested';

export interface FollowRelationship {
  id: string; // `${followerId}_${followingId}`
  followerId: string;
  followingId: string;
  status: 'active' | 'pending';
  createdAt: string;
}

/**
 * Checks the follow status between the current user and target user.
 */
export async function getFollowStatus(
  currentUserId: string,
  targetUserId: string
): Promise<FollowStatus> {
  if (!db || !currentUserId || !targetUserId || currentUserId === targetUserId) {
    return 'none';
  }

  const relId = `${currentUserId}_${targetUserId}`;
  const path = `follows/${relId}`;

  try {
    const snap = await getDoc(doc(db, 'follows', relId));
    if (!snap.exists()) return 'none';
    const data = snap.data();
    return data?.status === 'active' ? 'following' : 'requested';
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Follows a user or submits a follow request if the target account is private.
 * Prevents following oneself and prevents duplicates.
 */
export async function followUser(
  followerId: string,
  targetUserId: string
): Promise<{ status: FollowStatus; message: string }> {
  if (!db) {
    return { status: 'none', message: 'Firestore غير متصل.' };
  }

  if (followerId === targetUserId) {
    return { status: 'none', message: 'لا يمكنك متابعة نفسك.' };
  }

  const relId = `${followerId}_${targetUserId}`;
  const path = `follows/${relId}`;

  try {
    // 1. Fetch target user to check privacy setting
    const targetUser = await getUserProfile(targetUserId);
    const isTargetPrivate = targetUser?.isPrivate ?? false;
    const initialStatus = isTargetPrivate ? 'pending' : 'active';
    const now = new Date().toISOString();

    const relRef = doc(db, 'follows', relId);
    const followerRef = doc(db, 'users', followerId);
    const targetRef = doc(db, 'users', targetUserId);

    await runTransaction(db, async (transaction) => {
      const existingSnap = await transaction.get(relRef);
      if (existingSnap.exists()) {
        const data = existingSnap.data();
        if (data?.status === 'active') {
          throw new Error('ALREADY_FOLLOWING');
        } else if (data?.status === 'pending') {
          throw new Error('ALREADY_REQUESTED');
        }
      }

      transaction.set(relRef, {
        id: relId,
        followerId,
        followingId: targetUserId,
        status: initialStatus,
        createdAt: now,
      });

      // If public account, increment counters atomically
      if (!isTargetPrivate) {
        transaction.update(followerRef, { followingCount: increment(1) });
        transaction.update(targetRef, { followersCount: increment(1) });
      }
    });

    if (isTargetPrivate) {
      return { status: 'requested', message: 'تم إرسال طلب المتابعة بنجاح 🔒' };
    }
    return { status: 'following', message: 'تمت المتابعة بنجاح ✨' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'ALREADY_FOLLOWING') {
        return { status: 'following', message: 'أنت تتابع هذا الحساب بالفعل.' };
      }
      if (err.message === 'ALREADY_REQUESTED') {
        return { status: 'requested', message: 'طلب المتابعة معلق بالفعل لدى المستخدم.' };
      }
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Unfollows a target user and updates counters.
 */
export async function unfollowUser(
  followerId: string,
  targetUserId: string
): Promise<{ status: FollowStatus; message: string }> {
  if (!db || !followerId || !targetUserId) {
    return { status: 'none', message: 'بيانات غير مكتملة.' };
  }

  const relId = `${followerId}_${targetUserId}`;
  const path = `follows/${relId}`;

  try {
    const relRef = doc(db, 'follows', relId);
    const followerRef = doc(db, 'users', followerId);
    const targetRef = doc(db, 'users', targetUserId);

    await runTransaction(db, async (transaction) => {
      const existingSnap = await transaction.get(relRef);
      if (!existingSnap.exists()) return;

      const wasActive = existingSnap.data()?.status === 'active';
      transaction.delete(relRef);

      if (wasActive) {
        transaction.update(followerRef, { followingCount: increment(-1) });
        transaction.update(targetRef, { followersCount: increment(-1) });
      }
    });

    return { status: 'none', message: 'تم إلغاء المتابعة بنجاح.' };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Accepts a pending follow request for a private account.
 */
export async function acceptFollowRequest(
  followerId: string,
  currentUserId: string
): Promise<void> {
  if (!db) return;
  const relId = `${followerId}_${currentUserId}`;
  const path = `follows/${relId}`;

  try {
    const relRef = doc(db, 'follows', relId);
    const followerRef = doc(db, 'users', followerId);
    const targetRef = doc(db, 'users', currentUserId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists() || snap.data()?.status !== 'pending') return;

      transaction.update(relRef, { status: 'active' });
      transaction.update(followerRef, { followingCount: increment(1) });
      transaction.update(targetRef, { followersCount: increment(1) });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Rejects or deletes a pending follow request.
 */
export async function rejectFollowRequest(
  followerId: string,
  currentUserId: string
): Promise<void> {
  if (!db) return;
  const relId = `${followerId}_${currentUserId}`;
  const path = `follows/${relId}`;

  try {
    await deleteDoc(doc(db, 'follows', relId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Removes a follower from the current user's profile.
 */
export async function removeFollower(
  currentUserId: string,
  followerId: string
): Promise<void> {
  if (!db) return;
  const relId = `${followerId}_${currentUserId}`;
  const path = `follows/${relId}`;

  try {
    const relRef = doc(db, 'follows', relId);
    const followerRef = doc(db, 'users', followerId);
    const currentRef = doc(db, 'users', currentUserId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists()) return;

      const wasActive = snap.data()?.status === 'active';
      transaction.delete(relRef);

      if (wasActive) {
        transaction.update(followerRef, { followingCount: increment(-1) });
        transaction.update(currentRef, { followersCount: increment(-1) });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches all pending follow requests for the current user.
 */
export async function getPendingFollowRequests(
  currentUserId: string
): Promise<FollowRelationship[]> {
  if (!db || !currentUserId) return [];
  const path = 'follows';

  try {
    const q = query(
      collection(db, 'follows'),
      where('followingId', '==', currentUserId),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FollowRelationship);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
