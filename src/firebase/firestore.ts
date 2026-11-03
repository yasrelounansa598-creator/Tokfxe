import {
  initializeFirestore,
  getFirestore,
  Firestore,
  doc,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';
import { app, auth, isFirebaseConfigured } from './config';

// Silence internal SDK connection retry notices so proxy latency does not trigger error banners
try {
  setLogLevel('silent');
} catch {
  // ignore
}

let dbInstance: Firestore | null = null;

if (isFirebaseConfigured() && app) {
  try {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    try {
      dbInstance = getFirestore(app);
    } catch (error) {
      console.warn('[Tok Fxe Firestore] Initialization note:', error);
    }
  }
}

export const db = dbInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized error handler conforming to Zero-Trust Firestore Security specifications.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errStr = error instanceof Error ? error.message : String(error);
  const isOffline =
    errStr.includes('client is offline') ||
    errStr.includes('offline') ||
    errStr.includes('unavailable') ||
    errStr.includes("didn't respond within") ||
    errStr.includes('Could not reach Cloud Firestore backend');

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (isOffline) {
    console.warn('[Tok Fxe Firestore Offline]: Client is offline or database is provisioning.', errStr);
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Quick server connection validation test.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    // Permission denied or not found is normal for test doc; client offline indicates connection issue
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Tok Fxe Firestore] Client is offline or database connection unavailable.');
      return false;
    }
    return true;
  }
}
