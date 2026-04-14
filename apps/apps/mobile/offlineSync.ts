import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

/**
 * Offline-First Sync Engine for Africount Mobile
 * Handles local data caching, conflict resolution, and sync with backend
 */

export interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, any>;
  timestamp: number;
  synced: boolean;
  retries: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  syncErrors: string[];
}

class OfflineSyncEngine {
  private db: SQLite.SQLiteDatabase | null = null;
  private syncQueue: SyncQueue[] = [];
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
    syncErrors: [],
  };

  /**
   * Initialize the offline sync engine
   */
  async initialize(): Promise<void> {
    try {
      // Open SQLite database
      this.db = await SQLite.openDatabaseAsync('africount.db');
      
      // Create sync queue table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          operation TEXT NOT NULL,
          entity TEXT NOT NULL,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          synced INTEGER DEFAULT 0,
          retries INTEGER DEFAULT 0
        );
      `);

      // Create cache tables for each entity
      await this.createCacheTables();

      // Load sync queue from storage
      await this.loadSyncQueue();

      console.log('[OfflineSync] Engine initialized successfully');
    } catch (error) {
      console.error('[OfflineSync] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Create cache tables for different entities
   */
  private async createCacheTables(): Promise<void> {
    if (!this.db) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS transactions_cache (
        id INTEGER PRIMARY KEY,
        workspaceId INTEGER NOT NULL,
        projectId INTEGER,
        amount REAL NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncedAt TEXT,
        localId TEXT UNIQUE
      );`,
      
      `CREATE TABLE IF NOT EXISTS budgets_cache (
        id INTEGER PRIMARY KEY,
        workspaceId INTEGER NOT NULL,
        projectId INTEGER,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        createdAt TEXT NOT NULL,
        syncedAt TEXT,
        localId TEXT UNIQUE
      );`,

      `CREATE TABLE IF NOT EXISTS projects_cache (
        id INTEGER PRIMARY KEY,
        workspaceId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        budget REAL,
        spent REAL DEFAULT 0,
        createdAt TEXT NOT NULL,
        syncedAt TEXT,
        localId TEXT UNIQUE
      );`,

      `CREATE TABLE IF NOT EXISTS sync_metadata (
        entity TEXT PRIMARY KEY,
        lastSyncTime INTEGER,
        totalRecords INTEGER
      );`,
    ];

    for (const table of tables) {
      try {
        await this.db.execAsync(table);
      } catch (error) {
        console.error('[OfflineSync] Error creating table:', error);
      }
    }
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(
    operation: 'create' | 'update' | 'delete',
    entity: string,
    data: Record<string, any>
  ): Promise<string> {
    const id = `${entity}_${Date.now()}_${Math.random()}`;
    const queueItem: SyncQueue = {
      id,
      operation,
      entity,
      data,
      timestamp: Date.now(),
      synced: false,
      retries: 0,
    };

    this.syncQueue.push(queueItem);
    this.syncStatus.pendingChanges = this.syncQueue.filter(q => !q.synced).length;

    // Persist to database
    if (this.db) {
      await this.db.runAsync(
        `INSERT INTO sync_queue (id, operation, entity, data, timestamp, synced, retries)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, operation, entity, JSON.stringify(data), queueItem.timestamp, 0, 0]
      );
    }

    return id;
  }

  /**
   * Sync pending changes with backend
   */
  async syncWithBackend(apiClient: any): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncErrors = [];

    try {
      const pendingItems = this.syncQueue.filter(q => !q.synced);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item, apiClient);
          item.synced = true;

          // Update database
          if (this.db) {
            await this.db.runAsync(
              `UPDATE sync_queue SET synced = 1 WHERE id = ?`,
              [item.id]
            );
          }
        } catch (error) {
          item.retries++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.syncStatus.syncErrors.push(`${item.entity}: ${errorMsg}`);

          // Stop after 3 retries
          if (item.retries >= 3) {
            item.synced = false; // Mark as failed
          }
        }
      }

      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.pendingChanges = this.syncQueue.filter(q => !q.synced).length;

      // Save sync status
      await this.saveSyncStatus();

      console.log('[OfflineSync] Sync completed successfully');
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : String(error));
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Sync individual item with backend
   */
  private async syncItem(item: SyncQueue, apiClient: any): Promise<void> {
    const endpoint = `/api/trpc/${item.entity}`;

    switch (item.operation) {
      case 'create':
        await apiClient.post(`${endpoint}.create`, item.data);
        break;
      case 'update':
        await apiClient.post(`${endpoint}.update`, item.data);
        break;
      case 'delete':
        await apiClient.post(`${endpoint}.delete`, { id: item.data.id });
        break;
    }
  }

  /**
   * Cache remote data locally
   */
  async cacheData(entity: string, data: any[]): Promise<void> {
    if (!this.db) return;

    try {
      const tableName = `${entity}_cache`;
      
      // Clear existing cache
      await this.db.runAsync(`DELETE FROM ${tableName}`);

      // Insert new data
      for (const record of data) {
        const columns = Object.keys(record).join(', ');
        const placeholders = Object.keys(record).map(() => '?').join(', ');
        const values = Object.values(record);

        await this.db.runAsync(
          `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
          values
        );
      }

      // Update metadata
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_metadata (entity, lastSyncTime, totalRecords)
         VALUES (?, ?, ?)`,
        [entity, Date.now(), data.length]
      );
    } catch (error) {
      console.error('[OfflineSync] Cache error:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(entity: string, filters?: Record<string, any>): Promise<any[]> {
    if (!this.db) return [];

    try {
      const tableName = `${entity}_cache`;
      let query = `SELECT * FROM ${tableName}`;
      const params: any[] = [];

      if (filters) {
        const conditions = Object.entries(filters).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const results = await this.db.getAllAsync(query, params);
      return results || [];
    } catch (error) {
      console.error('[OfflineSync] Get cached data error:', error);
      return [];
    }
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM sync_queue WHERE synced = 0`
      );

      this.syncQueue = (results || []).map((row: any) => ({
        id: row.id,
        operation: row.operation,
        entity: row.entity,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        synced: row.synced === 1,
        retries: row.retries,
      }));

      this.syncStatus.pendingChanges = this.syncQueue.length;
    } catch (error) {
      console.error('[OfflineSync] Load sync queue error:', error);
    }
  }

  /**
   * Save sync status to storage
   */
  private async saveSyncStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'syncStatus',
        JSON.stringify(this.syncStatus)
      );
    } catch (error) {
      console.error('[OfflineSync] Save sync status error:', error);
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.db) return;

    try {
      const tables = ['transactions_cache', 'budgets_cache', 'projects_cache'];
      for (const table of tables) {
        await this.db.runAsync(`DELETE FROM ${table}`);
      }
      console.log('[OfflineSync] Cache cleared');
    } catch (error) {
      console.error('[OfflineSync] Clear cache error:', error);
    }
  }

  /**
   * Get sync queue for debugging
   */
  getSyncQueue(): SyncQueue[] {
    return this.syncQueue;
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
