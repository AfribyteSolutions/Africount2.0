import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineSyncEngine } from './lib/offlineSync';
import { apiClient } from './lib/apiClient';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetsScreen from './screens/BudgetsScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SyncStatusScreen from './screens/SyncStatusScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          tabBarLabel: 'Transactions',
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          title: 'Budgets',
          tabBarLabel: 'Budgets',
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Initialize offline sync engine
        await offlineSyncEngine.initialize();

        // Check for existing token
        const token = await AsyncStorage.getItem('authToken');
        const workspaceId = await AsyncStorage.getItem('workspaceId');

        if (token && workspaceId) {
          apiClient.setToken(token);
          setIsSignedIn(true);

          // Try to sync pending changes
          const isOnline = await checkConnectivity();
          apiClient.setOnlineStatus(isOnline);

          if (isOnline) {
            await apiClient.syncPendingChanges();
          }
        }
      } catch (error) {
        console.error('[App] Bootstrap error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {isSignedIn ? (
          <Stack.Screen
            name="MainApp"
            component={DashboardTabs}
            options={{
              animationEnabled: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={LoginScreen}
            options={{
              animationEnabled: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Check network connectivity
 */
async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}
