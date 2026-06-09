import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GradientView } from '@/components/ui/GradientView';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { CategoryType } from '@/types';

const categoryColors = [
  '#6C63FF', '#ef4444', '#f97316', '#fb923c', '#f59e0b', '#fbbf24',
  '#84cc16', '#22c55e', '#10b981', '#34d399', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#60a5fa', '#3b82f6', '#8b5cf6', '#a78bfa', '#d946ef',
  '#ec4899', '#f472b6', '#64748b', '#94a3b8', '#78716c', '#6b7280',
];

export default function ManageCategories() {
  const categories = useFinanceStore((s) => s.categories);
  const addCategory = useFinanceStore((s) => s.addCategory);
  const updateCategory = useFinanceStore((s) => s.updateCategory);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);
  const colors = useThemeColors();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [color, setColor] = useState(categoryColors[0]);
  const [icon, setIcon] = useState('circle-ellipsis');
  const [filter, setFilter] = useState<'all' | CategoryType>('all');

  const filtered =
    filter === 'all' ? categories : categories.filter((c) => c.type === filter || c.type === 'both');

  const resetForm = () => {
    setOpen(false);
    setEditId(null);
    setName('');
    setType('expense');
    setColor(categoryColors[0]);
    setIcon('circle-ellipsis');
  };

  const handleEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditId(id);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editId) updateCategory(editId, { name: name.trim(), type, color, icon });
    else addCategory({ name: name.trim(), type, color, icon });
    resetForm();
  };

  const Chip = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => {
    const inner = (
      <Text className={`text-xs font-medium capitalize ${active ? 'text-white' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    );
    return (
      <Pressable onPress={onPress}>
        {active ? (
          <GradientView name="primary" style={{ borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            {inner}
          </GradientView>
        ) : (
          <View className="rounded-lg bg-muted px-3 py-1.5">{inner}</View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title="Categories"
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

      <View className="flex-row gap-2">
        {(['all', 'expense', 'income', 'both'] as const).map((f) => (
          <Chip key={f} active={filter === f} label={f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <View className="gap-2">
        {filtered.map((cat) => (
          <View
            key={cat.id}
            className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: cat.color }}>
                <CategoryIcon icon={cat.icon} size={16} color="#fff" />
              </View>
              <View>
                <Text className="text-sm font-medium text-foreground">{cat.name}</Text>
                <Text className="text-xs capitalize text-muted-foreground">{cat.type}</Text>
              </View>
            </View>
            <View className="flex-row gap-1">
              <Pressable onPress={() => handleEdit(cat.id)} hitSlop={6} className="h-8 w-8 items-center justify-center">
                <Pencil size={14} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (await confirm(`Delete "${cat.name}"?`, { destructive: true, confirmLabel: 'Delete' }))
                    deleteCategory(cat.id);
                }}
                hitSlop={6}
                className="h-8 w-8 items-center justify-center">
                <Trash2 size={14} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={resetForm}>
        <Pressable className="flex-1 justify-center bg-black/50 px-4" onPress={resetForm}>
          <Pressable className="gap-3 rounded-2xl bg-card p-4" onPress={() => {}}>
            <Text className="text-base font-semibold text-foreground">
              {editId ? 'Edit Category' : 'Add Category'}
            </Text>
            <Input placeholder="Category name" value={name} onChangeText={setName} />
            <View className="flex-row gap-2">
              {(['expense', 'income', 'both'] as const).map((t) => (
                <Chip key={t} active={type === t} label={t} onPress={() => setType(t)} />
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {categoryColors.map((c) => (
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
