
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { GeneratePersonalizedCareerPathsOutput } from '@/ai/flows/generate-personalized-career-paths';
import type { CustomAssessmentInput } from '@/context/app-context';
import type { EvaluatePsychometricTestOutput } from '@/ai/schemas/psychometric-test-schemas';

const USERS_COLLECTION = 'users';

export interface UserProfile {
    userId: string;
    name: string;
    email: string;
    photoURL: string;
    birthdate?: string; // Stored as ISO string
    location?: string;
    role?: 'student' | 'professional';
    createdAt?: Timestamp;
    lastLogin?: Timestamp;
}

// ==== User Profile Data ====

export const addOrUpdateUser = async (user: Partial<UserProfile> & { userId: string }): Promise<void> => {
  const userDocRef = doc(db, USERS_COLLECTION, user.userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    // Update existing user
    await setDoc(userDocRef, {
        ...user,
        lastLogin: serverTimestamp(),
    }, { merge: true });
  } else {
    // Create new user
    await setDoc(userDocRef, {
        ...user,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

export const doesUserExist = async (userId: string): Promise<boolean> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists();
}


// ==== Assessment Data (for resume-based flow) ====

export const saveAssessment = async (userId: string, data: CustomAssessmentInput): Promise<void> => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userDocRef, { assessment: data }, { merge: true });
};

export const getAssessment = async (userId: string): Promise<CustomAssessmentInput | null> => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.assessment as CustomAssessmentInput || null;
  }
  return null;
};

// ==== Recommendations Data (for resume-based flow) ====

export const saveRecommendations = async (userId: string, data: GeneratePersonalizedCareerPathsOutput): Promise<void> => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userDocRef, { recommendations: data }, { merge: true });
};

export const getRecommendations = async (userId: string): Promise<GeneratePersonalizedCareerPathsOutput | null> => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Handle case where recommendations might be empty object from a previous clear
    if (Object.keys(data.recommendations || {}).length === 0) return null;
    return data.recommendations as GeneratePersonalizedCareerPathsOutput || null;
  }
  return null;
};

// ==== Psychometric Results Data ====

export const savePsychometricResults = async (userId: string, data: EvaluatePsychometricTestOutput): Promise<void> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userDocRef, { psychometricResults: data }, { merge: true });
};

export const getPsychometricResults = async (userId: string): Promise<EvaluatePsychometricTestOutput | null> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.psychometricResults as EvaluatePsychometricTestOutput || null;
    }
    return null;
};


// ==== Progress Tracker Data ====
export const saveCompletedMilestones = async (userId: string, milestoneTasks: string[]): Promise<void> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userDocRef, { completedMilestones: milestoneTasks }, { merge: true });
};

export const getCompletedMilestones = async (userId: string): Promise<string[] | null> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.completedMilestones as string[] || [];
    }
    return [];
};
