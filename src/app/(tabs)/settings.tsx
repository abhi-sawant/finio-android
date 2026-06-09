import { useState, type ReactNode } from 'react';
import {
  ChevronRight,
  User,
  Palette,
  Tag,
  FolderOpen,
  Download,
  Upload,
  RotateCcw,
  LogIn,
  LogOut,
  Cloud,
  CloudUpload,
  Target,
  Repeat,
  HardDrive,
} from 'lucide-react-native';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { uploadBackup, restoreLatestBackup, exportVaultToFile } from '@/services/backup';
import { api } from '@/services/api';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GradientView } from '@/components/ui/GradientView';
import { toast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';
import { glowShadow } from '@/lib/gradients';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Currency, Theme } from '@/types';

const currencySymbols: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$',
};

const currencies: { value: Currency; label: string }[] = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
];

const themes: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function Row({
  icon,
  label,
  onPress,
  right,
  danger,
  disabled,
  subtitle,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  subtitle?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row items-center gap-3 p-4 ${onPress ? 'active:bg-muted/50' : ''} ${disabled ? 'opacity-60' : ''}`}>
      {icon}
      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</Text>
        {subtitle ? <Text className="text-xs text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

const Divider = () => <View className="h-px bg-border" />;

export default function Settings() {
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const resetToDefaults = useFinanceStore((s) => s.resetToDefaults);
  const importData = useFinanceStore((s) => s.importData);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const lastBackupAt = useAuthStore((s) => s.lastBackupAt);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const colors = useThemeColors();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(settings.userName);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleExport = async () => {
    try {
      await exportVaultToFile();
      toast.success('Backup exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
      const text = await new File(res.assets[0].uri).text();
      const parsed = JSON.parse(text);
      const hasAny =
        Array.isArray(parsed.accounts) ||
        Array.isArray(parsed.transactions) ||
        Array.isArray(parsed.categories) ||
        Array.isArray(parsed.labels) ||
        Array.isArray(parsed.budgets) ||
        Array.isArray(parsed.recurring) ||
        (parsed.settings && typeof parsed.settings === 'object');
      if (!hasAny) throw new Error('Empty');
      if (!(await confirm('Import will replace your current data. Continue?', { confirmLabel: 'Import' }))) return;
      importData(parsed);
      toast.success('Data imported');
    } catch {
      toast.error('Invalid backup file');
    }
  };

  const handleReset = async () => {
    if (await confirm('Reset all data to defaults? This cannot be undone.', { destructive: true, confirmLabel: 'Reset' })) {
      resetToDefaults();
      toast.success('Reset complete');
    }
  };

  const handleCloudBackup = async () => {
    setBackingUp(true);
    try {
      await uploadBackup();
      toast.success('Backup uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!(await confirm('Restore from cloud backup? This will replace your current data.', { confirmLabel: 'Restore' }))) return;
    setRestoring(true);
    try {
      await restoreLatestBackup();
      toast.success('Data restored from cloud backup');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setRestoring(false);
    }
  };

  const handleNameSave = async (newName: string) => {
    const trimmed = newName.trim() || 'User';
    updateSettings({ userName: trimmed });
    setEditingName(false);
    if (token) {
      try {
        const r = await api.updateProfile(token, { name: trimmed });
        setAuth(r.token, r.user);
      } catch {
        /* local save succeeded; backend sync failed silently */
      }
    }
  };

  const handleLogout = async () => {
    if (await confirm('Sign out of your account?', { confirmLabel: 'Sign Out', destructive: true })) {
      clearAuth();
      toast.success('Signed out');
    }
  };

  const mutedIcon = (Icon: typeof User) => <Icon size={18} color={colors.mutedForeground} />;

  return (
    <ScreenContainer bottomInset={96}>
      <Header title="Settings" />

      {/* Account */}
      <Card className="overflow-hidden p-0">
        {token && user ? (
          <>
            <View className="flex-row items-center gap-3 p-4">
              <GradientView name="primary" style={[{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, glowShadow.primary]}>
                <User size={18} color="#fff" />
              </GradientView>
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium text-foreground">{user.name}</Text>
                <Text className="text-xs text-muted-foreground">{user.email}</Text>
              </View>
            </View>
            <Divider />
            <Row icon={<LogOut size={18} color={colors.destructive} />} label="Sign Out" danger onPress={handleLogout} />
          </>
        ) : (
          <Row
            icon={
              <GradientView name="primary" style={[{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, glowShadow.primary]}>
                <LogIn size={16} color="#fff" />
              </GradientView>
            }
            label="Sign In"
            subtitle="Sync your data across devices"
            onPress={() => router.push('/login')}
            right={<ChevronRight size={16} color={colors.mutedForeground} />}
          />
        )}
      </Card>

      {/* Cloud backup */}
      {token ? (
        <Card className="overflow-hidden p-0">
          <Row
            icon={<CloudUpload size={18} color={colors.mutedForeground} />}
            label={backingUp ? 'Backing up…' : 'Backup to Cloud'}
            subtitle={lastBackupAt ? `Last: ${new Date(lastBackupAt).toLocaleString()}` : undefined}
            disabled={backingUp}
            onPress={handleCloudBackup}
          />
          <Divider />
          <Row
            icon={<Cloud size={18} color={colors.mutedForeground} />}
            label={restoring ? 'Restoring…' : 'Restore from Cloud'}
            disabled={restoring}
            onPress={handleCloudRestore}
          />
        </Card>
      ) : null}

      {/* Profile name */}
      <Card className="p-0">
        <View className="flex-row items-center gap-3 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary + '22' }}>
            <User size={18} color={colors.primary} />
          </View>
          {editingName ? (
            <View className="flex-1">
              <Input
                autoFocus
                value={nameValue}
                onChangeText={setNameValue}
                onBlur={() => handleNameSave(nameValue)}
                onSubmitEditing={() => handleNameSave(nameValue)}
                returnKeyType="done"
              />
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} className="flex-1">
              <Text className="text-sm font-medium text-foreground">{settings.userName}</Text>
              <Text className="text-xs text-muted-foreground">Tap to edit name</Text>
            </Pressable>
          )}
        </View>
      </Card>

      {/* Preferences */}
      <Card className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text className="text-lg text-foreground">{currencySymbols[settings.currency]}</Text>
            <Text className="text-sm font-medium text-foreground">Currency</Text>
          </View>
          <View style={{ minWidth: 120 }}>
            <Select
              value={settings.currency}
              options={currencies.map((c) => ({ label: c.label, value: c.value }))}
              onChange={(v) => updateSettings({ currency: v })}
            />
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Palette size={18} color={colors.mutedForeground} />
            <Text className="text-sm font-medium text-foreground">Theme</Text>
          </View>
          <View style={{ minWidth: 120 }}>
            <Select
              value={settings.theme}
              options={themes.map((t) => ({ label: t.label, value: t.value }))}
              onChange={(v) => updateSettings({ theme: v })}
            />
          </View>
        </View>
      </Card>

      {/* Manage */}
      <Card className="overflow-hidden p-0">
        <Row icon={mutedIcon(Target)} label="Budgets" onPress={() => router.push('/budgets')} right={<ChevronRight size={16} color={colors.mutedForeground} />} />
        <Divider />
        <Row icon={mutedIcon(Repeat)} label="Recurring Transactions" onPress={() => router.push('/recurring')} right={<ChevronRight size={16} color={colors.mutedForeground} />} />
        <Divider />
        <Row icon={mutedIcon(FolderOpen)} label="Manage Categories" onPress={() => router.push('/manage-categories')} right={<ChevronRight size={16} color={colors.mutedForeground} />} />
        <Divider />
        <Row icon={mutedIcon(Tag)} label="Manage Labels" onPress={() => router.push('/manage-labels')} right={<ChevronRight size={16} color={colors.mutedForeground} />} />
      </Card>

      {/* Data */}
      <Card className="overflow-hidden p-0">
        {!token ? (
          <>
            <Row
              icon={<HardDrive size={18} color={colors.mutedForeground} />}
              label="Auto-download daily backup"
              subtitle="Share a backup JSON once per day when the app opens"
              right={
                <Switch
                  value={settings.autoLocalBackup}
                  onValueChange={(v) => updateSettings({ autoLocalBackup: v })}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <Divider />
          </>
        ) : null}
        <Row icon={mutedIcon(Download)} label="Export Data (JSON)" onPress={handleExport} />
        <Divider />
        <Row icon={mutedIcon(Upload)} label="Import Data" onPress={handleImport} />
        <Divider />
        <Row icon={<RotateCcw size={18} color={colors.destructive} />} label="Reset to Defaults" danger onPress={handleReset} />
      </Card>

      <Text className="pt-2 text-center text-[11px] text-muted-foreground">Finio · Personal Finance</Text>
    </ScreenContainer>
  );
}
