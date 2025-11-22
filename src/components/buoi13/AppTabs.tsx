import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackScreen from './HomeStackScreen';
import AdminStackScreen from './AdminStackScreen';
import SignupScreen from './SignupScreen';
import LoginScreen from './LoginScreen';
import { useAuth } from './AuthContext';

export type BottomTabParamList = {
  HomeTab: undefined;
  AdminHomeTab: undefined;
  SignupTab: undefined;
  LoginTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        headerShown: false
      }}
    >
      {/* Home của user */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Home User',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          )
        }}
      />

      {/* Home của admin - chỉ hiển thị khi là admin */}
      {isAdmin && (
        <Tab.Screen
          name="AdminHomeTab"
          component={AdminStackScreen}
          options={{
            title: 'Home Admin',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>⚙️</Text>
            )
          }}
        />
      )}

      <Tab.Screen
        name="SignupTab"
        component={SignupScreen}
        options={{
          title: 'Sign up',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>➕</Text>
          )
        }}
      />

      <Tab.Screen
        name="LoginTab"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔒</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
