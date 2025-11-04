import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';

type Props = {
  name: string;
};

const DisplayNameAge = (props: Props) => {
  const [name, setName] = useState(props.name);
  const [age, setAge] = useState('');

  const handlePress = () => {
    Alert.alert(`Hello ${name}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <Button title="Say Hello" onPress={handlePress} />

      <Text style={styles.output}>
        {name && age ? `Tên: ${name} - Tuổi: ${age}` : 'Chưa nhập thông tin'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  output: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default DisplayNameAge;
