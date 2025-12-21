"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError(translate('changePasswordCurrentRequired'));
      return false;
    }

    if (!formData.newPassword) {
      setError(translate('changePasswordCurrentRequired')); // Using existing translation
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError(translate('changePasswordMinLength'));
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(translate('changePasswordMismatch'));
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError(translate('changePasswordSameAsOld'));
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
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get current users from localStorage using the correct key
      const storedUsers = localStorage.getItem('smart-student-users');
      let users = [];
      let userFound = false;
      
      console.log('=== CAMBIO DE CONTRASEÑA DEBUG ===');
      console.log('Usuario actual:', user?.username);
      console.log('Datos en localStorage:', storedUsers);
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
        console.log('Usuarios parseados:', users);
        const userIndex = users.findIndex((u: any) => u.username === user?.username);
        console.log('Índice del usuario:', userIndex);
        
        if (userIndex !== -1) {
          console.log('Usuario encontrado en localStorage:', users[userIndex]);
          // Verify current password
          if (users[userIndex].password !== formData.currentPassword) {
            console.log('Contraseña actual incorrecta');
            console.log('Almacenada:', users[userIndex].password);
            console.log('Ingresada:', formData.currentPassword);
            setError(translate('changePasswordIncorrectCurrent'));
            return;
          }
          
          // Update password
          console.log('Actualizando contraseña de:', users[userIndex].password, 'a:', formData.newPassword);
          users[userIndex].password = formData.newPassword;
          localStorage.setItem('smart-student-users', JSON.stringify(users));
          console.log('Contraseña actualizada en localStorage');
          userFound = true;
        }
      }
      
      // If user not found in localStorage, they might be using a default account
      // Create/update the localStorage with the new password
      if (!userFound && user) {
        // Verify against default users first
        const defaultUsers: Record<string, any> = {
          'admin': { password: '1234', role: 'admin', displayName: 'Administrador del Sistema', activeCourses: [], email: 'admin@smartstudent.com' },
          'felipe': { password: '1234', role: 'student', displayName: 'Felipe Estudiante', activeCourses: ['8vo Básico'], email: 'felipe@student.com' },
          'jorge': { password: '1234', role: 'teacher', displayName: 'Jorge Profesor', activeCourses: ['8vo Básico', '1ro Medio'], email: 'jorge@teacher.com' }
        };
        
        const defaultUser = defaultUsers[user.username];
        if (defaultUser && defaultUser.password === formData.currentPassword) {
          // Create user in localStorage with new password
          const newUser = {
            username: user.username,
            password: formData.newPassword,
            role: user.role,
            displayName: user.displayName,
            activeCourses: user.activeCourses,
            email: user.email || defaultUser.email
          };
          
          users.push(newUser);
          localStorage.setItem('smart-student-users', JSON.stringify(users));
          userFound = true;
        } else {
          setError(translate('changePasswordIncorrectCurrent'));
          return;
        }
      }
      
      if (userFound) {
        toast({
          title: translate('success'),
          description: translate('changePasswordSuccess'),
          variant: "default"
        });
        
        resetForm();
        onOpenChange(false);
      } else {
        setError(translate('changePasswordUserNotFound'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(translate('changePasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {translate('changePasswordTitle')}
          </DialogTitle>
          <DialogDescription>
            {translate('changePasswordDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">{translate('changePasswordCurrent')}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder={translate('changePasswordCurrentPlaceholder')}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{translate('changePasswordNew')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder={translate('changePasswordNewPlaceholder')}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.newPassword && (
              <div className="text-xs text-muted-foreground">
                {translate('changePasswordMinLength')}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{translate('changePasswordConfirm')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={translate('changePasswordConfirmPlaceholder')}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.confirmPassword && formData.newPassword && formData.confirmPassword === formData.newPassword && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                {translate('changePasswordMatch')}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {translate('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {translate('changing')}
                </>
              ) : (
                translate('changePasswordSubmit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
