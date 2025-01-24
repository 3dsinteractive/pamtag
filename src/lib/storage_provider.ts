// Base class interface for storage providers
export class IStorageProvider {
  setLocalStorage(key: string, value: string): void | Promise<void> {
    throw new Error("Method not implemented.");
  }

  getLocalStorage(key: string): string | null | Promise<string | null> {
    throw new Error("Method not implemented.");
  }

  deleteLocalStorage(key: string): void | Promise<void> {
    throw new Error("Method not implemented.");
  }

  setCookie(name: string, value: string, hours?: number): void | Promise<void> {
    throw new Error("Method not implemented.");
  }

  getCookie(name: string): string | null | Promise<string | null> {
    throw new Error("Method not implemented.");
  }

  deleteCookie(name: string): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}

// Implementation for Browser-based storage
export class BrowserStorageProvider extends IStorageProvider {
  // LocalStorage methods
  setLocalStorage(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  getLocalStorage(key: string): string {
    return window.localStorage.getItem(key);
  }

  deleteLocalStorage(key: string): void {
    window.localStorage.removeItem(key);
  }

  // Cookie methods
  setCookie(name: string, value: string, hours: number = 24): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires.toUTCString()}; path=/`;
  }

  getCookie(name: string): string | null {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
}
