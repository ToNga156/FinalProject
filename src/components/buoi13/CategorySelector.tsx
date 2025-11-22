import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../database';

type CategorySelectorProps = {
  categories: Category[];
  selectedId: number;
  onSelect: (id: number) => void;
};

const CategorySelector = ({ categories, selectedId, onSelect }: CategorySelectorProps) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Chọn danh mục:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.button,
              selectedId === category.id && styles.buttonSelected
            ]}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                selectedId === category.id && styles.buttonTextSelected
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginLeft: 5
  },
  container: {
    flexGrow: 0
  },
  contentContainer: {
    paddingHorizontal: 5
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    borderWidth: 1.5,
    borderColor: '#ddd',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSelected: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
    elevation: 3,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  buttonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500'
  },
  buttonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  },
});

export default CategorySelector;

