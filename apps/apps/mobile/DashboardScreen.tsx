import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../lib/apiClient';
import { offlineSyncEngine } from '../lib/offlineSync';

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  pendingBudgets: number;
  activeProjects: number;
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState(offlineSyncEngine.getSyncStatus());

  useEffect(() => {
    loadDashboardData();

    // Set up interval to check sync status
    const interval = setInterval(() => {
      setSyncStatus(offlineSyncEngine.getSyncStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const workspaceId = await AsyncStorage.getItem('workspaceId');
      if (!workspaceId) return;

      const response = await apiClient.get(`/api/trpc/analytics.getDashboard?workspaceId=${workspaceId}`);

      if (response.data) {
        setData(response.data as DashboardData);
        setIsOffline(response.offline || false);
      }
    } catch (error) {
      console.error('[Dashboard] Load error:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
      >
        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>📡 Working Offline</Text>
          </View>
        )}

        {/* Sync Status */}
        {syncStatus.pendingChanges > 0 && (
          <View style={styles.syncBanner}>
            <Text style={styles.syncBannerText}>
              {syncStatus.pendingChanges} pending change{syncStatus.pendingChanges !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Balance Card */}
        {data && (
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total Balance</Text>
              <Text style={styles.cardValue}>
                ${data.totalBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* Income & Expense Row */}
            <View style={styles.row}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Monthly Income</Text>
                <Text style={[styles.cardValue, styles.incomeText]}>
                  +${data.monthlyIncome.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Monthly Expense</Text>
                <Text style={[styles.cardValue, styles.expenseText]}>
                  -${data.monthlyExpense.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.row}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Pending Budgets</Text>
                <Text style={styles.cardValue}>{data.pendingBudgets}</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>Active Projects</Text>
                <Text style={styles.cardValue}>{data.activeProjects}</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>+ Add Transaction</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📊 View Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  syncBanner: {
    backgroundColor: '#dbeafe',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  syncBannerText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
