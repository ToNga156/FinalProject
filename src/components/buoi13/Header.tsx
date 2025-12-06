import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Animated,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { getCartItems } from '../../database';

const Header = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadCartCount();
    const interval = setInterval(loadCartCount, 2000); // Cập nhật mỗi 2 giây
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (showMenu) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [showMenu]);

  const loadCartCount = async () => {
    if (!user || user.role === 'admin') return;
    try {
      const items = await getCartItems(user.id);
      setCartCount(items.length);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleLogout = () => {
    setShowMenu(false);
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const handleAvatarPress = () => {
    if (user?.role === 'admin') {
      setShowMenu(false);
      return;
    }
    setShowMenu(!showMenu);
  };

  const handleMenuOption = (option: 'profile' | 'orders') => {
    setShowMenu(false);
    if (option === 'profile') {
      navigation.navigate('Profile' as any);
    } else if (option === 'orders') {
      navigation.navigate('OrderHistory' as any);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          activeOpacity={0.7}
        >
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.role}>
            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {/* Cart Icon - chỉ hiển thị cho user */}
        {user.role !== 'admin' && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Menu Modal - chỉ cho user */}
      {user.role !== 'admin' && (
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  opacity: fadeAnim
                }
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('profile')}
              >
                <Text style={styles.menuIcon}>👤</Text>
                <Text style={styles.menuText}>Thông tin cá nhân</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('orders')}
              >
                <Text style={styles.menuIcon}>📦</Text>
                <Text style={styles.menuText}>Lịch sử đơn hàng</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0'
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  userDetails: {
    flex: 1
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  role: {
    fontSize: 12,
    color: '#666'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  cartButton: {
    position: 'relative',
    padding: 8
  },
  cartIcon: {
    fontSize: 24
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 70,
    paddingLeft: 15
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12
  },
  menuIcon: {
    fontSize: 20
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15
  }
});

export default Header;
