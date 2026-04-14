import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { apiClient } from '../lib/apiClient';
import { offlineSyncEngine } from '../lib/offlineSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  localId?: string;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const workspaceId = await AsyncStorage.getItem('workspaceId');
      if (!workspaceId) return;

      // Try to get from API
      const response = await apiClient.get(
        `/api/trpc/transaction.list?workspaceId=${workspaceId}`
      );

      if (response.data) {
        setTransactions(Array.isArray(response.data) ? response.data : []);
      } else {
        // Fall back to cached data
        const cached = await offlineSyncEngine.getCachedData('transactions');
        setTransactions(cached);
      }
    } catch (error) {
      console.error('[Transactions] Load error:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!formData.description || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const workspaceId = await AsyncStorage.getItem('workspaceId');
      const newTransaction: Transaction = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        localId: `local_${Date.now()}`,
      };

      // Add to local state immediately
      setTransactions([newTransaction, ...transactions]);

      // Queue for sync
      await offlineSyncEngine.queueOperation('create', 'transaction', {
        workspaceId,
        ...newTransaction,
      });

      // Reset form
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
      });

      setShowAddModal(false);
      Alert.alert('Success', 'Transaction recorded and queued for sync');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = (id: number) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setTransactions(transactions.filter(t => t.id !== id));
          await offlineSyncEngine.queueOperation('delete', 'transaction', { id });
        },
      },
    ]);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.transactionActions}>
        <Text style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={loadTransactions} />
        }
        renderItem={renderTransaction}
        keyExtractor={(item) => (item.localId || item.id).toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add one</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Office supplies"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={formData.amount}
                  onChangeText={(text) =>
                    setFormData({ ...formData, amount: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'expense' && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'expense' })}
                  >
                    <Text style={styles.typeButtonText}>Expense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'income' && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'income' })}
                  >
                    <Text style={styles.typeButtonText}>Income</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Office, Travel"
                  value={formData.category}
                  onChangeText={(text) =>
                    setFormData({ ...formData, category: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, date: text })
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddTransaction}
              >
                <Text style={styles.submitButtonText}>Save Transaction</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  transactionInfo: { flex: 1 },
  description: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  category: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  date: { fontSize: 11, color: '#d1d5db', marginTop: 2 },
  transactionActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount: { fontSize: 14, fontWeight: '600' },
  income: { color: '#16a34a' },
  expense: { color: '#dc2626' },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: '#d1d5db', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalContent: { flex: 1, paddingHorizontal: 16 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: { fontSize: 24, color: '#6b7280' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  form: { paddingVertical: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  typeButtons: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeButtonText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
