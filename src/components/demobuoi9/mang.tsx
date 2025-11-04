import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView } from 'react-native';

const StudentManager = () => {
  // Mảng sinh viên mẫu
  const [students, setStudents] = useState([
    { id: 1, name: 'An', age: 19, grade: 9.0 },
    { id: 2, name: 'Bình', age: 18, grade: 7.5 },
    { id: 3, name: 'Chi', age: 20, grade: 8.2 },
    { id: 4, name: 'Dũng', age: 21, grade: 6.8 },
    { id: 5, name: 'Hà', age: 19, grade: 9.5 },
  ]);

  const [searchText, setSearchText] = useState('');

  // 👉 Thêm học sinh mới
  const addStudent = () => {
    const newStudent = { id: Date.now(), name: 'Sinh viên mới', age: 18, grade: 7.0 };
    setStudents([...students, newStudent]);
  };

  // 👉 Sửa thông tin học sinh (ví dụ: sửa tên học sinh có id=1)
  const updateStudent = (id: number) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, name: 'Tên đã sửa', grade: s.grade + 0.5 } : s
    );
    setStudents(updated);
  };

  // 👉 Xóa học sinh theo id
  const deleteStudent = (id: number) => {
    const filtered = students.filter((s) => s.id !== id);
    setStudents(filtered);
  };

  // 👉 Lọc học sinh theo điểm > 8
  const filterStudent = () => {
    const filtered = students.filter((s) => s.grade > 8);
    setStudents(filtered);
  };

  // 👉 Sắp xếp theo điểm giảm dần
  const sortByGrade = () => {
    const sorted = [...students].sort((a, b) => b.grade - a.grade);
    setStudents(sorted);
  };

  // 👉 Đếm số học sinh có điểm > 8
  const countHighGrades = students.filter((s) => s.grade > 8).length;

  // 👉 Tìm kiếm theo tên
  const searchedStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>📚 Quản lý sinh viên</Text>
      </View>

      {/* Các nút thao tác */}
      <View style={styles.buttonContainer}>
        <Button title="➕ Thêm" onPress={addStudent} />
        <Button title="✏️ Sửa (id=1)" onPress={() => updateStudent(1)} />
        <Button title="🗑️ Xóa (id=1)" onPress={() => deleteStudent(1)} />
        <Button title="🔍 Lọc điểm > 8" onPress={filterStudent} />
        <Button title="⬇️ Sắp xếp theo điểm" onPress={sortByGrade} />
      </View>

      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.input}
        placeholder="Nhập tên cần tìm..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Thông tin thống kê */}
      <Text style={styles.infoText}>
        Số sinh viên có điểm &gt; 8: {countHighGrades}
      </Text>


      {/* Danh sách sinh viên */}
      <ScrollView contentContainerStyle={styles.list}>
        {searchedStudents.map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.name}>👤 {s.name}</Text>
            <Text>Tuổi: {s.age}</Text>
            <Text>Điểm: {s.grade}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Student Manager</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { backgroundColor: '#4D96FF', padding: 15, alignItems: 'center' },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 15,
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    margin: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  list: { padding: 10, alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  footer: { backgroundColor: '#4D96FF', padding: 10, alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 14 },
});

export default StudentManager;
