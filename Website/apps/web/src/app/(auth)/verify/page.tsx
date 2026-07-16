'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';

const verifySchema = z.object({
  otp: z.string().length(6, 'OTP harus 6 digit'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      router.replace('/login');
    } else if (user.emailVerified) {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: VerifyFormValues) => {
    if (!user?.email) return;
    
    setError('');
    try {
      await api.post('/auth/verify-otp', {
        email: user.email,
        otp: data.otp,
      });
      
      updateUser({ emailVerified: true });
      router.push('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || 'Terjadi kesalahan. Coba lagi.'
      );
    }
  };

  if (!user || user.emailVerified) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Verifikasi Email</CardTitle>
          <CardDescription>
            Masukkan 6 digit kode OTP yang telah dikirim ke <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-error-light/50 p-3 text-sm text-error">
                {error}
              </div>
            )}
            
            <div className="space-y-2 text-center">
              <Label htmlFor="otp" className="sr-only">Kode OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
                {...register('otp')}
              />
              {errors.otp && (
                <p className="text-sm text-error">{errors.otp.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Verifikasi'
              )}
            </Button>
            <div className="text-center text-sm text-muted">
              Belum menerima kode?{' '}
              <button 
                type="button" 
                className="font-medium text-primary hover:underline"
                onClick={() => {
                  // TODO: Implement resend OTP if needed
                  alert('Fitur kirim ulang akan segera hadir.');
                }}
              >
                Kirim ulang
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}