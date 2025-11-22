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
import { Product1, HomeStackParamList } from './types';
import { fetchProducts, Product, searchProductsByNameOrCategory, filterProducts } from '../../database';
import Header from './Header';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// Sử dụng hình ảnh placeholder từ assets có sẵn
const productImages: ImageSourcePropType[] = [
  require('../../../assets/images/avt1.jpg'),
  require('../../../assets/images/copimage.png'),
  require('../../../assets/images/avt1.jpg'),
  require('../../../assets/images/copimage.png'),
];

// Hàm convert Product từ database sang Product1 để hiển thị
const convertProductToProduct1 = (product: Product): Product1 => {
  return {
    id: product.id.toString(),
    name: product.name,
    price: `${product.price.toLocaleString('vi-VN')}đ`,
    image: productImages[product.id % productImages.length] // Sử dụng hình ảnh placeholder
  };
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product1[]>([]);
  const [allProducts, setAllProducts] = useState<Product1[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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

  const renderProduct = ({ item }: { item: Product1 }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { product: item })}
    >
      <View style={styles.productCard}>
        <Image source={item.image} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>

        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header với thông tin user và nút đăng xuất */}
      <Header />

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../../assets/images/copimage.png')}
          style={styles.banner}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Cửa Hàng Thời Trang ABC</Text>
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
        Chào mừng đến với cửa hàng thời trang ABC!
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
                style={styles.filterInput}
                placeholder="0"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.filterLabel}>đến:</Text>
              <TextInput
                style={styles.filterInput}
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
          numColumns={2}
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
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10
  },

  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center'
  },

  productPrice: {
    fontSize: 14,
    color: '#E91E63',
    marginBottom: 10
  },

  buyButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5
  },

  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold'
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
    paddingVertical: 12,
    backgroundColor: '#f9f9f9'
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
