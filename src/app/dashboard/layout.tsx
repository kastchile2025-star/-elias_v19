
"use client";
import type React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LanguageToggle from '@/components/shared/language-toggle';
import ThemeToggle from '@/components/shared/theme-toggle';
import { AIStatusIndicator } from '@/components/shared/ai-status-indicator';
import { UserRoleBadge } from '@/components/shared/user-role-badge';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Library, FileText, Network, FileQuestion, ClipboardList, UserCircle2, HelpCircle, Users, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', labelKey: 'navHome', icon: Home },
  { href: '/dashboard/libros', labelKey: 'navBooks', icon: Library },
  { href: '/dashboard/resumen', labelKey: 'navSummary', icon: FileText },
  { href: '/dashboard/mapa-mental', labelKey: 'navMindMap', icon: Network },
  { href: '/dashboard/cuestionario', labelKey: 'navQuiz', icon: FileQuestion },
  { href: '/dashboard/evaluacion', labelKey: 'navEvaluation', icon: ClipboardList },
  { href: '/dashboard/tareas', labelKey: 'navTasks', icon: ClipboardList },
  { href: '/dashboard/perfil', labelKey: 'navProfile', icon: UserCircle2 },
  { href: '/dashboard/ayuda', labelKey: 'navHelp', icon: HelpCircle },
];

