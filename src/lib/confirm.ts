import { Alert } from 'react-native';

/** Promise-based confirm dialog (RN has no global confirm()). */
export function confirm(
  message: string,
  { title = 'Confirm', confirmLabel = 'OK', destructive = false }: {
    title?: string;
    confirmLabel?: string;
    destructive?: boolean;
  } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
