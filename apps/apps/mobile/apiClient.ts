import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineSyncEngine } from './offlineSync';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  offline?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private isOnline: boolean = true;

  constructor(baseUrl: string = 'https://api.africount.local') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      // Try to fetch from server if online
      if (this.isOnline) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
          ...options,
        });

        if (response.ok) {
          const data = await response.json();
          return { data };
        }
      }

      // Fall back to cached data if offline or request fails
      const entity = this.extractEntity(endpoint);
      const cached = await offlineSyncEngine.getCachedData(entity);
      
      if (cached.length > 0) {
        return { data: cached as T, offline: true };
      }

      return { error: 'No data available offline' };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMsg, offline: !this.isOnline };
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      // If online, send to server
      if (this.isOnline) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
          ...options,
        });

        if (response.ok) {
          const data = await response.json();
          return { data };
        }
      }

      // Queue for sync if offline
      const entity = this.extractEntity(endpoint);
      const operation = endpoint.includes('create') ? 'create' : 'update';
      await offlineSyncEngine.queueOperation(operation, entity, body);

      return {
        data: { queued: true } as T,
        offline: true,
      };
    } catch (error) {
      // Queue for sync on error
      const entity = this.extractEntity(endpoint);
      const operation = endpoint.includes('create') ? 'create' : 'update';
      await offlineSyncEngine.queueOperation(operation, entity, body);

      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMsg, offline: true };
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      if (this.isOnline) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
          ...options,
        });

        if (response.ok) {
          const data = await response.json();
          return { data };
        }
      }

      const entity = this.extractEntity(endpoint);
      await offlineSyncEngine.queueOperation('update', entity, body);

      return { data: { queued: true } as T, offline: true };
    } catch (error) {
      const entity = this.extractEntity(endpoint);
      await offlineSyncEngine.queueOperation('update', entity, body);

      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMsg, offline: true };
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      if (this.isOnline) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
          ...options,
        });

        if (response.ok) {
          const data = await response.json();
          return { data };
        }
      }

      const entity = this.extractEntity(endpoint);
      await offlineSyncEngine.queueOperation('delete', entity, {});

      return { data: { queued: true } as T, offline: true };
    } catch (error) {
      const entity = this.extractEntity(endpoint);
      await offlineSyncEngine.queueOperation('delete', entity, {});

      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMsg, offline: true };
    }
  }

  /**
   * Sync pending changes with backend
   */
  async syncPendingChanges(): Promise<boolean> {
    try {
      if (!this.isOnline) {
        return false;
      }

      await offlineSyncEngine.syncWithBackend(this);
      return true;
    } catch (error) {
      console.error('[ApiClient] Sync error:', error);
      return false;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return offlineSyncEngine.getSyncStatus();
  }

  /**
   * Get headers for requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Extract entity name from endpoint
   */
  private extractEntity(endpoint: string): string {
    const parts = endpoint.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
}

export const apiClient = new ApiClient();
