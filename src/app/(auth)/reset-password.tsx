import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { api } from '@/services/api';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { OtpInput } from '@/components/ui/OtpInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ResetPassword() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const colors = useThemeColors();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) router.replace('/forgot-password');
  }, [email]);

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter the full 6-digit OTP');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.resetPassword(email, code, password);
      toast.success('Password reset successfully! Please sign in.');
      router.replace('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen title="Reset Password" subtitle={`Enter the OTP sent to ${email} and your new password.`}>
      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">OTP Code</Text>
        <OtpInput value={otp} onChange={setOtp} />
      </View>
      <View>
        <Text className="mb-1.5 text-sm font-medium text-foreground">New Password</Text>
        <Input
          placeholder="Min 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 top-9" hitSlop={8}>
          {showPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
        </Pressable>
      </View>
      <Button title={loading ? 'Resetting…' : 'Reset Password'} onPress={handleSubmit} loading={loading} />
    </AuthScreen>
  );
}
