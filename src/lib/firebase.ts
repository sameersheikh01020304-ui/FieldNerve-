import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  collectionGroup,
  where,
  query,
  orderBy,
  limit,
  type Firestore,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { UserProfile, CropAnalysisResult, HistoryItem, ExpertCallbackRequest } from '../types';

export const ADMIN_INFO = {
  name: "Sameer Sheikh",
  email: "sameersheikh01020304@gmail.com",
  phone: "7521011565",
  role: "admin" as const,
};

export const isAdminUser = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_INFO.email.toLowerCase();
};


const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyBUrFXo5V62EpVktrqnPNRkCNlkb6uwHus",
  authDomain: config.authDomain || "fieldnerve.firebaseapp.com",
  projectId: config.projectId || "fieldnerve",
  storageBucket: config.storageBucket || "fieldnerve.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "390410057924",
  appId: config.appId || "1:390410057924:web:407d1a9587c2485a6eb191",
  measurementId: config.measurementId || "G-WSPQ9NQD6Y",
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
export let db: Firestore;
try {
  if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, config.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('Could not initialize specific databaseId, falling back to default:', e);
  db = getFirestore(app);
}

// User Profile Helpers
export async function saveUserProfile(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

// User Crop Scans Persistence
export async function saveUserScanToCloud(
  uid: string,
  scanData: CropAnalysisResult
): Promise<string> {
  try {
    const scansCol = collection(db, 'users', uid, 'scans');
    const docRef = await addDoc(scansCol, {
      ...scanData,
      userId: uid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan to cloud:', error);
    return scanData.id;
  }
}

export async function getUserScansFromCloud(uid: string): Promise<CropAnalysisResult[]> {
  try {
    const scansCol = collection(db, 'users', uid, 'scans');
    const q = query(scansCol, orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
  } catch (error) {
    console.warn('Error retrieving user scans from Firestore:', error);
    return [];
  }
}

// User Q&A Query Persistence
export async function saveUserQueryToCloud(
  uid: string,
  queryData: {
    question: string;
    answer: string;
    answerHindi?: string;
    answerEnglish?: string;
    audioScriptHindi?: string;
    audioScriptEnglish?: string;
    language: string;
  }
): Promise<string> {
  try {
    const queriesCol = collection(db, 'users', uid, 'queries');
    const docRef = await addDoc(queriesCol, {
      ...queryData,
      userId: uid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving query to cloud:', error);
    return 'q_' + Date.now();
  }
}

export async function getUserQueriesFromCloud(uid: string): Promise<HistoryItem[]> {
  try {
    const queriesCol = collection(db, 'users', uid, 'queries');
    const q = query(queriesCol, orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        type: 'text_qa' as const,
        title: (data.question || '').slice(0, 45),
        snippet: (data.answer || '').slice(0, 85) + '...',
        date: data.createdAt || new Date().toISOString(),
        language: (data.language as any) || 'en',
        data,
      };
    });
  } catch (error) {
    console.warn('Error retrieving user queries from Firestore:', error);
    return [];
  }
}

// ==========================================
// ADMIN PORTAL OPERATIONS (Sameer Sheikh)
// ==========================================

// Initial sample farmer registrations for demonstration when Firestore users collection is fresh
export const SAMPLE_FARMERS: UserProfile[] = [
  {
    uid: 'farmer_101',
    name: 'Rameshwar Lal Patel',
    email: 'rameshwar.kisan@gmail.com',
    phone: '9829012345',
    village: 'Piprali, Sikar',
    state: 'Rajasthan',
    crops: ['Wheat', 'Mustard', 'Gram'],
    preferredLanguage: 'hi',
    role: 'farmer',
    status: 'active',
    createdAt: '2026-08-15T09:30:00.000Z',
  },
  {
    uid: 'farmer_102',
    name: 'Gurpreet Singh Dhillon',
    email: 'gurpreet.farm@punjabmail.com',
    phone: '9417088990',
    village: 'Samrala, Ludhiana',
    state: 'Punjab',
    crops: ['Paddy (Basmati)', 'Wheat', 'Potato'],
    preferredLanguage: 'en',
    role: 'farmer',
    status: 'active',
    createdAt: '2026-08-20T11:15:00.000Z',
  },
  {
    uid: 'farmer_103',
    name: 'Shivaji Rao Deshmukh',
    email: 'shivaji.agri@rediffmail.com',
    phone: '9860011223',
    village: 'Baramati, Pune',
    state: 'Maharashtra',
    crops: ['Sugarcane', 'Cotton', 'Soybean'],
    preferredLanguage: 'hi',
    role: 'farmer',
    status: 'active',
    createdAt: '2026-08-28T14:20:00.000Z',
  },
  {
    uid: 'farmer_104',
    name: 'Manish Verma',
    email: 'manish.krishi@gmail.com',
    phone: '7521099887',
    village: 'Mohanlalganj, Lucknow',
    state: 'Uttar Pradesh',
    crops: ['Mustard', 'Wheat', 'Vegetables'],
    preferredLanguage: 'hi',
    role: 'farmer',
    status: 'active',
    createdAt: '2026-09-02T16:45:00.000Z',
  },
];

// Sample scans for the admin data view
export const SAMPLE_PLATFORM_SCANS: (CropAnalysisResult & { farmerName?: string; farmerPhone?: string })[] = [
  {
    id: 'scan_adm_1',
    timestamp: '2026-09-08T08:45:00.000Z',
    createdAt: '2026-09-08T08:45:00.000Z',
    crop: 'Wheat (गेहूं)',
    problem: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
    healthStatus: 'critical',
    confidence: '95%',
    warning: 'Critical fungal outbreak risk! Airborne urediniospores spread rapidly under 10-18°C temperature with high morning dew.',
    possible_causes: ['Fungal pathogen Puccinia striiformis', 'High humidity & cool weather'],
    prevention: ['Crop rotation with legumes', 'Resistant cultivars (HD 2967, DBW 187)'],
    recommendations: [
      'Apply Propiconazole 25% EC @ 1ml/L immediately.',
      'Stop excess urea application; increase potassium.',
      'Notify nearby farmers to create a 200m buffer zone.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    language: 'hi',
    farmerName: 'Gurpreet Singh Dhillon',
    farmerPhone: '9417088990',
  },
  {
    id: 'scan_adm_2',
    timestamp: '2026-09-08T15:10:00.000Z',
    createdAt: '2026-09-08T15:10:00.000Z',
    crop: 'Tomato (टमाटर)',
    problem: 'Early Blight (Alternaria solani)',
    healthStatus: 'moderate',
    confidence: '88%',
    warning: '',
    possible_causes: ['Fungus Alternaria solani', 'Overhead sprinkler irrigation'],
    prevention: ['Drip irrigation', 'Mulching'],
    recommendations: [
      'Spray Mancozeb 75% WP @ 2g per liter water.',
      'Prune lower yellowing diseased foliage.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    language: 'hi',
    farmerName: 'Manish Verma',
    farmerPhone: '7521099887',
  },
  {
    id: 'scan_adm_3',
    timestamp: '2026-09-09T09:20:00.000Z',
    createdAt: '2026-09-09T09:20:00.000Z',
    crop: 'Mustard (सरसों)',
    problem: 'Aphid Infestation (Lipaphis erysimi)',
    healthStatus: 'moderate',
    confidence: '91%',
    warning: '',
    possible_causes: ['Cloudy weather favoring aphid proliferation'],
    prevention: ['Early sowing in October', 'Yellow sticky traps'],
    recommendations: [
      'Spray Dimethoate 30% EC @ 1.5ml/L or Imidacloprid 17.8% SL @ 0.5ml/L.',
      'Conserve natural predators like Coccinellid beetles.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    language: 'hi',
    farmerName: 'Rameshwar Lal Patel',
    farmerPhone: '9829012345',
  },
];

// Fetch all registered farmers from Firestore (with sample fallback & seeding)
export async function getAllRegisteredFarmers(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    
    if (!snap.empty) {
      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...(docSnap.data() as any) });
      });
      return list;
    }

    // Seed sample farmers into Firestore if empty
    for (const farmer of SAMPLE_FARMERS) {
      await setDoc(doc(db, 'users', farmer.uid), farmer);
    }
    // Also save Admin Sameer Sheikh profile
    await setDoc(doc(db, 'users', 'admin_sameer_sheikh'), {
      uid: 'admin_sameer_sheikh',
      name: ADMIN_INFO.name,
      email: ADMIN_INFO.email,
      phone: ADMIN_INFO.phone,
      role: 'admin',
      status: 'active',
      village: 'Central Admin Cell',
      state: 'All India',
      crops: ['System Administration', 'Agri Analytics'],
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    });

    return [
      {
        uid: 'admin_sameer_sheikh',
        name: ADMIN_INFO.name,
        email: ADMIN_INFO.email,
        phone: ADMIN_INFO.phone,
        role: 'admin',
        status: 'active',
        village: 'Central HQ',
        state: 'HQ',
        crops: ['Administrator'],
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      },
      ...SAMPLE_FARMERS,
    ];
  } catch (error) {
    console.error('Error in getAllRegisteredFarmers:', error);
    return SAMPLE_FARMERS;
  }
}

// Admin: Save or update farmer registration
export async function adminSaveFarmer(farmer: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, 'users', farmer.uid);
    await setDoc(docRef, {
      ...farmer,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error in adminSaveFarmer:', error);
    throw error;
  }
}

// Admin: Delete farmer registration
export async function adminDeleteFarmer(uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error in adminDeleteFarmer:', error);
    throw error;
  }
}

// Admin: Update farmer status (active / suspended)
export async function adminUpdateFarmerStatus(uid: string, status: 'active' | 'suspended'): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error in adminUpdateFarmerStatus:', error);
    throw error;
  }
}

