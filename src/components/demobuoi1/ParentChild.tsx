import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";

type Props = {
  name: string;
  age: number;
  handleChange: (newName: string, newAge: number) => void;
};

const ParentChild = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);

  const handleChange = (newName: string, newAge: number) => {
    setName(newName);
    setAge(newAge);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={[styles.text, { color: "green" }]}>ParentChild</Text>

      {/* Nhập dữ liệu ở cha */}
      <TextInput
        style={styles.input}
        placeholder="Nhập tên của cha"
        value={name}
        onChangeText={(text) => handleChange(text, age)}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi của cha"
        value={age.toString()}
        onChangeText={(text) =>
          handleChange(name, Number(text))
        }
        keyboardType="numeric"
      />

      <Text style={styles.result}>Tên cha: {name}</Text>
      <Text style={styles.result}>Tuổi cha: {age}</Text>

      {/* Truyền state + callback xuống con */}
      <Child name={name} age={age} handleChange={handleChange} />
    </View>
  );
};

const Child = (props: Props) => {
  const { name, age, handleChange } = props;

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={[styles.text, { color: "green" }]}>Child</Text>

      {/* Nhập dữ liệu ở con */}
      <TextInput
        style={styles.input}
        placeholder="Nhập tên (ở con)"
        value={name}
        onChangeText={(text) => handleChange(text, age)} // gửi ngược lên cha
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi (ở con)"
        value={age.toString()}
        onChangeText={(text) =>
          handleChange(name, Number(text)) // gửi ngược lên cha
        }
        keyboardType="numeric"
      />

      <Text style={styles.result}>Tên con: {name}</Text>
      <Text style={styles.result}>Tuổi con: {age}</Text>
    </View>
  );
};

export default ParentChild;

const styles = StyleSheet.create({
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  result: { fontSize: 18, marginTop: 5 },
});
