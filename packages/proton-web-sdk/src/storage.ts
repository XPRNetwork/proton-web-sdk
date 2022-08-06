import type { LinkStorage } from "@proton/link"

export class Storage implements LinkStorage {
  constructor(readonly keyPrefix: string) { }

  async write(key: string, data: string): Promise<void> {
    localStorage.setItem(this.storageKey(key), data)
  }

  async read(key: string): Promise<string | null> {
    return localStorage.getItem(this.storageKey(key))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.storageKey(key))
  }

  storageKey(key: string) {
    return `${this.keyPrefix}-${key}`
  }
}
