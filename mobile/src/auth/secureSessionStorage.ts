import * as SecureStore from 'expo-secure-store';
import { createChunkedStorage } from './chunkedStorage';

export const secureSessionStorage = createChunkedStorage({
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
});
