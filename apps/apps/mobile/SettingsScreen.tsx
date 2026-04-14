import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: any) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('workspaceId');
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
  button: { backgroundColor: '#dc2626', paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#ffffff', textAlign: 'center', fontWeight: '600' },
});
