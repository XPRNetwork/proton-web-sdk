import AsyncStorage from '@react-native-community/async-storage';

import { LinkStorage } from '@proton/link';

class Storage implements LinkStorage {
  constructor(readonly keyPrefix: string) {}
  async write(key: string, data: string): Promise<void> {
    AsyncStorage.setItem(this.storageKey(key), data);
  }

  async read(key: string): Promise<string | null> {
    return AsyncStorage.getItem(this.storageKey(key));
  }

  async remove(key: string): Promise<void> {
    AsyncStorage.removeItem(this.storageKey(key));
  }

  storageKey(key: string) {
    return `${this.keyPrefix}-${key}`;
  }
}

export default Storage;
