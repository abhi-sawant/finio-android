import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { api } from '@/services/api';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function Register() {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.register(name, email, password);
      toast.success('Account created! Check your email for the OTP.');
      router.push({ pathname: '/verify-otp', params: { email } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={<Text className="text-4xl font-extrabold text-primary">Finio</Text>}
      subtitle="Create your account">
      <Input placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <View>
        <Input
          placeholder="Password (min 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 top-3" hitSlop={8}>
          {showPassword ? <EyeOff size={20} color={colors.mutedForeground} /> : <Eye size={20} color={colors.mutedForeground} />}
        </Pressable>
      </View>
      <Button title={loading ? 'Creating account…' : 'Sign Up'} onPress={handleSubmit} loading={loading} />
      <View className="flex-row justify-center gap-1">
        <Text className="text-sm text-muted-foreground">Already have an account?</Text>
        <Link href="/login" className="text-sm font-medium text-primary">Sign in</Link>
      </View>
    </AuthScreen>
  );
}
