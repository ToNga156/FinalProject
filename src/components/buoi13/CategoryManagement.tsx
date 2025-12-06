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
  Image,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  fetchProductsByCategory,
  Category,
  Product
} from '../../database';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import Header from './Header';

type CategoryManagementProps = NativeStackScreenProps<HomeStackParamList, 'CategoryManagement'>;

const CategoryManagement = ({ navigation }: CategoryManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  // States for add product modal
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách category:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName.trim());
        Alert.alert('Thành công', 'Đã cập nhật danh mục thành công');
      } else {
        await addCategory(categoryName.trim());
        Alert.alert('Thành công', 'Đã thêm danh mục thành công');
      }
      setModalVisible(false);
      setCategoryName('');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu danh mục');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?\nTất cả sản phẩm trong danh mục này cũng sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('Thành công', 'Đã xóa danh mục thành công');
              loadCategories();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa danh mục');
            }
          }
        }
      ]
    );
  };

  const handleAddProduct = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setProductName('');
    setProductPrice('');
    setSelectedImageUri(null);
    setProductModalVisible(true);
  };

  const handlePickImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
      saveToPhotos: false,
    };

    Alert.alert(
      'Chọn ảnh sản phẩm',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thư viện ảnh',
          onPress: () => {
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              if (response.didCancel) {
                return;
              }
              
              if (response.errorCode) {
                let errorMsg = 'Unknown error';
                if (response.errorCode === 'permission') {
                  errorMsg = 'Không có quyền truy cập thư viện ảnh. Vui lòng cấp quyền trong Cài đặt.';
                } else if (response.errorMessage) {
                  errorMsg = response.errorMessage;
                }
                Alert.alert('Lỗi', `Không thể chọn ảnh: ${errorMsg}`);
                return;
              }
              
              if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                const uri = response.assets[0].uri;
                setSelectedImageUri(uri);
              }
            });
          },
        },
        {
          text: 'Chụp ảnh',
          onPress: () => {
            launchCamera(options, (response: ImagePickerResponse) => {
              if (response.didCancel) {
                return;
              }
              
              if (response.errorCode) {
                let errorMsg = 'Unknown error';
                if (response.errorCode === 'permission') {
                  errorMsg = 'Không có quyền truy cập camera. Vui lòng cấp quyền trong Cài đặt.';
                } else if (response.errorCode === 'camera_unavailable') {
                  errorMsg = 'Camera không khả dụng';
                } else if (response.errorMessage) {
                  errorMsg = response.errorMessage;
                }
                Alert.alert('Lỗi', `Không thể chụp ảnh: ${errorMsg}`);
                return;
              }
              
              if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                const uri = response.assets[0].uri;
                setSelectedImageUri(uri);
              }
            });
          },
        },
        {
          text: 'Xóa ảnh',
          style: 'destructive',
          onPress: () => {
            setSelectedImageUri(null);
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
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
      const imagePath = selectedImageUri || 'hinh1.jpg';
      
      await addProduct({
        name: productName.trim(),
        price,
        img: imagePath,
        categoryId: selectedCategoryId
      });
      
      Alert.alert('Thành công', 'Đã thêm sản phẩm thành công');
      setProductModalVisible(false);
      setProductName('');
      setProductPrice('');
      setSelectedImageUri(null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryId}>ID: {item.id}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addProductButton]}
          onPress={() => handleAddProduct(item.id)}
        >
          <Text style={styles.actionButtonText}>+ Sản phẩm</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Quản Lý Danh Mục</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
          </View>
        }
      />

      {/* Modal Add/Edit Category */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tên danh mục"
              value={categoryName}
              onChangeText={setCategoryName}
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setCategoryName('');
                  setEditingCategory(null);
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

      {/* Modal Add Product */}
      <Modal
        visible={productModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setProductModalVisible(false);
          setProductName('');
          setProductPrice('');
          setSelectedImageUri(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Thêm Sản Phẩm</Text>
              <Text style={styles.modalLabel}>
                Danh mục: {categories.find(c => c.id === selectedCategoryId)?.name || 'N/A'}
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
              
              {/* Preview ảnh đã chọn */}
              {selectedImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImageUri(null)}
                  >
                    <Text style={styles.removeImageButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Nút chọn ảnh */}
              <TouchableOpacity
                style={styles.pickImageButton}
                onPress={handlePickImage}
              >
                <Text style={styles.pickImageButtonText}>
                  {selectedImageUri ? 'Thay đổi ảnh' : 'Chọn ảnh từ thiết bị'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setProductModalVisible(false);
                    setProductName('');
                    setProductPrice('');
                    setSelectedImageUri(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  listContainer: {
    padding: 15
  },
  categoryCard: {
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  categoryIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  categoryDetails: {
    flex: 1
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  categoryId: {
    fontSize: 14,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8
  },
  addProductButton: {
    backgroundColor: '#4CAF50'
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
    fontSize: 12,
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 15,
    alignItems: 'center'
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover'
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: '25%',
    backgroundColor: '#E91E63',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  pickImageButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  pickImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CategoryManagement;

