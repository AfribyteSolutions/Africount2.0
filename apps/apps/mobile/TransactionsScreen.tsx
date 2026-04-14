import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { apiClient } from '../lib/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const workspaceId = await AsyncStorage.getItem('workspaceId');
      const response = await apiClient.get(`/api/trpc/transaction.list?workspaceId=${workspaceId}`);
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('[Transactions] Load error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadTransactions} />}
        renderItem={({ item }: any) => (
          <View style={styles.transactionItem}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>
              {item.type === 'income' ? '+' : '-'}${item.amount}
            </Text>
          </View>
        )}
        keyExtractor={(item: any) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  description: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  amount: { fontSize: 14, fontWeight: '600' },
  income: { color: '#16a34a' },
  expense: { color: '#dc2626' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
});
