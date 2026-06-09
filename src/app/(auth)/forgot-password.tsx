import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Text, View } from 'react-native';

import { api } from '@/services/api';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast.success('If an account exists, an OTP has been sent.');
      router.push({ pathname: '/reset-password', params: { email } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Forgot Password"
      subtitle="Enter your email and we'll send you an OTP to reset your password.">
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Button title={loading ? 'Sending…' : 'Send OTP'} onPress={handleSubmit} loading={loading} />
      <View className="flex-row justify-center gap-1">
        <Text className="text-sm text-muted-foreground">Remember your password?</Text>
        <Link href="/login" className="text-sm font-medium text-primary">Sign in</Link>
      </View>
    </AuthScreen>
  );
}
