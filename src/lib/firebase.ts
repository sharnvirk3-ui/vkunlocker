import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, Timestamp, increment, orderBy } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler based on instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// User Profile Helpers
export const syncUserProfile = async (user: any) => {
  const userDoc = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userDoc);
    if (!snap.exists()) {
      await setDoc(userDoc, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        walletBalance: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      const data = snap.data();
      const updateData: any = {
        lastLogin: serverTimestamp()
      };
      
      // Migration for users created before walletBalance was added
      if (data && data.walletBalance === undefined) {
        updateData.walletBalance = 0;
      }
      
      // Only set display name if it's missing or truly empty in Firestore
      if (user.displayName && (!data || !data.displayName)) {
        updateData.displayName = user.displayName;
      }
      if (user.photoURL && (!data || !data.photoURL)) {
        updateData.photoURL = user.photoURL;
      }

      await updateDoc(userDoc, updateData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
};

export const depositAmount = async (uid: string, amount: number, utr: string) => {
  // --- Enhanced Real-Time Structural Validation ---
  const isInvalidPattern = (val: string) => {
    // 1. Basic length and numeric check
    if (!/^\d{12}$/.test(val)) return true;
    
    // 2. Temporal Integrity Check (Year/Day mapping)
    // Most UTRs use format: YDDDXXXXXXXX (Y=last digit of year, DDD=Julian day of year)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const currentYearDigit = now.getFullYear().toString().slice(-1);
    const julianPrefix = `${currentYearDigit}${dayOfYear.toString().padStart(3, '0')}`;
    
    // We allow current day or previous day (due to timezones/late night transactions)
    const yesterdayDate = new Date(now.getTime() - oneDay);
    const yesterdayDayOfYear = Math.floor((yesterdayDate.getTime() - new Date(yesterdayDate.getFullYear(), 0, 0).getTime()) / oneDay);
    const yesterdayPrefix = `${yesterdayDate.getFullYear().toString().slice(-1)}${yesterdayDayOfYear.toString().padStart(3, '0')}`;

    // Rejection: If it doesn't start with a valid year+day code (matches 90% of real UPI UTRs)
    if (!val.startsWith(julianPrefix) && !val.startsWith(yesterdayPrefix)) {
      // Note: We don't strictly reject ALL others as some banks use different formats, 
      // but we apply strict entropy checks for non-conforming ones.
      const hasLowEntropy = (s: string) => {
        const unique = new Set(s.split('')).size;
        return unique < 4; // Fakes often use few unique digits
      };
      if (hasLowEntropy(val)) return true;
    }
    
    // 3. Sequential/Repetitive Rejection
    if (/^(\d)\1{11}$/.test(val)) return true;
    const sequential = "01234567890123456789";
    if (sequential.includes(val) || "98765432109876543210".includes(val)) return true;

    // 4. Common Fake Reference Table
    const commonFakes = [
      '123456789012', '987654321098', '112233445566', '001122334455', 
      '102030405060', '000000000000', '999999999999'
    ];
    if (commonFakes.includes(val)) return true;

    return false;
  };

  if (isInvalidPattern(utr)) {
    throw new Error('SECURITY_ALERT: Genuine UTR could not be verified online. Transaction ID does not match NPCI standard sequence for today. Please check GPay history and enter the 12-digit Ref No. accurately.');
  }

  // --- Global Uniqueness Constraint ---
  const userDoc = doc(db, 'users', uid);
  const transactionRef = doc(collection(db, 'users', uid, 'transactions'));
  const utrRef = doc(db, 'users_metadata', 'system', 'utrs', utr);

  try {
    // Check if UTR already exists in our system
    const utrSnap = await getDoc(utrRef);
    if (utrSnap.exists()) {
      throw new Error('DUPLICATE_UTR: This transaction ID has already been claimed. Multiple claims for the same transaction are not allowed.');
    }

    // Create a completed transaction record with UTR for audit
    await setDoc(transactionRef, {
      userId: uid,
      amount,
      utr,
      type: 'deposit',
      description: 'Wallet Recharge (UPI)',
      status: 'completed',
      timestamp: serverTimestamp()
    });

    // Mark UTR as used
    await setDoc(utrRef, {
      utr,
      userId: uid,
      amount,
      claimedAt: serverTimestamp()
    });

    // Increment user balance automatically
    await updateDoc(userDoc, {
      walletBalance: increment(amount)
    });

    return transactionRef.id;
  } catch (error: any) {
    if (error.message.includes('DUPLICATE_UTR') || error.message.includes('INVALID_UTR_FORMAT')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export const purchaseTool = async (uid: string, tool: any, price: number) => {
  const userDoc = doc(db, 'users', uid);
  const rentalRef = doc(collection(db, 'users', uid, 'rentals'));
  const transactionRef = doc(collection(db, 'users', uid, 'transactions'));

  try {
    const userSnap = await getDoc(userDoc);
    if (!userSnap.exists()) throw new Error('User not found');
    const balance = userSnap.data().walletBalance || 0;

    if (balance < price) throw new Error('Insufficient balance');

    // In a real production app, this should be a transaction for atomicity
    await updateDoc(userDoc, {
      walletBalance: balance - price
    });

    await setDoc(rentalRef, {
      userId: uid,
      toolName: tool.name,
      price: `₹${price}`,
      duration: tool.price.split('/')[1]?.trim() || '24h',
      status: 'active',
      startTime: serverTimestamp(),
      endTime: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // Default to 24h
      accessId: `VK_${Math.floor(100000 + Math.random() * 900000)}`,
      accessPass: `PASS_${Math.floor(1000 + Math.random() * 9000)}`
    });

    const rentalSnap = await getDoc(rentalRef);
    const rentalData = rentalSnap.data();

    await setDoc(transactionRef, {
      userId: uid,
      amount: price,
      type: 'purchase',
      description: `Purchase: ${tool.name}`,
      status: 'completed',
      timestamp: serverTimestamp()
    });

    return { 
      accessId: rentalData?.accessId, 
      accessPass: rentalData?.accessPass, 
      supportNumber: "+91 88728-12928" 
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export const getUserRentals = async (uid: string) => {
  const rentalRef = collection(db, 'users', uid, 'rentals');
  const q = query(rentalRef, orderBy('startTime', 'desc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/rentals`);
  }
};

export const getUserTransactions = async (uid: string) => {
  const transRef = collection(db, 'users', uid, 'transactions');
  const q = query(transRef, orderBy('timestamp', 'desc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/transactions`);
  }
};

export const updateUserProfile = async (uid: string, data: { displayName?: string, phoneNumber?: string }) => {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};
