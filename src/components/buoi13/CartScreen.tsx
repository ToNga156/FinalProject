import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ImageSourcePropType
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { getCartItems, updateCartItemQuantity, removeFromCart, CartItem, Product } from '../../database';

type CartScreenProps = NativeStackScreenProps<HomeStackParamList, 'Cart'>;

// Sử dụng hình ảnh placeholder từ assets có sẵn (fallback khi không tìm thấy ảnh từ database)
const productImages: ImageSourcePropType[] = [
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/7bc826eba41114e8d6e14913bba200ea.jpg'),
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/60a4448bc5d9b97f0b148deb2086a61e.jpg'),
];

// Mapping các ảnh có sẵn - map từ tên file đến require path
const imageMap: { [key: string]: ImageSourcePropType } = {
  // Ảnh trong thư mục assets/images/
  'somitrang.jpg': require('../../../assets/images/somitrang.jpg'),
  'aothunnam.jpg': require('../../../assets/images/aothunnam.jpg'),
  'aokhoacgio.jpg': require('../../../assets/images/aokhoacgio.jpg'),
  'aopolo.jpg': require('../../../assets/images/aopolo.jpg'),
  'balothoitrang.jpg': require('../../../assets/images/balothoitrang.jpg'),
  'balolaptop.jpg': require('../../../assets/images/balolaptop.jpg'),
  'balodulich.jpg': require('../../../assets/images/balodulich.jpg'),
  'balothethao.jpg': require('../../../assets/images/balothethao.jpg'),
  'balohocsinh.jpg': require('../../../assets/images/balohocsinh.jpg'),
  'baolomini.jpg': require('../../../assets/images/baolomini.jpg'),
  'muluoitrai.jpg': require('../../../assets/images/muluoitrai.jpg'),
  'mubucket.jpg': require('../../../assets/images/mubucket.jpg'),
  'musnapback.png': require('../../../assets/images/musnapback.png'),
  'mulen.jpg': require('../../../assets/images/mulen.jpg'),
  'murongvanh.jpg': require('../../../assets/images/murongvanh.jpg'),
  'mubeanie.jpg': require('../../../assets/images/mubeanie.jpg'),
  'tuixaschnu.jpg': require('../../../assets/images/tuixaschnu.jpg'),
  'tuideocheo.jpg': require('../../../assets/images/tuideocheo.jpg'),
  'tuitote.jpg': require('../../../assets/images/tuitote.jpg'),
  'tuimini.jpg': require('../../../assets/images/tuimini.jpg'),
  'tuida.jpg': require('../../../assets/images/tuida.jpg'),
  'tuivai.jpg': require('../../../assets/images/tuivai.jpg'),
  
  // Ảnh trong thư mục assets/images/
  '7bc826eba41114e8d6e14913bba200ea.jpg': require('../../../assets/images/7bc826eba41114e8d6e14913bba200ea.jpg'),
  '60a4448bc5d9b97f0b148deb2086a61e.jpg': require('../../../assets/images/60a4448bc5d9b97f0b148deb2086a61e.jpg'),
  'fbcc9d99190adf16c0a0c50c56f72a21.jpg': require('../../../assets/images/fbcc9d99190adf16c0a0c50c56f72a21.jpg'),
  'c24d3694c02ec6c6357a272317a29379.jpg': require('../../../assets/images/c24d3694c02ec6c6357a272317a29379.jpg'),
  '683f90012798ec5d6e581f2a73792656.jpg': require('../../../assets/images/683f90012798ec5d6e581f2a73792656.jpg'),
  '7a98c0d842332176931eff0285810bab.jpg': require('../../../assets/images/7a98c0d842332176931eff0285810bab.jpg'),
  '28eddfd49ca1fbe3a605e461ab5bcdd3.jpg': require('../../../assets/images/28eddfd49ca1fbe3a605e461ab5bcdd3.jpg'),
  '2f037efeff55f8f0a1339d7e2ec48359.jpg': require('../../../assets/images/2f037efeff55f8f0a1339d7e2ec48359.jpg'),
  'background.jpg': require('../../../assets/images/background.jpg'),
};

// Hàm lấy hình ảnh từ database
const getProductImage = (product: Product): ImageSourcePropType => {
  // Nếu có đường dẫn ảnh trong database, thử tìm tên file
  if (product.img) {
    // Lấy tên file từ đường dẫn (có thể là '../assets/images/filename.jpg' hoặc 'filename.jpg')
    // Xử lý cả trường hợp có 'images/images' trong đường dẫn
    let fileName = '';
    
    // Xử lý trường hợp có 'images/images' trong đường dẫn
    if (product.img.includes('images/images/')) {
      fileName = product.img.split('images/images/')[1];
    } else {
      // Lấy tên file cuối cùng từ đường dẫn
      const pathParts = product.img.split('/');
      fileName = pathParts[pathParts.length - 1];
    }
    
    // Kiểm tra xem có ảnh trong mapping không
    if (imageMap[fileName]) {
      return imageMap[fileName];
    }
  }
  
  // Nếu không tìm thấy, sử dụng hình ảnh dựa trên categoryId
  const imageIndex = (product.categoryId - 1) % productImages.length;
  return productImages[imageIndex];
};

const CartScreen = ({ route }: CartScreenProps) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
      return;
    }
    try {
      await updateCartItemQuantity(cartItemId, newQuantity);
      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(cartItemId);
              await loadCartItems();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    if (!item.product) return null;

    const productImage = getProductImage(item.product);

    return (
      <View style={styles.cartItem}>
        <View style={styles.productImageContainer}>
          <Image source={productImage} style={styles.productImage} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.product.price)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Text style={styles.removeButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalText}>
            {formatPrice(item.product.price * item.quantity)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ Hàng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ Hàng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem giỏ hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ Hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home' as any)}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={loadCartItems}
          />
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>{formatPrice(calculateTotal())}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout' as any)}
            >
              <Text style={styles.checkoutButtonText}>Thanh Toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  placeholder: {
    width: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20
  },
  shopButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  listContent: {
    padding: 15
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0'
  },
  productImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666'
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between'
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  productPrice: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600',
    marginBottom: 10
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#E91E63',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center'
  },
  removeButton: {
    marginLeft: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ff4444',
    borderRadius: 5
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  checkoutButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default CartScreen;

