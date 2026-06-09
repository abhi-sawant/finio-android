import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

export default function VerifyOtp() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) router.replace('/register');
  }, [email]);

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter the full 6-digit OTP');
    setLoading(true);
    try {
      const result = await api.verifyOtp(email, code);
      setAuth(result.token, result.user);
      toast.success('Email verified successfully!');
      router.replace('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.resendOtp(email);
      toast.success('New OTP sent to your email');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreen title="Verify Your Email" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <OtpInput value={otp} onChange={setOtp} />
      <Button title={loading ? 'Verifying…' : 'Verify'} onPress={handleSubmit} loading={loading} />
      <Button
        title={resending ? 'Sending…' : "Didn't receive the code? Resend"}
        variant="ghost"
        onPress={handleResend}
        loading={resending}
      />
    </AuthScreen>
  );
}
