import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';
import ProductsByCategoryScreen from './ProductByCategoryScreen';
import CategoriesScreen from './CategoriesScreen';
import { HomeStackParamList } from './types';

// export type HomeStackParamList = {
//   Home: undefined;
//   Details: { product: { id: string; name: string; price: string; image: any } };
// };

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;