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
  Modal
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import Header from './Header';
import { getAllOrders, updateOrderStatus, getOrderItems, Order, OrderItem } from '../../database';

type OrderManagementProps = NativeStackScreenProps<HomeStackParamList, 'OrderManagement'>;

const OrderManagement = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItem[] }>({});
  const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const renderOrderItem = (item: OrderItem) => {
    return (
      <View key={item.id} style={styles.orderItemRow}>
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

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
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

