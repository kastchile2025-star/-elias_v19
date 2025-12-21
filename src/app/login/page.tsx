
"use client";

import LoginForm from '@/components/auth/login-form';
import { useLanguage } from '@/contexts/language-context';
import LanguageToggle from '@/components/shared/language-toggle';
import ThemeToggle from '@/components/shared/theme-toggle';

export default function LoginPage() {
  const { translate } = useLanguage();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Adjusted title and logo section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3"> {/* Aligns text-block and logo */}
            <div className="flex flex-col text-center"> {/* Stacks title and slogan vertically, centered */}
              <h1 className="text-3xl font-bold text-foreground font-headline">SMART STUDENT</h1>
              {/* Slogan is centered relative to "SMART STUDENT" due to text-center */}
              <p className="text-muted-foreground">{translate('appSlogan')}</p>
            </div>
            <img 
              src="/favicon.ico" 
              alt="SMART STUDENT" 
              className="w-10 h-10"
            /> {/* Logo moved to the right */}
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
