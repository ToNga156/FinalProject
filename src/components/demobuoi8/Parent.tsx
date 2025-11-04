import React from "react";
import {View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ImageSourcePropType} from "react-native";

type Product = {
  id: number;
  name: string;
  price: string;
  image: ImageSourcePropType;
};

type ShopProps = {
  title: string;
  products: Product[];
};

const Shop: React.FC<ShopProps> = ({ title, products}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {products.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} />

            <View style={styles.infoContainer}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>

            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Doraemon Store</Text>
      </View>
    </View>
  );
};

const Parent = () => {
  const products = [
    { id: 1, name: "Giày thể thao", price: "250.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 2, name: "Áo thun Doraemon", price: "180.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 3, name: "Balo học sinh", price: "320.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 4, name: "Mũ bảo hiểm thời trang", price: "150.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 5, name: "Đồng hồ trẻ em", price: "280.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 6, name: "Áo khoác gió", price: "350.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 7, name: "Vở Doraemon", price: "20.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 8, name: "Bút chì Doraemon", price: "15.000đ", image: require("../../../assets/images/avt1.jpg") },
    { id: 9, name: "Túi đeo chéo", price: "220.000đ", image: require("../../../assets/images/avt1.jpg") },
  ];

  return <Shop title="Shop" products={products} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFD93D",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0C93D",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  card: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "space-between",
    height: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  infoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    height: 36,
    overflow: "hidden",
    color: "#333333",
  },
  productPrice: {
    color: "#E63946",
    fontWeight: "bold",
    marginTop: 4,
    fontSize: 13,
  },
  buyButton: {
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  footer: {
    backgroundColor: "#FFD1D1",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5B5B5",
  },
  footerText: {
    fontSize: 14,
    color: "#444444",
  },
});

export default Parent;
