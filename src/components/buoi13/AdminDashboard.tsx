import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import Header from './Header';

type AdminDashboardProps = NativeStackScreenProps<HomeStackParamList, 'AdminDashboard'>;

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'category',
      title: 'Quản lý Danh mục',
      icon: '📂',
      screen: 'CategoryManagement' as keyof HomeStackParamList,
      description: 'Thêm, sửa, xóa danh mục sản phẩm'
    },
    {
      id: 'product',
      title: 'Quản lý Sản phẩm',
      icon: '📦',
      screen: 'ProductManagement' as keyof HomeStackParamList,
      description: 'Quản lý sản phẩm theo danh mục',
      params: { categoryId: 0 }
    },
    {
      id: 'user',
      title: 'Quản lý Người dùng',
      icon: '👥',
      screen: 'UserManagement' as keyof HomeStackParamList,
      description: 'Xem, thêm, sửa, xóa người dùng'
    }
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.params) {
      navigation.navigate(item.screen, item.params as any);
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header với thông tin user và nút đăng xuất */}
      <Header />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Trang Quản Trị</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Xin chào, {user?.username}!</Text>
          <Text style={styles.welcomeSubtext}>Quản trị viên</Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Thông tin hệ thống</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tài khoản:</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò:</Text>
            <Text style={styles.infoValue}>Quản trị viên</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  pageHeader: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666'
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  menuIcon: {
    fontSize: 30
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  }
});

export default AdminDashboard;

