"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Clock, Check, X, Key, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PasswordRequest {
  id: string;
  username: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  type: string;
  processedAt?: string;
  processedBy?: string;
  newPassword?: string;
}

export default function PasswordRequestsPage() {
  const { translate } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [requests, setRequests] = useState<PasswordRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PasswordRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAdmin, router]);

  // Load password requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      const storedRequests = localStorage.getItem('password-reset-requests');
      if (storedRequests) {
        const parsedRequests = JSON.parse(storedRequests);
        // Sort by creation date (newest first)
        parsedRequests.sort((a: PasswordRequest, b: PasswordRequest) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRequests(parsedRequests);
      }
    } catch (error) {
      console.error('Error loading password requests:', error);
    }
  };

  const handleProcessRequest = (request: PasswordRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    if (action === 'approve') {
      setNewPassword(''); // Reset password field
      setShowProcessDialog(true);
    } else {
      // Direct rejection
      processRequest(request, action);
    }
  };

  const processRequest = async (request: PasswordRequest, action: 'approve' | 'reject', password?: string) => {
    setIsProcessing(true);

    try {
      // Update request status
      const updatedRequest = {
        ...request,
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date().toISOString(),
        processedBy: user?.username,
        newPassword: action === 'approve' ? password : undefined
      };

      // Update requests in localStorage
      const updatedRequests = requests.map(req => 
        req.id === request.id ? updatedRequest : req
      );
      localStorage.setItem('password-reset-requests', JSON.stringify(updatedRequests));

      if (action === 'approve' && password) {
        // Update user password in the system
        await updateUserPassword(request.username, password);
      }

      // Update local state
      setRequests(updatedRequests);

      toast({
        title: translate('success'),
        description: action === 'approve' 
          ? translate('passwordRequestApproved')
          : translate('passwordRequestRejected'),
        variant: "default"
      });

      setShowProcessDialog(false);
      setSelectedRequest(null);
      setNewPassword('');

    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: translate('error'),
        description: translate('passwordRequestError'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateUserPassword = async (username: string, newPassword: string) => {
    try {
      // Get users from localStorage
      const storedUsers = localStorage.getItem('smart-student-users');
      let users = [];
      let userFound = false;

      if (storedUsers) {
        users = JSON.parse(storedUsers);
        const userIndex = users.findIndex((u: any) => u.username === username);
        
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          localStorage.setItem('smart-student-users', JSON.stringify(users));
          userFound = true;
        }
      }

      // If user not found in localStorage, create entry
      if (!userFound) {
        // Check if user exists in default users
        const defaultUsers: Record<string, any> = {
          'admin': { password: '1234', role: 'admin', displayName: 'Administrador del Sistema', activeCourses: [], email: 'admin@smartstudent.com' },
          'felipe': { password: '1234', role: 'student', displayName: 'Felipe Estudiante', activeCourses: ['8vo Básico'], email: 'felipe@student.com' },
          'jorge': { password: '1234', role: 'teacher', displayName: 'Jorge Profesor', activeCourses: ['8vo Básico', '1ro Medio'], email: 'jorge@teacher.com' }
        };

        const defaultUser = defaultUsers[username];
        if (defaultUser) {
          const newUser = {
            username: username,
            password: newPassword,
            role: defaultUser.role,
            displayName: defaultUser.displayName,
            activeCourses: defaultUser.activeCourses,
            email: defaultUser.email
          };
          
          users.push(newUser);
          localStorage.setItem('smart-student-users', JSON.stringify(users));
        } else {
          throw new Error(`Usuario ${username} no encontrado`);
        }
      }

      console.log(`Contraseña actualizada para usuario: ${username}`);
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          {translate('statusPending')}
        </Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
          <Check className="w-3 h-3 mr-1" />
          {translate('statusApproved')}
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
          <X className="w-3 h-3 mr-1" />
          {translate('statusRejected')}
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show loading or redirect if not admin
  if (!user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate('passwordRequestsTitle')}</h1>
          <p className="text-muted-foreground">{translate('passwordRequestsDescription')}</p>
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {translate('passwordRequestsList')}
          </CardTitle>
          <CardDescription>
            {translate('passwordRequestsListDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {translate('noPasswordRequests')}
              </h3>
              <p className="text-muted-foreground">
                {translate('noPasswordRequestsDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{translate('requestUser')}</TableHead>
                    <TableHead>{translate('requestEmail')}</TableHead>
                    <TableHead>{translate('requestReason')}</TableHead>
                    <TableHead>{translate('requestStatus')}</TableHead>
                    <TableHead>{translate('requestDate')}</TableHead>
                    <TableHead>{translate('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{request.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {request.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessRequest(request, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {translate('approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessRequest(request, 'reject')}
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {translate('reject')}
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <span className="text-sm text-muted-foreground">
                            {translate('processed')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Request Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {translate('approvePasswordRequest')}
            </DialogTitle>
            <DialogDescription>
              {translate('approvePasswordRequestDescription', { username: selectedRequest?.username })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info */}
            {selectedRequest && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedRequest.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{selectedRequest.email}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>{translate('reason')}:</strong> {selectedRequest.reason}
                </div>
              </div>
            )}

            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{translate('newPasswordForUser')}</Label>
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={translate('enterNewPassword')}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                {translate('newPasswordHint')}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProcessDialog(false)}
              disabled={isProcessing}
            >
              {translate('cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => selectedRequest && processRequest(selectedRequest, 'approve', newPassword)}
              disabled={isProcessing || !newPassword.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {translate('processing')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {translate('approveAndChangePassword')}
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
