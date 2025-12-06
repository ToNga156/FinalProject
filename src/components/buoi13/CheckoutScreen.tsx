import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  ImageSourcePropType
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { getCartItems, createOrder, CartItem, Product } from '../../database';

type CheckoutScreenProps = NativeStackScreenProps<HomeStackParamList, 'Checkout'>;

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
const getProductImage = (product: Product | undefined): ImageSourcePropType => {
  if (!product) {
    return productImages[0];
  }
  
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

const CheckoutScreen = ({ route }: CheckoutScreenProps) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [errors, setErrors] = useState<{ address?: string; phone?: string; paymentMethod?: string }>({});

  useEffect(() => {
    loadCartItems();
    if (user) {
      setPhone(user.phone || '');
      setShippingAddress(user.address || '');
    }
  }, []);

  const loadCartItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await getCartItems(user.id);
      setCartItems(items);
      if (items.length === 0) {
        Alert.alert('Thông báo', 'Giỏ hàng trống', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { address?: string; phone?: string; paymentMethod?: string } = {};

    if (!shippingAddress.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    } else if (shippingAddress.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    Alert.alert(
      'Xác nhận đặt hàng',
      'Bạn có chắc muốn đặt hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt hàng',
          onPress: async () => {
            try {
              setSubmitting(true);
              const orderId = await createOrder(
                user.id,
                cartItems,
                shippingAddress.trim(),
                phone.trim(),
                paymentMethod
              );
              Alert.alert(
                'Thành công',
                `Đơn hàng #${orderId} đã được tạo thành công!`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('OrderHistory' as any);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error creating order:', error);
              Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh Toán</Text>
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
          <Text style={styles.headerTitle}>Thanh Toán</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để thanh toán</Text>
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
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn Hàng</Text>
          {cartItems.map((item) => {
            const productImage = getProductImage(item.product);
            return (
              <View key={item.id} style={styles.orderItem}>
                <Image source={productImage} style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.product?.name}
                  </Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </Text>
              </View>
            );
          })}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>{formatPrice(calculateTotal())}</Text>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Giao Hàng</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên người dùng *</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.username || ''}
              editable={false}
              placeholder="Tên người dùng"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined });
                }
              }}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              maxLength={11}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              value={shippingAddress}
              onChangeText={(text) => {
                setShippingAddress(text);
                if (errors.address) {
                  setErrors({ ...errors, address: undefined });
                }
              }}
              placeholder="Nhập địa chỉ giao hàng"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phương thức thanh toán *</Text>
            <TouchableOpacity
              style={[styles.paymentButton, errors.paymentMethod && styles.inputError]}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.paymentButtonText}>
                {paymentMethod === 'cash' ? '💰 Tiền mặt' :
                 paymentMethod === 'bank_transfer' ? '🏦 Chuyển khoản' :
                 paymentMethod === 'credit_card' ? '💳 Thẻ tín dụng' :
                 'Chọn phương thức thanh toán'}
              </Text>
              <Text style={styles.paymentArrow}>▼</Text>
            </TouchableOpacity>
            {errors.paymentMethod && <Text style={styles.errorText}>{errors.paymentMethod}</Text>}
          </View>
        </View>
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionSelected]}
              onPress={() => {
                setPaymentMethod('cash');
                setShowPaymentModal(false);
                if (errors.paymentMethod) {
                  setErrors({ ...errors, paymentMethod: undefined });
                }
              }}
            >
              <Text style={styles.paymentOptionText}>💰 Tiền mặt</Text>
              {paymentMethod === 'cash' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'bank_transfer' && styles.paymentOptionSelected]}
              onPress={() => {
                setPaymentMethod('bank_transfer');
                setShowPaymentModal(false);
                if (errors.paymentMethod) {
                  setErrors({ ...errors, paymentMethod: undefined });
                }
              }}
            >
              <Text style={styles.paymentOptionText}>🏦 Chuyển khoản</Text>
              {paymentMethod === 'bank_transfer' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'credit_card' && styles.paymentOptionSelected]}
              onPress={() => {
                setPaymentMethod('credit_card');
                setShowPaymentModal(false);
                if (errors.paymentMethod) {
                  setErrors({ ...errors, paymentMethod: undefined });
                }
              }}
            >
              <Text style={styles.paymentOptionText}>💳 Thẻ tín dụng</Text>
              {paymentMethod === 'credit_card' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.footerTotalAmount}>{formatPrice(calculateTotal())}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, submitting && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Đặt Hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
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
    color: '#666'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 15
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0'
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 10
  },
  orderItemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666'
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  textArea: {
    height: 100,
    paddingTop: 12
  },
  inputError: {
    borderColor: '#ff4444'
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5
  },
  paymentButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff'
  },
  paymentButtonText: {
    fontSize: 16,
    color: '#333'
  },
  paymentArrow: {
    fontSize: 12,
    color: '#666'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  paymentOptionSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#fff5f8'
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333'
  },
  checkmark: {
    fontSize: 20,
    color: '#E91E63',
    fontWeight: 'bold'
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666'
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
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  footerTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  footerTotalAmount: {
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
  checkoutButtonDisabled: {
    opacity: 0.6
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default CheckoutScreen;

