import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ImageSourcePropType,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Product1 } from './types';
import { Product, Category, fetchCategories, fetchProductsByCategory } from '../../database';
import CategorySelector from './CategorySelector';

type ProductsByCategoryRouteProp = RouteProp<HomeStackParamList, 'ProductsByCategory'>;
type ProductsByCategoryNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ProductsByCategory'>;

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

// Hàm convert Product từ database sang Product1 để hiển thị
const convertProductToProduct1 = (product: Product): Product1 => {
  return {
    id: product.id.toString(),
    name: product.name,
    price: `${product.price.toLocaleString('vi-VN')}đ`,
    image: getProductImage(product)
  };
};

export default function ProductsByCategoryScreen() {
  const route = useRoute<ProductsByCategoryRouteProp>();
  const navigation = useNavigation<ProductsByCategoryNavigationProp>();
  const { categoryId } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải danh mục:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchProductsByCategory(selectedCategoryId);
        setProducts(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoadingProducts(false);
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategoryId]);


  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? selectedCategory.name : 'Sản phẩm'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={(id) => setSelectedCategoryId(id)}
      />

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const product1 = convertProductToProduct1(item);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Details', { product: product1 })}
                activeOpacity={0.7}
              >
                <Image source={product1.image} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} đ</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Chưa có sản phẩm nào trong danh mục này</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

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
  listContainer: {
    padding: 15
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0'
  },
  info: {
    justifyContent: 'center',
    flex: 1
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
    color: '#333'
  },
  price: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '700'
  },
  arrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
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
    paddingVertical: 80
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});