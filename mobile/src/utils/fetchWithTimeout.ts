import { useAuthStore } from '../store/authStore';

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Wraps the standard fetch API with a timeout using AbortController.
 * @param url The URL to fetch.
 * @param options Fetch options.
 * @param timeoutMs Timeout in milliseconds (default: 15000ms).
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal as any,
    });

    if (response.status === 401) {
      // Global 401 Handling
      const authStore = useAuthStore.getState();
      if (authStore.isLoggedIn) {
        authStore.logout();
      }
      throw new AuthError('Session expired. Please log in again.');
    }

    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request to ${url} timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
