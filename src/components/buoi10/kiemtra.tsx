import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

const ContactList = () => {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Linh', phone: '3536443634' },
    { id: '2', name: 'Hung', phone: '35523525' },
    { id: '3', name: 'Lan', phone: '0987123456' },
  ]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Thêm hoặc cập nhật liên hệ
  const handleAddOrUpdate = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên và số điện thoại');
      return;
    }

    if (editingId) {
      const updated = contacts.map((item) =>
        item.id === editingId ? { ...item, name: name.trim(), phone: phone.trim() } : item
      );
      setContacts(updated);
      setEditingId(null);
      Alert.alert('Đã cập nhật liên hệ');
    } else {
      const newContact = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
      };
      setContacts([...contacts, newContact]);
    }

    setName('');
    setPhone('');
  };

  //Khi bấm ✏️
  const handleEdit = (item: { id: string; name: string; phone: string }) => {
    setName(item.name);
    setPhone(item.phone);
    setEditingId(item.id);
  };

  //Khi bấm 🗑️
  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa liên hệ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updatedList = contacts.filter((item) => item.id !== id);
          setContacts(updatedList); // Cập nhật lại state
        },
      },
    ]);
  };

  //Lọc danh sách theo tên
  const filteredContacts = contacts.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  //Giao diện từng liên hệ
  const renderItem = ({ item }: { item: { id: string; name: string; phone: string } }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.messageIcon}>💬</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.icon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DANH BẠ</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#9b6b87"
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#9b6b87"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
        <Text style={styles.buttonText}>{editingId ? 'LƯU' : 'THÊM'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9b6b87"
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f7', padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#c81b78',
    alignSelf: 'center',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#faecef',
    borderWidth: 2,
    borderColor: '#d274a5',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 18,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#ee5aa4',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  search: {
    backgroundColor: '#ffeaee',
    borderWidth: 2,
    borderColor: '#d274a5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 18,
    marginBottom: 20,
    fontSize: 18,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff5f7',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f6d6e6',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  messageIcon: { fontSize: 20, marginRight: 10 },
  info: { flex: 1 },
  name: { color: '#c81b78', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  phone: { color: '#666', fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  icon: { fontSize: 18, marginLeft: 10 },
});

export default ContactList;