// Admin: Get all scans across platform
export async function getAllPlatformScans(): Promise<(CropAnalysisResult & { farmerName?: string; farmerPhone?: string })[]> {
  try {
    const scansSnap = await getDocs(collectionGroup(db, 'scans'));
    if (!scansSnap.empty) {
      return scansSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
    }
  } catch (e) {
    console.warn('collectionGroup(scans) fallback:', e);
  }
  return SAMPLE_PLATFORM_SCANS;
}

// Admin: Delete a scan document
export async function adminDeleteScan(userId: string, scanId: string): Promise<void> {
  try {
    if (userId) {
      await deleteDoc(doc(db, 'users', userId, 'scans', scanId));
    }
  } catch (error) {
    console.error('Error in adminDeleteScan:', error);
  }
}

// Admin: Get all queries across platform
export async function getAllPlatformQueries(): Promise<HistoryItem[]> {
  try {
    const queriesSnap = await getDocs(collectionGroup(db, 'queries'));
    if (!queriesSnap.empty) {
      return queriesSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: 'text_qa' as const,
          title: (data.question || '').slice(0, 50),
          snippet: (data.answer || '').slice(0, 100) + '...',
          date: data.createdAt || new Date().toISOString(),
          language: (data.language as any) || 'en',
          data,
        };
      });
    }
  } catch (e) {
    console.warn('collectionGroup(queries) fallback:', e);
  }
  return [];
}

