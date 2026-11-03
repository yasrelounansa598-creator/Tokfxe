import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { app, isFirebaseConfigured } from '../firebase/config';

/**
 * Uploads a video file or photo to Firebase Cloud Storage.
 * Provides real-time progress callbacks and fallback handling.
 */
export async function uploadMediaToStorage(
  file: File | Blob,
  folder: 'videos' | 'photos' | 'avatars',
  userId: string,
  onProgress?: (progressPercent: number) => void
): Promise<{ downloadUrl: string; storagePath: string; isFallback?: boolean }> {
  const timestamp = Date.now();
  const fileExt = file.type.includes('mp4')
    ? 'mp4'
    : file.type.includes('png')
    ? 'png'
    : file.type.includes('webp')
    ? 'webp'
    : 'jpg';
  const fileName = `${userId}_${timestamp}.${fileExt}`;
  const storagePath = `${folder}/${userId}/${fileName}`;

  // If Firebase is not configured or in offline/local mode, fallback gracefully to Blob URL
  if (!app || !isFirebaseConfigured()) {
    const localUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    return { downloadUrl: localUrl, storagePath, isFallback: true };
  }

  try {
    const storage = getStorage(app);
    const fileRef = ref(storage, storagePath);

    const metadata = {
      contentType: file.type || (folder === 'videos' ? 'video/mp4' : 'image/jpeg'),
      customMetadata: {
        uploadedBy: userId,
        app: 'tok-fxe',
        createdAt: new Date().toISOString(),
      },
    };

    return new Promise((resolve) => {
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(percent));
        },
        (error) => {
          console.warn('[Tok Fxe Storage] Firebase Storage upload error, using local fallback:', error.message);
          // Return local object URL so user operation never fails
          const fallbackUrl = URL.createObjectURL(file);
          resolve({ downloadUrl: fallbackUrl, storagePath, isFallback: true });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadUrl, storagePath, isFallback: false });
          } catch (err) {
            console.warn('[Tok Fxe Storage] Failed to get download URL, using local fallback:', err);
            const fallbackUrl = URL.createObjectURL(file);
            resolve({ downloadUrl: fallbackUrl, storagePath, isFallback: true });
          }
        }
      );
    });
  } catch (error) {
    console.warn('[Tok Fxe Storage] Storage exception, using fallback:', error);
    const fallbackUrl = URL.createObjectURL(file);
    return { downloadUrl: fallbackUrl, storagePath, isFallback: true };
  }
}
