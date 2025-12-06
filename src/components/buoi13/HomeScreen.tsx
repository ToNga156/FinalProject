import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { Product1, HomeStackParamList } from './types';
import { fetchProducts, Product, searchProductsByNameOrCategory, filterProducts, addToCart, getCartItems } from '../../database';
import Header from './Header';
import { useAuth } from './AuthContext';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// Sử dụng hình ảnh placeholder từ assets có sẵn (fallback khi không tìm thấy ảnh từ database)
const productImages: ImageSourcePropType[] = [
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/7bc826eba41114e8d6e14913bba200ea.jpg'),
  require('../../../assets/images/background.jpg'),
  require('../../../assets/images/60a4448bc5d9b97f0b148deb2086a61e.jpg'),
];

// Mapping các ảnh có sẵn - map từ tên file đến require path
const imageMap: { [key: string]: ImageSourcePropType } = {
  // Ảnh trong thư mục assets/ (không có thư mục images)
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

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product1[]>([]);
  const [allProducts, setAllProducts] = useState<Product1[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [buyingNow, setBuyingNow] = useState<string | null>(null);
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    // Fetch sản phẩm từ database khi component mount
    const loadProducts = async () => {
      try {
        setLoading(true);
        const dbProducts = await fetchProducts();
        const convertedProducts = dbProducts.map(convertProductToProduct1);
        setProducts(convertedProducts);
        setAllProducts(convertedProducts); // Lưu tất cả sản phẩm để reset khi xóa search
        
        // Tạo map từ Product1 id sang Product gốc
        const map = new Map<string, Product>();
        dbProducts.forEach(product => {
          map.set(product.id.toString(), product);
        });
        setProductsMap(map);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Tìm kiếm với debounce (chỉ khi không có filter active)
  useEffect(() => {
    if (isFilterActive) return; // Không search nếu đang filter

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchKeyword.trim() === '') {
      setProducts(allProducts);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchProductsByNameOrCategory(searchKeyword.trim());
        const convertedResults = searchResults.map(convertProductToProduct1);
        setProducts(convertedResults);
        
        // Cập nhật map
        const map = new Map<string, Product>();
        searchResults.forEach(product => {
          map.set(product.id.toString(), product);
        });
        setProductsMap(map);
      } catch (error) {
        console.error('❌ Lỗi khi tìm kiếm:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce 500ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword, allProducts, isFilterActive]);

  // Hàm áp dụng filter
  const handleApplyFilter = async () => {
    try {
      setIsFiltering(true);
      const min = minPrice.trim() ? parseFloat(minPrice.trim()) : undefined;
      const max = maxPrice.trim() ? parseFloat(maxPrice.trim()) : undefined;

      // Validation
      if (min !== undefined && max !== undefined && min > max) {
        Alert.alert('Lỗi', 'Giá tối thiểu không được lớn hơn giá tối đa');
        setIsFiltering(false);
        return;
      }

      const filteredResults = await filterProducts(
        filterName.trim() || undefined,
        min,
        max
      );
      const convertedResults = filteredResults.map(convertProductToProduct1);
      setProducts(convertedResults);
      setIsFilterActive(true);
      
      // Cập nhật map
      const map = new Map<string, Product>();
      filteredResults.forEach(product => {
        map.set(product.id.toString(), product);
      });
      setProductsMap(map);
    } catch (error) {
      console.error('❌ Lỗi khi lọc sản phẩm:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Hàm reset filter
  const handleResetFilter = () => {
    setFilterName('');
    setMinPrice('');
    setMaxPrice('');
    setProducts(allProducts);
    setIsFilterActive(false);
    setSearchKeyword(''); // Reset search khi reset filter
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      // Tự động chuyển hướng đến màn hình đăng nhập
      // Navigate đến LoginTab từ parent navigator (Tab Navigator)
      try {
        // Thử lấy parent navigator và navigate
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

    const product = productsMap.get(productId);
    if (!product) return;

    try {
      setAddingToCart(productId);
      await addToCart(user.id, product.id, 1);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (productId: string) => {
    if (!user) {
      // Tự động chuyển hướng đến màn hình đăng nhập
      // Navigate đến LoginTab từ parent navigator (Tab Navigator)
      try {
        // Thử lấy parent navigator và navigate
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

    const product = productsMap.get(productId);
    if (!product) return;

    try {
      setBuyingNow(productId);
      // Thêm sản phẩm vào giỏ hàng tạm thời
      await addToCart(user.id, product.id, 1);
      // Điều hướng đến checkout
      navigation.navigate('Checkout' as any);
    } catch (error) {
      console.error('Error buying now:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện mua ngay');
    } finally {
      setBuyingNow(null);
    }
  };

  const renderProduct = ({ item }: { item: Product1 }) => {
    const originalProduct = productsMap.get(item.id);
    const isLoading = addingToCart === item.id || buyingNow === item.id;
    const isDisabled = isLoading; // Chỉ disable khi đang loading, không disable khi chưa đăng nhập

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Details', { product: item })}
          activeOpacity={0.7}
        >
          <Image source={item.image} style={styles.productImage} />
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </TouchableOpacity>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.addToCartIcon, isDisabled && styles.buttonDisabled]}
            onPress={() => handleAddToCart(item.id)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color="#E91E63" />
            ) : (
              <Text style={styles.addToCartIconText}>+</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyButton, isDisabled && styles.buttonDisabled]}
            onPress={() => handleBuyNow(item.id)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            {buyingNow === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buyButtonText}>Mua Ngay</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header với thông tin user và nút đăng xuất */}
      <Header />

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../../assets/images/background.jpg')}
          style={styles.banner}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Thời Trang Cao Cấp </Text>
          <Text style={styles.bannerSubtitle}>Chất lượng - Uy tín - Giá tốt</Text>
        </View>
      </View>

      {/* Menu điều hướng */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.menuIcon}>🏠</Text>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.menuIcon}>📂</Text>
          <Text style={styles.menuText}>Danh mục sản phẩm</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>
        Chào mừng đến với cửa hàng thời trang Cao Cấp!
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên sản phẩm hoặc danh mục..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#999"
            editable={!isFilterActive}
          />
          {searchKeyword.length > 0 && !isFilterActive && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchKeyword('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Text style={styles.filterToggleText}>
            {showFilter ? '▼' : '▶'} Lọc sản phẩm
          </Text>
          {isFilterActive && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Đang lọc</Text>
            </View>
          )}
        </TouchableOpacity>

        {showFilter && (
          <View style={styles.filterContent}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Tên sản phẩm:</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Nhập tên sản phẩm"
                value={filterName}
                onChangeText={setFilterName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Giá từ:</Text>
              <TextInput
                style={styles.filterInputPrice}
                placeholder="0"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.filterLabelSmall}>đến:</Text>
              <TextInput
                style={styles.filterInputPrice}
                placeholder="Không giới hạn"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={handleApplyFilter}
                disabled={isFiltering}
              >
                {isFiltering ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.filterButtonText}>Áp dụng</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, styles.resetButton]}
                onPress={handleResetFilter}
              >
                <Text style={[styles.filterButtonText, styles.resetButtonText]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isFilterActive ? (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                  </Text>
                </>
              ) : searchKeyword.trim() ? (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Không tìm thấy sản phẩm nào với từ khóa "{searchKeyword}"
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              )}
            </View>
          }
          ListHeaderComponent={
            (searchKeyword.trim() || isFilterActive) ? (
              <View style={styles.searchResultHeader}>
                <Text style={styles.searchResultText}>
                  {isFilterActive 
                    ? `Đã lọc: ${products.length} sản phẩm`
                    : `Tìm thấy ${products.length} sản phẩm`}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 150
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9
  },

  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 8
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  welcomeText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 15
  },

  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#666'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  },
  searchResultHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0'
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },

  listContainer: {
    paddingHorizontal: 10
  },

  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 100
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f0f0f0'
  },

  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
    textAlign: 'center'
  },

  productPrice: {
    fontSize: 13,
    color: '#E91E63',
    marginBottom: 8,
    textAlign: 'center'
  },

  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    marginTop: 5
  },
  addToCartIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addToCartIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    opacity: 0.5
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
    paddingVertical: 50
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 10
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  filterBadge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold'
  },
  filterContent: {
    padding: 15,
    backgroundColor: '#fff'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap'
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    minWidth: 80
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minWidth: 100,
    marginRight: 8
  },
  filterInputPrice: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: '#f9f9f9',
    minWidth: 80,
    marginRight: 6,
    maxWidth: 120
  },
  filterLabelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
    minWidth: 50
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5
  },
  applyButton: {
    backgroundColor: '#E91E63',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  resetButtonText: {
    color: '#E91E63'
  }
});

export default HomeScreen;
