
"use client";

import type React from 'react';
import { createContext, useContext } from 'react';
import { coursesData, faqDataRaw } from '@/lib/constants';
import type { CourseData, RawFaqItem } from '@/lib/types';
import { useLanguage } from './language-context';

interface AppDataContextType {
  courses: CourseData;
  faqData: RawFaqItem[]; 
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // FAQ data could be translated here if needed, or use keys and translate in component
  // For simplicity, passing raw FAQ data with keys.
  return (
    <AppDataContext.Provider value={{ courses: coursesData, faqData: faqDataRaw }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

    