// Admin-only navigation items - these appear only on dashboard cards, not in navigation
const adminNavItems = [
  { href: '/dashboard/gestion-usuarios', labelKey: 'navUserManagement', icon: Users },
  { href: '/dashboard/solicitudes', labelKey: 'navPasswordRequests', icon: Mail },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout, isAdmin, user } = useAuth();
  const { translate } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [activeAccentTheme, setActiveAccentTheme] = useState('default');

  // Navigation items
  const allNavItems = navItems;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Determine active theme based on pathname when dashboard is visible
    if (!isLoading && isAuthenticated) {
      // Check regular navigation items first
      const currentNavItem = allNavItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
      let newTheme = 'default';        if (currentNavItem) {
          switch (currentNavItem.labelKey) {
            case 'navSummary': newTheme = 'blue'; break;
            case 'navBooks': newTheme = 'green'; break;
            case 'navMindMap': newTheme = 'yellow'; break;
            case 'navQuiz': newTheme = 'cyan'; break;
            case 'navEvaluation': newTheme = 'purple'; break;
            case 'navTasks': newTheme = 'orange'; break;
            default: newTheme = 'default';
          }
        }else {
        // Check admin paths that are not in navigation
        if (pathname.startsWith('/dashboard/gestion-usuarios')) {
          newTheme = 'red';
        } else if (pathname.startsWith('/dashboard/solicitudes')) {
          newTheme = 'orange';
        } else if (pathname.startsWith('/dashboard/estadisticas')) {
          // Teacher Statistics section uses unique rose accent
          newTheme = 'rose';
        }
      }
      setActiveAccentTheme(newTheme);
    } else if (!isLoading && !isAuthenticated) {
      // If navigating away from dashboard (e.g. logout), reset to default
      setActiveAccentTheme('default');
    }
  }, [pathname, isLoading, isAuthenticated, allNavItems]);

  useEffect(() => {
    // List of all possible theme classes
  const themeClasses = ['theme-accent-default', 'theme-accent-blue', 'theme-accent-green', 'theme-accent-yellow', 'theme-accent-cyan', 'theme-accent-purple', 'theme-accent-red', 'theme-accent-orange', 'theme-accent-teal', 'theme-accent-rose'];
    
    // Clean up previous theme classes from html element
    themeClasses.forEach(cls => document.documentElement.classList.remove(cls));

    // Add current theme class to html element
    if (activeAccentTheme) {
      document.documentElement.classList.add(`theme-accent-${activeAccentTheme}`);
    }
    
    // Cleanup function to remove class when component unmounts 
    // or before the effect runs next time if activeAccentTheme changes.
    return () => {
      if (activeAccentTheme) {
        document.documentElement.classList.remove(`theme-accent-${activeAccentTheme}`);
      }
    };
  }, [activeAccentTheme]);


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-card border-b border-border">
          <nav className="container mx-auto px-4 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 sm:gap-x-6">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-6 w-32 hidden sm:block" />
            </div>
            <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-20" />)}
            </div>
            <div className="flex justify-end items-center space-x-2 sm:space-x-4">
              <Skeleton className="w-10 h-9" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </nav>
        </header>
        <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-12 w-1/2 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 sm:gap-x-6">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <h1 className="text-xl font-bold whitespace-nowrap text-foreground hidden sm:block font-headline">
              SMART STUDENT
            </h1>
            <img 
              src="/favicon.ico" 
              alt="SMART STUDENT" 
              className="w-7 h-7"
            />
            <AIStatusIndicator />
          </Link>
          
          <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2 overflow-x-auto">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              let activeStyle = 'bg-muted text-foreground font-semibold border-2 border-transparent dark:border-white dark:bg-transparent'; // Default active style with white border in dark mode
              
              if (item.labelKey === 'navSummary') {
                activeStyle = 'bg-custom-blue-100 text-custom-blue-800 font-semibold';
              } else if (item.labelKey === 'navBooks') {
                activeStyle = 'bg-custom-green-100 text-custom-green-800 font-semibold';
              } else if (item.labelKey === 'navMindMap') {
                activeStyle = 'bg-custom-yellow-100 text-custom-yellow-800 font-semibold';
              } else if (item.labelKey === 'navQuiz') {
                activeStyle = 'bg-custom-cyan-100 text-custom-cyan-800 font-semibold';
              } else if (item.labelKey === 'navEvaluation') {
                activeStyle = 'bg-custom-purple-100 text-custom-purple-800 font-semibold';
              } else if (item.labelKey === 'navTasks') {
                activeStyle = 'bg-custom-orange-100 text-custom-orange-800 font-semibold';
              } else if (item.labelKey === 'navUserManagement') {
                activeStyle = 'bg-custom-red-100 text-custom-red-800 font-semibold';
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap relative
                    ${isActive
                      ? activeStyle
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                    }`}
                >
                  {translate(item.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="flex justify-end items-center space-x-2 sm:space-x-4">
            <UserRoleBadge />
            <LanguageToggle />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              title={translate('logoutButtonTitle')}
              className={cn(
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
                "border border-destructive/50 hover:border-destructive" 
              )}
              aria-label={translate('logoutButtonTitle')}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </nav>
         {/* Mobile Navigation - Appears below header on small screens */}
        <div className="md:hidden bg-card border-t border-border p-2">
            <div className="flex items-center justify-start space-x-1 overflow-x-auto">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              let mobileActiveClasses = 'text-muted-foreground hover:text-foreground hover:bg-muted/50';
              
              if (isActive) {
                if (item.labelKey === 'navSummary') {
                  mobileActiveClasses = 'bg-custom-blue-100/50 text-custom-blue-800 font-semibold';
                } else if (item.labelKey === 'navBooks') {
                  mobileActiveClasses = 'bg-custom-green-100/50 text-custom-green-800 font-semibold';
                } else if (item.labelKey === 'navMindMap') {
                  mobileActiveClasses = 'bg-custom-yellow-100/50 text-custom-yellow-800 font-semibold';
                } else if (item.labelKey === 'navQuiz') {
                  mobileActiveClasses = 'bg-custom-cyan-100/50 text-custom-cyan-800 font-semibold';
                } else if (item.labelKey === 'navEvaluation') {
                  mobileActiveClasses = 'bg-custom-purple-100/50 text-custom-purple-800 font-semibold';
                } else if (item.labelKey === 'navTasks') {
                  mobileActiveClasses = 'bg-custom-orange-100/50 text-custom-orange-800 font-semibold';
                } else {
                  // For Home, Profile, Help
                  mobileActiveClasses = 'bg-muted text-foreground font-semibold border-2 border-transparent dark:border-white dark:bg-transparent';
                }
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors min-w-[60px] text-center relative ${mobileActiveClasses}`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="whitespace-nowrap">{translate(item.labelKey)}</span>
                </Link>
              );
            })}
            </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
    
