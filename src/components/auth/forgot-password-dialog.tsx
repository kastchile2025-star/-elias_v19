"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { Mail, Send, User } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { translate } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    reason: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast({
        title: translate('error'),
        description: translate('forgotPasswordUsernameRequired'),
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: translate('error'),
        description: translate('forgotPasswordEmailRequired'),
        variant: "destructive"
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: translate('error'),
        description: translate('forgotPasswordEmailInvalid'),
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create password reset request
      const request = {
        id: Date.now().toString(),
        username: formData.username.toLowerCase(),
        email: formData.email,
        reason: formData.reason || translate('forgotPasswordDefaultReason'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'password_reset'
      };

      // Save to localStorage for admin to review
      const existingRequests = localStorage.getItem('password-reset-requests');
      const requests = existingRequests ? JSON.parse(existingRequests) : [];
      requests.push(request);
      localStorage.setItem('password-reset-requests', JSON.stringify(requests));

      console.log('Solicitud de cambio de contraseña creada:', request);

      toast({
        title: translate('success'),
        description: translate('forgotPasswordSuccess'),
        variant: "default"
      });

      // Reset form and close dialog
      setFormData({
        username: '',
        email: '',
        reason: ''
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting password reset request:', error);
      toast({
        title: translate('error'),
        description: translate('forgotPasswordError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      reason: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            {translate('forgotPasswordTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
            {translate('forgotPasswordDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              {translate('forgotPasswordUsername')}
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="pl-10"
                placeholder={translate('forgotPasswordUsernamePlaceholder')}
                disabled={isLoading}
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {translate('forgotPasswordEmail')}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                placeholder={translate('forgotPasswordEmailPlaceholder')}
                disabled={isLoading}
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Reason (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              {translate('forgotPasswordReason')}
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder={translate('forgotPasswordReasonPlaceholder')}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {translate('forgotPasswordReasonHint')}
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-[45%] px-6"
            >
              {translate('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-[45%] px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {translate('sending')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {translate('forgotPasswordSubmit')}
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
