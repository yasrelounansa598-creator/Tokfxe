
/**
 * Cloudinary Storage Service
 * Project: TOK FXE
 * Free unsigned uploads
 */

const CLOUDINARY_CLOUD_NAME = 'aurmk69h';
const CLOUDINARY_UPLOAD_PRESET = 'tke-fxe';

export async function uploadMediaToStorage(
  file: File | Blob,
  folder: 'videos' | 'photos' | 'avatars',
  userId: string,
  onProgress?: (progressPercent: number) => void
): Promise<{
  downloadUrl: string;
  storagePath: string;
  isFallback?: boolean;
}> {

  const timestamp = Date.now();

  const fileName = `${userId}_${timestamp}`;

  const storagePath = `${folder}/${userId}/${fileName}`;

  const endpoint =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', storagePath);

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    xhr.open('POST', endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round(
          (event.loaded / event.total) * 100
        );

        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {

          if (!response.secure_url || !response.public_id) {
            reject(new Error('Invalid Cloudinary response'));
            return;
          }

          if (onProgress) onProgress(100);

          resolve({
            downloadUrl: response.secure_url,
            storagePath: response.public_id,
            isFallback: false
          });

        } else {
          reject(
            new Error(
              response.error?.message ||
              'Cloudinary upload failed'
            )
          );
        }

      } catch (error) {
        reject(error);
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out'));
    };

    xhr.send(formData);
  });
}
