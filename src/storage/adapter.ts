export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const localStorageAdapter: StorageAdapter = {
  getItem(key) {
    return window.localStorage.getItem(key)
  },
  setItem(key, value) {
    window.localStorage.setItem(key, value)
  },
  removeItem(key) {
    window.localStorage.removeItem(key)
  },
}

export function createLocalStorageAdapter(): StorageAdapter {
  return localStorageAdapter
}

export function createMemoryAdapter(): StorageAdapter {
  const store = new Map<string, string>()
  return {
    getItem(key) {
      return store.get(key) ?? null
    },
    setItem(key, value) {
      store.set(key, value)
    },
    removeItem(key) {
      store.delete(key)
    },
  }
}