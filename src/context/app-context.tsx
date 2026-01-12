
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import type { GeneratePersonalizedCareerPathsInput, GeneratePersonalizedCareerPathsOutput } from '@/ai/flows/generate-personalized-career-paths';
import { auth } from '@/lib/firebase';
import { getAssessment, getRecommendations, getPsychometricResults, saveAssessment, saveRecommendations, savePsychometricResults, getUserProfile, getCompletedMilestones, saveCompletedMilestones } from '@/lib/firestore';
import type { EvaluatePsychometricTestOutput } from '@/ai/schemas/psychometric-test-schemas';
import type { UserProfile } from '@/lib/firestore';
import careerData from '@/lib/progress-data.json';
import { CareerData } from '@/ai/schemas/progress-tracker-schemas';

// Extend the input type to include the new userType field
export interface CustomAssessmentInput extends GeneratePersonalizedCareerPathsInput {
    userType?: string;
}

interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  assessmentData: CustomAssessmentInput | null;
  recommendations: GeneratePersonalizedCareerPathsOutput | null;
  psychometricResults: EvaluatePsychometricTestOutput | null;
  completedMilestones: string[];
  careerData: CareerData;
  remoteCompletedMilestones: string[];
  setUserProfile: (profile: UserProfile | null) => void;
  setAssessmentData: (data: CustomAssessmentInput | null) => Promise<void>;
  setRecommendations: (data: GeneratePersonalizedCareerPathsOutput | null) => Promise<void>;
  setPsychometricResults: (data: EvaluatePsychometricTestOutput | null) => Promise<void>;
  toggleMilestone: (milestoneTask: string) => void;
  saveProgress: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentData, setLocalAssessmentData] = useState<CustomAssessmentInput | null>(null);
  const [recommendations, setLocalRecommendations] = useState<GeneratePersonalizedCareerPathsOutput | null>(null);
  const [psychometricResults, setLocalPsychometricResults] = useState<EvaluatePsychometricTestOutput | null>(null);
  const [completedMilestones, setLocalCompletedMilestones] = useState<string[]>([]);
  const [remoteCompletedMilestones, setRemoteCompletedMilestones] = useState<string[]>([]);

  const fetchAllUserData = useCallback(async (user: User) => {
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);

    if (profile) {
        const [assessment, recommendations, psychometric, milestones] = await Promise.all([
            getAssessment(user.uid),
            getRecommendations(user.uid),
            getPsychometricResults(user.uid),
            getCompletedMilestones(user.uid),
        ]);
        if (assessment) setLocalAssessmentData(assessment);
        if (recommendations) setLocalRecommendations(recommendations);
        if (psychometric) setLocalPsychometricResults(psychometric);
        if (milestones) {
          setLocalCompletedMilestones(milestones);
          setRemoteCompletedMilestones(milestones);
        }
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        setLoading(true);
        await fetchAllUserData(currentUser);
        setLoading(false);
    }
  }, [fetchAllUserData]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchAllUserData(user);
      } else {
        // User is logged out, clear all data
        setUserProfile(null);
        setLocalAssessmentData(null);
        setLocalRecommendations(null);
        setLocalPsychometricResults(null);
        setLocalCompletedMilestones([]);
        setRemoteCompletedMilestones([]);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchAllUserData]);

  const handleSetUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfile(profile);
  }, []);


  const setAssessmentData = useCallback(async (data: CustomAssessmentInput | null) => {
    setLocalAssessmentData(data);
    if (user && data) {
      await saveAssessment(user.uid, data);
    }
  }, [user]);

  const setRecommendations = useCallback(async (data: GeneratePersonalizedCareerPathsOutput | null) => {
    setLocalRecommendations(data);
    if (user && data) {
      await saveRecommendations(user.uid, data);
    } else if (user && !data) {
      await saveRecommendations(user.uid, {} as GeneratePersonalizedCareerPathsOutput);
    }
  }, [user]);

  const setPsychometricResults = useCallback(async (data: EvaluatePsychometricTestOutput | null) => {
    setLocalPsychometricResults(data);
    if (user && data) {
        await savePsychometricResults(user.uid, data);
    }
  }, [user]);

  const toggleMilestone = useCallback((milestoneTask: string) => {
    setLocalCompletedMilestones(prev => 
        prev.includes(milestoneTask)
        ? prev.filter(t => t !== milestoneTask)
        : [...prev, milestoneTask]
    );
  }, []);

  const saveProgress = useCallback(async () => {
    if (user) {
      await saveCompletedMilestones(user.uid, completedMilestones);
      setRemoteCompletedMilestones(completedMilestones);
    }
  }, [user, completedMilestones]);


  return (
    <AppContext.Provider value={{ 
        user, loading, userProfile, setUserProfile: handleSetUserProfile, 
        assessmentData, setAssessmentData, 
        recommendations, setRecommendations, 
        psychometricResults, setPsychometricResults,
        completedMilestones, toggleMilestone,
        careerData: careerData as CareerData,
        remoteCompletedMilestones,
        saveProgress,
        refreshUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
