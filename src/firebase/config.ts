import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase Web Client Configuration
 * Loaded securely from Vite environment variables (VITE_FIREBASE_*)
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks if the Firebase client configuration is fully provided and valid.
 * Does NOT accept placeholders or empty strings.
 */
export const isFirebaseConfigured = (): boolean => {
  const { apiKey, projectId, appId } = firebaseConfig;
  const isPlaceholder = (val: string) =>
    !val ||
    val.includes('your-') ||
    val === 'MY_API_KEY' ||
    val === 'YOUR_API_KEY';

  return !isPlaceholder(apiKey) && !isPlaceholder(projectId) && !isPlaceholder(appId);
};

export const getMissingFirebaseKeys = (): string[] => {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your-')) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-')) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('your-')) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId || firebaseConfig.appId.includes('your-')) missing.push('VITE_FIREBASE_APP_ID');
  return missing;
};

// Initialize Firebase App instance safely
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  } catch (error) {
    console.error('[Tok Fxe] Failed to initialize Firebase App:', error);
  }
} else {
  console.warn(
    '[Tok Fxe Firebase] Firebase environment variables are missing or incomplete. Real authentication is waiting for configuration.'
  );
}

export { app };
export const auth = authInstance;

/**
 * Maps standard Firebase Auth error codes into clear, localized Arabic error messages.
 */
export const mapFirebaseAuthError = (error: unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'حدث خطأ غير متوقع أثناء عملية المصادقة.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل بحساب آخر. يرجى تسجيل الدخول.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صالحة. يرجى التأكد من كتابته بشكل صحيح.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 6 أحرف أو أرقام على الأقل.';
    case 'auth/user-not-found':
      return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب. يرجى مراجعة إدارة Tok Fxe.';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح بها مؤقتاً لحماية أمان الحساب. يرجى الانتظار دقيقة والمحاولة مجدداً.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بخوادم المصادقة. يرجى التحقق من اتصالك بالإنترنت.';
    case 'auth/operation-not-allowed':
      return 'خدمة تسجيل الدخول بالبريد الإلكتروني غير مفعّلة في مشروع Firebase.';
    default:
      return err.message || 'فشلت عملية المصادقة. يرجى المحاولة مرة أخرى.';
  }
};
