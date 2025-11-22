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
  Modal
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category
} from '../../database';
import Header from './Header';

type CategoryManagementProps = NativeStackScreenProps<HomeStackParamList, 'CategoryManagement'>;

const CategoryManagement = ({ navigation }: CategoryManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

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
    navigation.navigate('ProductManagement', { categoryId });
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
    width: '80%',
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
  }
});

export default CategoryManagement;

