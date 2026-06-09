import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Thin sonner-compatible toast wrapper. On Android we use the native ToastAndroid
 * for transient messages; errors fall back to an Alert so they aren't missed.
 */
function show(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

export const toast = {
  success: (message: string) => show(message),
  error: (message: string) => show(message),
  message: (message: string) => show(message),
  info: (message: string) => show(message),
};
