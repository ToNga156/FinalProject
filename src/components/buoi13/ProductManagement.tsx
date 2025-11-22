import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import {
  fetchProductsByCategory,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category
} from '../../database';
import Header from './Header';

type ProductManagementProps = NativeStackScreenProps<HomeStackParamList, 'ProductManagement'>;

const ProductManagement = ({ route, navigation }: ProductManagementProps) => {
  const { categoryId } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImg, setProductImg] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadProducts();
    }
  }, [selectedCategoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsData, prodsData] = await Promise.all([
        fetchCategories(),
        categoryId > 0 ? fetchProductsByCategory(categoryId) : Promise.resolve([])
      ]);
      setCategories(catsData);
      setProducts(prodsData);
      setSelectedCategoryId(categoryId > 0 ? categoryId : (catsData[0]?.id || 0));
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      if (selectedCategoryId > 0) {
        const data = await fetchProductsByCategory(selectedCategoryId);
        setProducts(data);
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải sản phẩm:', error);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductImg('hinh1.jpg');
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductImg(product.img);
    setSelectedCategoryId(product.categoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!productPrice.trim() || isNaN(parseFloat(productPrice))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return;
    }

    if (selectedCategoryId === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    try {
      const price = parseFloat(productPrice);
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          name: productName.trim(),
          price,
          img: productImg.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm thành công');
      } else {
        await addProduct({
          name: productName.trim(),
          price,
          img: productImg.trim() || 'hinh1.jpg',
          categoryId: selectedCategoryId
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm thành công');
      }
      setModalVisible(false);
      resetForm();
      loadProducts();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Thành công', 'Đã xóa sản phẩm thành công');
              loadProducts();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductImg('hinh1.jpg');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Image
          source={require('../../../assets/images/avt1.jpg')}
          style={styles.productImage}
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.productCategory}>
            Danh mục: {categories.find(c => c.id === item.categoryId)?.name || 'N/A'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Sản Phẩm</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        <Text style={styles.selectorLabel}>Danh mục:</Text>
        <View style={styles.categoryButtons}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategoryId === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategoryId === cat.id && styles.categoryButtonTextActive
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Chưa có sản phẩm nào trong danh mục này
            </Text>
          </View>
        }
      />

      {/* Modal Add/Edit Product */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
            </Text>

            <Text style={styles.modalLabel}>Tên sản phẩm:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tên sản phẩm"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#999"
            />

            <Text style={styles.modalLabel}>Giá:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập giá"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <Text style={styles.modalLabel}>Hình ảnh:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên file hình ảnh (ví dụ: hinh1.jpg)"
              value={productImg}
              onChangeText={setProductImg}
              placeholderTextColor="#999"
            />

            <Text style={styles.modalLabel}>Danh mục:</Text>
            <View style={styles.categorySelect}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategoryId === cat.id && styles.categoryOptionActive
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategoryId === cat.id && styles.categoryOptionTextActive
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  categorySelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoryButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666'
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 15
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f0f0f0'
  },
  productDetails: {
    flex: 1
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  productPrice: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
    marginBottom: 5
  },
  productCategory: {
    fontSize: 14,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8
  },
  editButton: {
    backgroundColor: '#E91E63'
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444'
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  deleteButtonText: {
    color: '#ff4444'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoryOptionActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63'
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666'
  },
  categoryOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  saveButton: {
    backgroundColor: '#E91E63'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});

export default ProductManagement;

