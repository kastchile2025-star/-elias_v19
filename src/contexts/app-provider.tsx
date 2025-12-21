"use client";

import type React from 'react';
import { AuthProvider } from './auth-context';
import { ThemeProvider } from './theme-context';
import { LanguageProvider } from './language-context';
import { AppDataProvider } from './app-data-context';
import { NotificationSyncProvider } from './notification-sync-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AppDataProvider>
          <AuthProvider>
            <NotificationSyncProvider>
              {children}
            </NotificationSyncProvider>
          </AuthProvider>
        </AppDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

