import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { addToCart, getCartItems } from '../../database';

type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { product } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Lấy productId từ product (có thể là string hoặc number)
  const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  // Lấy price từ product (có thể là string hoặc number)
  const productPrice = typeof product.price === 'string' 
    ? parseFloat(product.price.replace(/[^0-9.]/g, '')) 
    : product.price;

  const handleAddToCart = async () => {
    if (!user) {
      // Tự động chuyển hướng đến màn hình đăng nhập
      // Navigate đến LoginTab từ parent navigator (Tab Navigator)
      try {
        const parentNav = navigation.getParent();
        if (parentNav) {
          (parentNav as any).navigate('LoginTab');
        } else {
          // Fallback: dùng CommonActions để navigate đến LoginTab
          navigation.dispatch(
            CommonActions.navigate({
              name: 'LoginTab',
            } as any)
          );
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback cuối cùng
        (navigation as any).getParent()?.navigate('LoginTab');
      }
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(user.id, productId, quantity);
      Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`, [
        { text: 'Xem giỏ hàng', onPress: () => (navigation as any).navigate('Cart') },
        { text: 'Tiếp tục mua sắm', style: 'cancel' }
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      // Tự động chuyển hướng đến màn hình đăng nhập
      // Navigate đến LoginTab từ parent navigator (Tab Navigator)
      try {
        const parentNav = navigation.getParent();
        if (parentNav) {
          (parentNav as any).navigate('LoginTab');
        } else {
          // Fallback: dùng CommonActions để navigate đến LoginTab
          navigation.dispatch(
            CommonActions.navigate({
              name: 'LoginTab',
            } as any)
          );
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback cuối cùng
        (navigation as any).getParent()?.navigate('LoginTab');
      }
      return;
    }

    try {
      setBuyingNow(true);
      // Thêm sản phẩm vào giỏ hàng tạm thời
      await addToCart(user.id, productId, quantity);
      // Lấy giỏ hàng và điều hướng đến checkout
      const cartItems = await getCartItems(user.id);
      // Tìm sản phẩm vừa thêm
      const currentItem = cartItems.find(item => item.productId === productId);
      if (currentItem) {
        // Điều hướng đến checkout
        (navigation as any).navigate('Checkout');
      } else {
        Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error buying now:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện mua ngay');
    } finally {
      setBuyingNow(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.]/g, '')) 
      : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá:</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Thông Tin Sản Phẩm</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã sản phẩm:</Text>
              <Text style={styles.detailValue}>#{product.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tên sản phẩm:</Text>
              <Text style={styles.detailValue}>{product.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá bán:</Text>
              <Text style={styles.detailValue}>{formatPrice(product.price)}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô Tả</Text>
            <Text style={styles.descriptionText}>
              Sản phẩm chất lượng cao, được chọn lọc kỹ càng. 
              Đảm bảo chất lượng và uy tín. Giao hàng nhanh chóng, 
              đóng gói cẩn thận.
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Số lượng:</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Text style={[styles.quantityButtonText, quantity <= 1 && styles.quantityButtonDisabled]}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.buyButton, buyingNow && styles.buttonDisabled]}
          onPress={handleBuyNow}
          disabled={buyingNow}
        >
          <Text style={styles.buyButtonText}>
            {buyingNow ? 'Đang xử lý...' : 'Mua Ngay'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cartButton, addingToCart && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          <Text style={styles.cartButtonText}>
            {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  productImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 10
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  priceLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 10
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20
  },
  detailsSection: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right'
  },
  descriptionSection: {
    marginBottom: 20
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'justify'
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  quantitySection: {
    marginBottom: 25
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28
  },
  quantityButtonDisabled: {
    opacity: 0.5
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center'
  }
});

export default DetailsScreen;
