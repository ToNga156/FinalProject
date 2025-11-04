import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Shape = () => {
  const items = [
    { id: 1, color: '#FF6B6B' },
    { id: 2, color: '#FFD93D' },
    { id: 3, color: '#6BCB77' },
    { id: 4, color: '#4D96FF' },
    { id: 5, color: '#A66DD4' },
    { id: 6, color: '#FF9F1C' },
    { id: 7, color: '#2EC4B6' },
    { id: 8, color: '#CBF3F0' },
    { id: 9, color: '#E63946' },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={[styles.box, { backgroundColor: item.color }]}>
          <Text style={styles.text}>Hình {item.id}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',       
    flexWrap: 'wrap', 
    flex: 1,         
    justifyContent: 'center',
  },
  box: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Shape;
