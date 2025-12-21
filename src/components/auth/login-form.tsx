
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ForgotPasswordDialog } from '@/components/auth/forgot-password-dialog';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const { login } = useAuth();
  const { translate } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = await login(username, password);
    if (!success) {
      setError(translate('loginError'));
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{translate('loginTitle')}</CardTitle>
        <CardDescription>{translate('loginAccess')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">{translate('loginUserPlaceholder')}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={translate('loginUserPlaceholder')}
              required
              className="text-base md:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{translate('loginPassPlaceholder')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translate('loginPassPlaceholder')}
              required
              className="text-base md:text-sm"
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          <Button 
            type="submit" 
            className={cn(
              "w-full font-bold bg-sky-500 hover:bg-sky-600 text-white",
              "hover:brightness-110 hover:shadow-lg hover:scale-105 transition-all duration-200"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? `${translate('loading')}...` : translate('loginButton')}
          </Button>
        </form>
        <button 
          onClick={() => setShowForgotPasswordDialog(true)}
          className="w-full text-center mt-6 text-sm text-foreground hover:underline bg-transparent border-none cursor-pointer"
        >
          {translate('loginForgot')}
        </button>
      </CardContent>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPasswordDialog}
        onOpenChange={setShowForgotPasswordDialog}
      />
    </Card>
  );
}
    
