import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

const BMICalculator = () => {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [color, setColor] = useState<string>('#000');

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập chiều cao và cân nặng hợp lệ!');
      return;
    }

    const bmiValue = parseFloat((w / (h * h)).toFixed(1));
    setBmi(bmiValue);

    if (bmiValue < 18.5) {
      setStatus('Gầy (Underweight)');
      setColor('#0096FF');
    } else if (bmiValue < 25) {
      setStatus('Bình thường (Normal)');
      setColor('#00C851');
    } else if (bmiValue < 30) {
      setStatus('Thừa cân (Overweight)');
      setColor('#FF8800');
    } else {
      setStatus('Béo phì (Obese)');
      setColor('#CC0000');
    }
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setStatus('');
    setColor('#000');
  };

  const idealWeightRange = () => {
    if (!height) return '';
    const h = parseFloat(height);
    const min = (18.5 * h * h).toFixed(1);
    const max = (24.9 * h * h).toFixed(1);
    return `Mức cân nặng lý tưởng: ${min}kg – ${max}kg`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>BMI Calculator</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập chiều cao (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập cân nặng (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TouchableOpacity style={styles.button} onPress={calculateBMI}>
        <Text style={styles.buttonText}>TÍNH TOÁN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={reset}>
        <Text style={styles.buttonText}>RESET</Text>
      </TouchableOpacity>

      {bmi !== null && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, { color }]}>{`BMI: ${bmi}`}</Text>
          <Text style={[styles.statusText, { color }]}>{status}</Text>
          <Text style={styles.idealText}>{idealWeightRange()}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF' 
 },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    color: '#222' 
  },
  input: { 
    width: '80%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 12, 
    padding: 10, 
    marginVertical: 10 
  },
  button: { 
    backgroundColor: '#0066CC', 
    padding: 12, 
    borderRadius: 12, 
    width: '80%', 
    alignItems: 'center', 
    marginTop: 10 
  },
  resetButton: { 
    backgroundColor: '#888' 
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  resultContainer: { 
    marginTop: 30, 
    alignItems: 'center' 
  },
  resultText: { 
    fontSize: 26, 
    fontWeight: 'bold' 
  },
  statusText: { 
    fontSize: 20, 
    marginTop: 5 
  },
  idealText: { 
    fontSize: 16, 
    marginTop: 15, 
    color: '#555' 
  },
});

export default BMICalculator;