// Admin: Expert Requests handling
export async function getAllExpertRequests(): Promise<ExpertCallbackRequest[]> {
  try {
    const colRef = collection(db, 'expert_requests');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    }
  } catch (e) {
    console.warn('Failed to fetch expert_requests from Firestore:', e);
  }

  // Also query server
  try {
    const res = await fetch('/api/history');
    if (res.ok) {
      const data = await res.json();
      if (data.expertRequests && data.expertRequests.length > 0) {
        return data.expertRequests.map((r: any) => ({
          id: r.id,
          farmerName: r.farmerName,
          phone: r.phoneNumber,
          crop: r.cropName,
          problem: r.problemDescription,
          status: (r.status?.includes('Assigned') ? 'pending' : 'resolved') as any,
          createdAt: r.createdAt,
        }));
      }
    }
  } catch (err) {
    console.warn('Server history fetch error:', err);
  }

  return [
    {
      id: 'EXP-882194',
      farmerName: 'Rameshwar Lal Patel',
      phone: '9829012345',
      crop: 'Wheat',
      problem: 'Sudden yellow rust patches spreading across 3 bigha field',
      status: 'pending',
      createdAt: '2026-09-09T08:15:00.000Z',
    },
    {
      id: 'EXP-741203',
      farmerName: 'Gurpreet Singh Dhillon',
      phone: '9417088990',
      crop: 'Basmati Rice',
      problem: 'Stem borer attack seen in nursery saplings',
      status: 'in_progress',
      createdAt: '2026-09-08T18:40:00.000Z',
    }
  ];
}

export async function adminUpdateExpertRequest(id: string, status: 'pending' | 'in_progress' | 'resolved'): Promise<void> {
  try {
    const docRef = doc(db, 'expert_requests', id);
    await setDoc(docRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.error('Failed to update expert request in Firestore:', e);
  }
}

export async function adminDeleteExpertRequest(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'expert_requests', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Failed to delete expert request:', e);
  }
}

