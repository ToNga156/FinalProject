import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CalculatorWithRadio = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState('');

  const calculate = () => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    let res = '';

    if (isNaN(numA) || isNaN(numB)) {
      setResult('Vui lòng nhập số hợp lệ');
      return;
    }

    switch (operation) {
      case 'add':
        res = (numA + numB).toString();
        break;
      case 'sub':
        res = (numA - numB).toString();
        break;
      case 'mul':
        res = (numA * numB).toString();
        break;
      case 'div':
        res = (numB !== 0 ? numA / numB : 'Không thể chia cho 0').toString();
        break;
      case 'cmp':
        res =
          numA > numB
            ? `Số lớn hơn là: ${numA}`
            : numA < numB
            ? `Số lớn hơn là: ${numB}`
            : 'Hai số bằng nhau';
        break;
      default:
        res = '';
    }

    setResult(res.toString());
  };

  // ✅ Thêm kiểu Props để tránh lỗi any
  type RadioButtonProps = {
    label: string;
    value: string;
  };

  const RadioButton: React.FC<RadioButtonProps> = ({ label, value }) => (
    <TouchableOpacity
      style={styles.radioOption}
      onPress={() => setOperation(value)}
    >
      <View
        style={[
          styles.radioCircle,
          operation === value && styles.radioSelected,
        ]}
      />
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Máy tính với Radio Buttons</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập số thứ nhất"
        keyboardType="numeric"
        value={a}
        onChangeText={setA}
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập số thứ hai"
        keyboardType="numeric"
        value={b}
        onChangeText={setB}
      />

      <Text style={styles.label}>Chọn phép toán:</Text>
      <View style={styles.radioGroup}>
        <RadioButton label="Cộng" value="add" />
        <RadioButton label="Trừ" value="sub" />
        <RadioButton label="Nhân" value="mul" />
        <RadioButton label="Chia" value="div" />
        <RadioButton label="So sánh" value="cmp" />
      </View>

      <TouchableOpacity style={styles.button} onPress={calculate}>
        <Text style={styles.buttonText}>Tính</Text>
      </TouchableOpacity>

      {result !== '' && <Text style={styles.result}>{result}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  radioGroup: {
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  result: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalculatorWithRadio;
