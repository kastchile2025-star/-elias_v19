
"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from "next-themes/dist/types";
import type React from 'react';
// useEffect and useState are not directly needed here if we remove the mounted guard
// import { useEffect, useState } from 'react'; 

// This is a wrapper around next-themes.
// The custom toggle logic from the HTML might need a separate component that uses `useTheme` from `next-themes`.

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // The `mounted` state guard is generally not needed here because
  // NextThemesProvider itself handles the logic for theme application
  // across SSR and client-side hydration using its props like `defaultTheme` and `enableSystem`.
  // It's designed to prevent hydration mismatches for theme-related attributes.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

    