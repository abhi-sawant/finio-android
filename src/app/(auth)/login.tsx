import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const result = await api.login(email, password);
      setAuth(result.token, result.user);
      toast.success('Logged in successfully');
      router.replace('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={<Text className="text-4xl font-extrabold text-primary">Finio</Text>}
      subtitle="Sign in to your account">
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <View>
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 top-3" hitSlop={8}>
          {showPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
        </Pressable>
      </View>
      <Link href="/forgot-password" className="text-right text-sm text-primary">
        Forgot password?
      </Link>
      <Button title={loading ? 'Signing in…' : 'Sign In'} onPress={handleSubmit} loading={loading} />
      <View className="flex-row justify-center gap-1">
        <Text className="text-sm text-muted-foreground">Don&apos;t have an account?</Text>
        <Link href="/register" className="text-sm font-medium text-primary">Sign up</Link>
      </View>
      <Button title="Continue without account" variant="ghost" onPress={() => router.replace('/')} />
    </AuthScreen>
  );
}
