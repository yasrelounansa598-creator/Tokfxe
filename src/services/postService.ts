import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  increment,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firestore';

export type PostVisibility = 'public' | 'followers' | 'private';

export interface FirestorePost {
  postId: string;
  userId: string;
  author: {
    uid: string;
    displayName: string;
    username: string;
    photoURL: string;
    isVerified?: boolean;
  };
  caption: string;
  mediaType: 'video' | 'image' | 'text';
  mediaURL: string;
  thumbnailURL?: string;
  photos?: string[];
  musicTitle?: string;
  hashtags?: string[];
  visibility: PostVisibility;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
}

/**
 * Creates a new post in Firestore and increments the user's postsCount.
 */
export async function createFirestorePost(postData: {
  userId: string;
  author: FirestorePost['author'];
  caption: string;
  mediaType: 'video' | 'image' | 'text';
  mediaURL: string;
  thumbnailURL?: string;
  photos?: string[];
  musicTitle?: string;
  hashtags?: string[];
  visibility: PostVisibility;
}): Promise<FirestorePost> {
  if (!db) {
    throw new Error('Firestore غير متصل.');
  }

  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const path = `posts/${postId}`;

  const newPost: FirestorePost = {
    postId,
    userId: postData.userId,
    author: postData.author,
    caption: postData.caption.trim(),
    mediaType: postData.mediaType,
    mediaURL: postData.mediaURL,
    thumbnailURL: postData.thumbnailURL || '',
    photos: postData.photos || [],
    musicTitle: postData.musicTitle || 'الصوت الأصلي - Tok Fxe',
    hashtags: postData.hashtags || ['#TokFxe'],
    visibility: postData.visibility,
    createdAt: now,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
  };

  try {
    const postRef = doc(db, 'posts', postId);
    const userRef = doc(db, 'users', postData.userId);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      transaction.set(postRef, newPost);
      if (userSnap.exists()) {
        transaction.update(userRef, { postsCount: increment(1) });
      }
    });

    return newPost;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetches feed posts with real-time support.
 */
export async function getPublicPosts(maxCount: number = 20): Promise<FirestorePost[]> {
  if (!db) return [];
  const path = 'posts';

  try {
    const q = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FirestorePost);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Real-time listener for public feed posts.
 */
export function subscribeToPublicPosts(
  callback: (posts: FirestorePost[]) => void,
  maxCount: number = 30
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  const path = 'posts';

  try {
    const q = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );

    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => d.data() as FirestorePost);
        callback(posts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetches posts by user ID, respecting privacy and visibility rules.
 */
export async function getUserPosts(
  targetUserId: string,
  viewerUserId: string | null,
  isFollowerOfTarget: boolean
): Promise<FirestorePost[]> {
  if (!db) return [];
  const path = 'posts';

  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', targetUserId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const allPosts = snap.docs.map((d) => d.data() as FirestorePost);

    const isSelf = viewerUserId === targetUserId;

    // Filter by visibility:
    // - Self sees all posts
    // - Followers see public + followers posts
    // - Non-followers only see public posts
    return allPosts.filter((post) => {
      if (isSelf) return true;
      if (post.visibility === 'public') return true;
      if (post.visibility === 'followers' && isFollowerOfTarget) return true;
      return false;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Deletes a post and decrements the user's postsCount.
 */
export async function deleteFirestorePost(postId: string, userId: string): Promise<void> {
  if (!db) return;
  const path = `posts/${postId}`;

  try {
    const postRef = doc(db, 'posts', postId);
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(postRef);
      if (!snap.exists()) return;
      if (snap.data()?.userId !== userId) {
        throw new Error('UNAUTHORIZED');
      }

      const userSnap = await transaction.get(userRef);
      transaction.delete(postRef);
      if (userSnap.exists()) {
        transaction.update(userRef, { postsCount: increment(-1) });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Updates post privacy setting (public / followers / private).
 */
export async function updatePostVisibility(
  postId: string,
  userId: string,
  visibility: PostVisibility
): Promise<void> {
  if (!db) return;
  const path = `posts/${postId}`;

  try {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
    if (snap.data()?.userId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    await updateDoc(postRef, { visibility });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
