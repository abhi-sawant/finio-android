import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';

const labelColors = [
  '#6C63FF', '#ef4444', '#f97316', '#fb923c', '#f59e0b', '#fbbf24',
  '#84cc16', '#22c55e', '#10b981', '#34d399', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#60a5fa', '#3b82f6', '#8b5cf6', '#a78bfa', '#d946ef',
  '#ec4899', '#f472b6', '#64748b', '#94a3b8', '#78716c', '#6b7280',
];

export default function ManageLabels() {
  const labels = useFinanceStore((s) => s.labels);
  const addLabel = useFinanceStore((s) => s.addLabel);
  const updateLabel = useFinanceStore((s) => s.updateLabel);
  const deleteLabel = useFinanceStore((s) => s.deleteLabel);
  const colors = useThemeColors();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(labelColors[0]);

  const resetForm = () => {
    setOpen(false);
    setEditId(null);
    setName('');
    setColor(labelColors[0]);
  };

  const handleEdit = (id: string) => {
    const label = labels.find((l) => l.id === id);
    if (!label) return;
    setEditId(id);
    setName(label.name);
    setColor(label.color);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editId) updateLabel(editId, { name: name.trim(), color });
    else addLabel({ name: name.trim(), color });
    resetForm();
  };

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title="Labels"
        back
        right={
          <Pressable
            onPress={() => {
              resetForm();
              setOpen(true);
            }}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center">
            <Plus size={20} color={colors.primary} />
          </Pressable>
        }
      />

      <View className="gap-2">
        {labels.map((label) => (
          <View
            key={label.id}
            className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
            <View className="flex-row items-center gap-3">
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: label.color }} />
              <Text className="text-sm font-medium text-foreground">{label.name}</Text>
            </View>
            <View className="flex-row gap-1">
              <Pressable onPress={() => handleEdit(label.id)} hitSlop={6} className="h-8 w-8 items-center justify-center">
                <Pencil size={14} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (await confirm(`Delete "${label.name}"?`, { destructive: true, confirmLabel: 'Delete' }))
                    deleteLabel(label.id);
                }}
                hitSlop={6}
                className="h-8 w-8 items-center justify-center">
                <Trash2 size={14} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        ))}
        {labels.length === 0 ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            No labels yet. Add one to tag your transactions.
          </Text>
        ) : null}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={resetForm}>
        <Pressable className="flex-1 justify-center bg-black/50 px-4" onPress={resetForm}>
          <Pressable className="gap-3 rounded-2xl bg-card p-4" onPress={() => {}}>
            <Text className="text-base font-semibold text-foreground">
              {editId ? 'Edit Label' : 'Add Label'}
            </Text>
            <Input placeholder="Label name" value={name} onChangeText={setName} />
            <View className="flex-row flex-wrap gap-2">
              {labelColors.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: c,
                    borderWidth: color === c ? 2 : 0,
                    borderColor: colors.foreground,
                  }}
                />
              ))}
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button title={editId ? 'Update' : 'Add'} onPress={handleSubmit} />
              </View>
              <Button title="Cancel" variant="secondary" fullWidth={false} onPress={resetForm} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
