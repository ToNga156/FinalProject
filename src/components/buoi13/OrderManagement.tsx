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
  Modal,
  Image,
  ImageSourcePropType,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import Header from './Header';
import { getAllOrders, updateOrderStatus, getOrderItems, Order, OrderItem, Product } from '../../database';

type OrderManagementProps = NativeStackScreenProps<HomeStackParamList, 'OrderManagement'>;

// Sử dụng hình ảnh placeholder từ assets có sẵn (fallback khi không tìm thấy ảnh từ database)
const productImages: ImageSourcePropType[] = [
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/7bc826eba41114e8d6e14913bba200ea.jpg'),
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/60a4448bc5d9b97f0b148deb2086a61e.jpg'),
];

// Mapping tên file ảnh với require paths
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
const getProductImage = (product: Product | undefined): ImageSourcePropType | { uri: string } => {
  if (!product) {
    return productImages[0];
  }
  
  // Nếu là URI từ thiết bị (bắt đầu bằng file://), trả về trực tiếp
  if (product.img && product.img.startsWith('file://')) {
    return { uri: product.img };
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
    
    // Trim whitespace
    fileName = fileName.trim();
    
    // Kiểm tra xem có ảnh trong mapping không (exact match)
    if (imageMap[fileName]) {
      return imageMap[fileName];
    }
    
    // Thử tìm case-insensitive match
    const lowerFileName = fileName.toLowerCase();
    const matchingKey = Object.keys(imageMap).find(key => key.toLowerCase() === lowerFileName);
    if (matchingKey) {
      return imageMap[matchingKey];
    }
  }
  
  // Nếu không tìm thấy, sử dụng hình ảnh dựa trên categoryId
  const imageIndex = (product.categoryId - 1) % productImages.length;
  return productImages[imageIndex];
};

const OrderManagement = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItem[] }>({});
  const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: number) => {
    if (orderItemsMap[orderId]) return;

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

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const confirmUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      await loadOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
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

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'cash':
        return '💰 Tiền mặt';
      case 'bank_transfer':
        return '🏦 Chuyển khoản';
      case 'credit_card':
        return '💳 Thẻ tín dụng';
      default:
        return 'Chưa chọn';
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

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Đếm số lượng đơn hàng theo từng trạng thái
  const getOrderCountByStatus = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const renderOrderItem = (item: OrderItem) => {
    return (
      <View key={item.id} style={styles.orderItemRow}>
        <Image 
          source={getProductImage(item.product)} 
          style={styles.orderItemImage} 
        />
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
            <Text style={styles.orderCustomer}>Khách hàng: {item.username || 'N/A'}</Text>
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
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phương thức thanh toán:</Text>
                    <Text style={styles.summaryValue}>{getPaymentMethodText(item.paymentMethod)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.updateStatusButton}
                  onPress={() => handleUpdateStatus(item)}
                >
                  <Text style={styles.updateStatusButtonText}>Cập nhật trạng thái</Text>
                </TouchableOpacity>
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
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Quản Trị Đơn Hàng</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'all' && styles.filterTabTextActive]}>
              Tất cả ({getOrderCountByStatus('all')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'pending' && styles.filterTabActive]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'pending' && styles.filterTabTextActive]}>
              Chờ xử lý ({getOrderCountByStatus('pending')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'confirmed' && styles.filterTabActive]}
            onPress={() => setFilterStatus('confirmed')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'confirmed' && styles.filterTabTextActive]}>
              Đã xác nhận ({getOrderCountByStatus('confirmed')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'shipping' && styles.filterTabActive]}
            onPress={() => setFilterStatus('shipping')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'shipping' && styles.filterTabTextActive]}>
              Đang giao ({getOrderCountByStatus('shipping')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'delivered' && styles.filterTabActive]}
            onPress={() => setFilterStatus('delivered')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'delivered' && styles.filterTabTextActive]}>
              Đã giao ({getOrderCountByStatus('delivered')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterStatus === 'cancelled' && styles.filterTabActive]}
            onPress={() => setFilterStatus('cancelled')}
          >
            <Text style={[styles.filterTabText, filterStatus === 'cancelled' && styles.filterTabTextActive]}>
              Đã hủy ({getOrderCountByStatus('cancelled')})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Không có đơn hàng nào với trạng thái "{getStatusText(filterStatus)}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadOrders}
        />
      )}

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái đơn hàng</Text>
            <Text style={styles.modalSubtitle}>Đơn hàng #{selectedOrder?.id}</Text>
            
            <TouchableOpacity
              style={[styles.statusOption, selectedOrder?.status === 'pending' && styles.statusOptionSelected]}
              onPress={() => confirmUpdateStatus('pending')}
            >
              <Text style={styles.statusOptionText}>🟡 Chờ xử lý</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, selectedOrder?.status === 'confirmed' && styles.statusOptionSelected]}
              onPress={() => confirmUpdateStatus('confirmed')}
            >
              <Text style={styles.statusOptionText}>🔵 Đã xác nhận</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, selectedOrder?.status === 'shipping' && styles.statusOptionSelected]}
              onPress={() => confirmUpdateStatus('shipping')}
            >
              <Text style={styles.statusOptionText}>🟣 Đang giao hàng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, selectedOrder?.status === 'delivered' && styles.statusOptionSelected]}
              onPress={() => confirmUpdateStatus('delivered')}
            >
              <Text style={styles.statusOptionText}>🟢 Đã giao hàng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, selectedOrder?.status === 'cancelled' && styles.statusOptionSelected]}
              onPress={() => confirmUpdateStatus('cancelled')}
            >
              <Text style={styles.statusOptionText}>🔴 Đã hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowStatusModal(false);
                setSelectedOrder(null);
              }}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10
  },
  filterScrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  filterTabActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63'
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  filterTabTextActive: {
    color: '#fff'
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
    textAlign: 'center'
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
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  orderDate: {
    fontSize: 12,
    color: '#999'
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
  },
  updateStatusButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15
  },
  updateStatusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
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
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  statusOptionSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#fff5f8'
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666'
  }
});

export default OrderManagement;

