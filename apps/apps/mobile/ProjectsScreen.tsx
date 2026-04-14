import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ProjectsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.placeholder}>Project management coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  placeholder: { marginTop: 8, color: '#9ca3af' },
});
