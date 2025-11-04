import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const Ptbacnhat = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState('');

  const solveEquation = () => {
    const A = parseFloat(a);
    const B = parseFloat(b);

    if (isNaN(A) || isNaN(B)) {
      setResult('⚠️ Vui lòng nhập số hợp lệ');
      return;
    }

    if (A === 0 && B === 0) {
      setResult('Phương trình có vô số nghiệm');
    } else if (A === 0 && B !== 0) {
      setResult('Phương trình vô nghiệm');
    } else {
      const x = -B / A;
      setResult(`Phương trình có nghiệm: x = ${x}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giải phương trình bậc nhất</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập hệ số a"
        keyboardType="numeric"
        value={a}
        onChangeText={setA}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập hệ số b"
        keyboardType="numeric"
        value={b}
        onChangeText={setB}
      />

      <Button title="Giải phương trình" onPress={solveEquation} />

      {/* {result &&<Text style={styles.result}></Text>} */}
        <View>
            <Text style={styles.result}>{result}</Text>
        </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: '#0066cc',
    textAlign: 'center',
  },
});

export default Ptbacnhat;