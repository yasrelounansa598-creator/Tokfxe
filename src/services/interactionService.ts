import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firestore';

export interface FirestoreComment {
  commentId: string;
  postId: string;
  userId: string;
  user: {
    uid: string;
    displayName: string;
    username: string;
    photoURL: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: string;
}

/**
 * Checks if a user has liked a specific post.
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  if (!db || !postId || !userId) return false;
  const path = `posts/${postId}/likes/${userId}`;

  try {
    const likeDoc = await getDoc(doc(db, 'posts', postId, 'likes', userId));
    return likeDoc.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Atomically toggles like on a post.
 * Adds/removes the like record and increments/decrements likesCount atomically.
 * Strictly prevents duplicate likes from the same account.
 */
export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<{ isLiked: boolean; newLikesCount: number }> {
  if (!db) {
    throw new Error('Firestore غير متصل.');
  }

  const path = `posts/${postId}`;
  const postRef = doc(db, 'posts', postId);
  const likeRef = doc(db, 'posts', postId, 'likes', userId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (!postSnap.exists()) {
        throw new Error('POST_NOT_FOUND');
      }

      const currentCount = postSnap.data()?.likesCount || 0;
      const likeSnap = await transaction.get(likeRef);

      if (likeSnap.exists()) {
        // User already liked -> unlike
        transaction.delete(likeRef);
        const newCount = Math.max(0, currentCount - 1);
        transaction.update(postRef, { likesCount: increment(-1) });
        return { isLiked: false, newLikesCount: newCount };
      } else {
        // User has not liked -> like
        transaction.set(likeRef, {
          postId,
          userId,
          createdAt: new Date().toISOString(),
        });
        const newCount = currentCount + 1;
        transaction.update(postRef, { likesCount: increment(1) });
        return { isLiked: true, newLikesCount: newCount };
      }
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Adds a comment to a post and increments commentsCount atomically.
 */
export async function addPostComment(
  postId: string,
  user: FirestoreComment['user'],
  text: string
): Promise<FirestoreComment> {
  if (!db) {
    throw new Error('Firestore غير متصل.');
  }

  const commentId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const path = `posts/${postId}/comments/${commentId}`;

  const newComment: FirestoreComment = {
    commentId,
    postId,
    userId: user.uid,
    user,
    text: text.trim(),
    createdAt: now,
  };

  try {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);

    await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (!postSnap.exists()) {
        throw new Error('POST_NOT_FOUND');
      }

      transaction.set(commentRef, newComment);
      transaction.update(postRef, { commentsCount: increment(1) });
    });

    return newComment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Deletes a comment and decrements commentsCount atomically.
 * Allowed for the comment author OR the post owner.
 */
export async function deletePostComment(
  postId: string,
  commentId: string,
  currentUserId: string
): Promise<void> {
  if (!db) return;
  const path = `posts/${postId}/comments/${commentId}`;

  try {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);

    await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      const commentSnap = await transaction.get(commentRef);

      if (!commentSnap.exists()) return;

      const commentData = commentSnap.data();
      const postOwnerId = postSnap.data()?.userId;

      // Check permission: author or post owner
      if (commentData?.userId !== currentUserId && postOwnerId !== currentUserId) {
        throw new Error('UNAUTHORIZED');
      }

      transaction.delete(commentRef);
      transaction.update(postRef, { commentsCount: increment(-1) });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time listener for comments on a specific post.
 */
export function subscribeToPostComments(
  postId: string,
  callback: (comments: FirestoreComment[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }
  const path = `posts/${postId}/comments`;

  try {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snap) => {
        const comments = snap.docs.map((d) => d.data() as FirestoreComment);
        callback(comments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
