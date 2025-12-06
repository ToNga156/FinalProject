import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { getOrders, getOrderItems, Order, OrderItem, Product } from '../../database';

type OrderHistoryScreenProps = NativeStackScreenProps<HomeStackParamList, 'OrderHistory'>;

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

const OrderHistoryScreen = ({ route }: OrderHistoryScreenProps) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItem[] }>({});
  const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userOrders = await getOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: number) => {
    if (orderItemsMap[orderId]) return; // Đã load rồi

    try {
      setLoadingItems({ ...loadingItems, [orderId]: true });
      const items = await getOrderItems(orderId);
      setOrderItemsMap({ ...orderItemsMap, [orderId]: items });
    } catch (error) {
      console.error('Error loading order items:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingItems({ ...loadingItems, [orderId]: false });
    }
  };

  const toggleOrder = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      loadOrderItems(orderId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'shipping':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrderItem = (item: OrderItem) => {
    const productImage = getProductImage(item.product);
    
    return (
      <View key={item.id} style={styles.orderItemRow}>
        <Image source={productImage} style={styles.orderItemImage} />
        <View style={styles.orderItemInfo}>
          <Text style={styles.orderItemName} numberOfLines={1}>
            {item.product?.name || 'Sản phẩm'}
          </Text>
          <Text style={styles.orderItemDetails}>
            {item.quantity} x {formatPrice(item.price)}
          </Text>
        </View>
        <Text style={styles.orderItemTotal}>
          {formatPrice(item.price * item.quantity)}
        </Text>
      </View>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrderId === item.id;
    const items = orderItemsMap[item.id] || [];
    const isLoadingItems = loadingItems[item.id];

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrder(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            {isLoadingItems ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E91E63" />
              </View>
            ) : (
              <>
                <Text style={styles.detailsTitle}>Chi tiết đơn hàng:</Text>
                {items.map((orderItem) => renderOrderItem(orderItem))}
                <View style={styles.divider} />
                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Địa chỉ giao hàng:</Text>
                    <Text style={styles.summaryValue} numberOfLines={2}>
                      {item.shippingAddress}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Số điện thoại:</Text>
                    <Text style={styles.summaryValue}>{item.phone}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
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
          <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
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
          <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem lịch sử mua hàng</Text>
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
        <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home' as any)}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadOrders}
        />
      )}
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
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden'
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15
  },
  orderHeaderLeft: {
    flex: 1
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  orderDate: {
    fontSize: 14,
    color: '#666'
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  expandIcon: {
    fontSize: 12,
    color: '#666'
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa'
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    fontSize: 15,
    color: '#333',
    marginBottom: 4
  },
  orderItemDetails: {
    fontSize: 13,
    color: '#666'
  },
  orderItemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E91E63'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15
  },
  orderSummary: {
    marginTop: 10
  },
  summaryRow: {
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 14,
    color: '#333'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
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
  }
});

export default OrderHistoryScreen;

