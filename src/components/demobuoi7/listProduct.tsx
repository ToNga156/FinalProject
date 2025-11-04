import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

const ListProduct = () => {
  const products = [
    { id: 1, name: 'Thỏ trắng', price: '100.000₫', image: 'https://i.pinimg.com/736x/e5/da/f8/e5daf8e0e7f24bd1fc8e23858276e417.jpg' },
    { id: 2, name: 'Bó hoa tulip', price: '120.000₫', image: 'https://tse3.mm.bing.net/th/id/OIP.jq3juyGCfyd9o3g1WL2JxQHaJQ?w=1080&h=1350&rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 3, name: 'Heo hồng', price: '90.000₫', image: 'https://i.pinimg.com/1200x/04/e2/a7/04e2a726700811d150e81eedbbd79a8c.jpg' },
    { id: 4, name: 'Sứa sắc màu', price: '150.000₫', image: 'https://i.pinimg.com/736x/92/3f/9e/923f9e2d50b676edc6ca674f8b818594.jpg' },
    { id: 5, name: 'Bé vịt bếu', price: '80.000₫', image: 'https://i.pinimg.com/736x/a7/aa/17/a7aa178d03ad043c3608c72864993a77.jpg' },
    { id: 6, name: 'Cừu non', price: '200.000₫', image: 'https://i.pinimg.com/736x/6f/58/52/6f5852797f6ae25e804ca8f29b7367aa.jpg' },
    { id: 7, name: 'Hoa hêu', price: '110.000₫', image: 'https://i.pinimg.com/1200x/b7/34/f4/b734f48ad2cd728d1f04524b705805e8.jpg' },
    { id: 8, name: 'Hướng dương', price: '95.000₫', image: 'https://i.pinimg.com/1200x/93/2e/d7/932ed701cf6b3f74921276ca9fd2a9c0.jpg' },
    { id: 9, name: 'Bó hoa mix', price: '130.000₫', image: 'https://i.pinimg.com/736x/63/c7/25/63c725d8bbe7c16c742e44a7d5d79ae5.jpg' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Danh sách sản phẩm</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {products.map((product) => (
          <View key={product.id} style={styles.card}>
            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{product.price}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 My Shop</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    padding: 15,
    backgroundColor: '#4D96FF',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    margin: '1.5%',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  name: {
    marginTop: 5,
    fontWeight: '600',
  },
  price: {
    color: '#E63946',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 10,
    backgroundColor: '#4D96FF',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ListProduct;
