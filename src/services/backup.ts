import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from './api';
import { shareTextFile } from '@/lib/files';
import type { FinanceStore } from '@/types';

type BackupPayload = Pick<
  FinanceStore,
  'accounts' | 'transactions' | 'categories' | 'labels' | 'budgets' | 'recurring' | 'settings'
>;

let backupInProgress = false;

export async function uploadBackup(): Promise<string> {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error('Not signed in');

  const { accounts, transactions, categories, labels, budgets, recurring, settings } =
    useFinanceStore.getState();
  const payload: BackupPayload = {
    accounts,
    transactions,
    categories,
    labels,
    budgets,
    recurring,
    settings,
  };
  await api.uploadBackup(token, payload);

  const now = new Date().toISOString();
  useAuthStore.getState().setLastBackupAt(now);
  return now;
}

export async function restoreLatestBackup(): Promise<void> {
  const { token } = useAuthStore.getState();
  if (!token) throw new Error('Not signed in');
  const res = await api.getLatestBackup(token);
  useFinanceStore.getState().importData(res as Partial<BackupPayload>);
}

/** Serialize the full vault to a JSON string (used by manual + auto local backup). */
export function serializeVault(): string {
  const { accounts, transactions, categories, labels, budgets, recurring, settings } =
    useFinanceStore.getState();
  const data = { accounts, transactions, categories, labels, budgets, recurring, settings };
  return JSON.stringify(data, null, 2);
}

/** Manually export the vault to a JSON file and open the share sheet. */
export async function exportVaultToFile(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await shareTextFile(`finio-backup-${today}.json`, serializeVault(), 'application/json');
}

export async function autoLocalBackupIfNeeded(): Promise<void> {
  const { token } = useAuthStore.getState();
  if (token) return; // logged-in users use cloud backup instead

  const { accounts, transactions, budgets, recurring, settings, lastLocalBackupAt, setLastLocalBackupAt } =
    useFinanceStore.getState();

  if (!settings.autoLocalBackup) return;

  if (
    accounts.length === 0 &&
    transactions.length === 0 &&
    budgets.length === 0 &&
    recurring.length === 0
  )
    return;

  const today = new Date().toISOString().slice(0, 10);
  if (lastLocalBackupAt === today) return;

  try {
    await shareTextFile(`finio-backup-${today}.json`, serializeVault(), 'application/json');
    setLastLocalBackupAt(today);
  } catch {
    /* silent failure — backup is best-effort */
  }
}

export async function autoBackupIfNeeded(): Promise<void> {
  if (backupInProgress) return;

  const { token, lastBackupAt } = useAuthStore.getState();
  if (!token) return;

  const { accounts, transactions, budgets, recurring } = useFinanceStore.getState();
  if (
    accounts.length === 0 &&
    transactions.length === 0 &&
    budgets.length === 0 &&
    recurring.length === 0
  )
    return;

  if (!lastBackupAt) {
    backupInProgress = true;
    try {
      await uploadBackup();
    } finally {
      backupInProgress = false;
    }
    return;
  }

  const hoursSinceLast = (Date.now() - new Date(lastBackupAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceLast >= 24) {
    backupInProgress = true;
    try {
      await uploadBackup();
    } finally {
      backupInProgress = false;
    }
  }
}
