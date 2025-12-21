
"use client";

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a div that occupies roughly the same space as the Switch
    // to prevent layout shift during hydration.
    // Shadcn Switch is w-11 (2.75rem ~ 44px) h-6 (1.5rem ~ 24px).
    return <div style={{ width: '44px', height: '24px' }} aria-hidden="true" />;
  }

  // Determine the checked state based on the current theme.
  // resolvedTheme helps handle 'system' preference correctly.
  const isDarkMode = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  return (
    <Switch
      checked={isDarkMode}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
}
    
