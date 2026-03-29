export class LocalStorageRepository<T> {
  private readonly storageKey: string
  private readonly fallbackValue: T

  constructor(
    storageKey: string,
    fallbackValue: T,
  ) {
    this.storageKey = storageKey
    this.fallbackValue = fallbackValue
  }

  read(): T {
    const rawValue = localStorage.getItem(this.storageKey)

    if (!rawValue) {
      return this.fallbackValue
    }

    try {
      return JSON.parse(rawValue) as T
    } catch {
      return this.fallbackValue
    }
  }

  write(value: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(value))
  }
}
