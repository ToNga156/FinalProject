import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './AppTabs';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const AppNavigator3 = () => {
  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
};

export default AppNavigator3;
