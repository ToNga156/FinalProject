import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { getUserById, updateUserProfile, loginUser } from '../../database';

// Import react-native-image-picker
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

type ProfileScreenProps = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

const ProfileScreen = ({ route }: ProfileScreenProps) => {
  const navigation = useNavigation();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    phone: '',
    address: ''
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    newPassword?: string;
    confirmPassword?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userData = await getUserById(user.id);
      if (userData) {
        setFormData({
          username: userData.username,
          password: '',
          newPassword: '',
          confirmPassword: '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
        setAvatarUri(userData.avatar || null);
        // Cập nhật user trong context để có thông tin mới nhất
        login(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      username?: string;
      password?: string;
      newPassword?: string;
      confirmPassword?: string;
      email?: string;
      phone?: string;
      address?: string;
    } = {};

    // Validation username
    if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Validation password (chỉ kiểm tra nếu muốn thay đổi)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu hiện tại';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    // Validation email
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validation phone
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    // Validation address
    if (formData.address && formData.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
      saveToPhotos: false,
    };

    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thư viện ảnh',
          onPress: () => {
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              console.log('ImagePicker Response:', JSON.stringify(response, null, 2));
              
              if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
              }
              
              if (response.errorCode) {
                console.error('ImagePicker Error:', response.errorCode, response.errorMessage);
                let errorMsg = 'Unknown error';
                if (response.errorCode === 'permission') {
                  errorMsg = 'Không có quyền truy cập thư viện ảnh. Vui lòng cấp quyền trong Cài đặt.';
                } else if (response.errorMessage) {
                  errorMsg = response.errorMessage;
                }
                Alert.alert('Lỗi', `Không thể chọn ảnh: ${errorMsg}`);
                return;
              }
              
              if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                const uri = response.assets[0].uri;
                console.log('Selected image URI:', uri);
                setAvatarUri(uri);
              } else {
                console.error('No URI in response');
                Alert.alert('Lỗi', 'Không thể lấy đường dẫn ảnh');
              }
            });
          },
        },
        {
          text: 'Chụp ảnh',
          onPress: () => {
            launchCamera(options, (response: ImagePickerResponse) => {
              console.log('Camera Response:', JSON.stringify(response, null, 2));
              
              if (response.didCancel) {
                console.log('User cancelled camera');
                return;
              }
              
              if (response.errorCode) {
                console.error('Camera Error:', response.errorCode, response.errorMessage);
                let errorMsg = 'Unknown error';
                if (response.errorCode === 'permission') {
                  errorMsg = 'Không có quyền truy cập camera. Vui lòng cấp quyền trong Cài đặt.';
                } else if (response.errorCode === 'camera_unavailable') {
                  errorMsg = 'Camera không khả dụng';
                } else if (response.errorMessage) {
                  errorMsg = response.errorMessage;
                }
                Alert.alert('Lỗi', `Không thể chụp ảnh: ${errorMsg}`);
                return;
              }
              
              if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                const uri = response.assets[0].uri;
                console.log('Captured image URI:', uri);
                setAvatarUri(uri);
              } else {
                console.error('No URI in response');
                Alert.alert('Lỗi', 'Không thể lấy đường dẫn ảnh');
              }
            });
          },
        },
        {
          text: 'Xóa avatar',
          style: 'destructive',
          onPress: () => {
            setAvatarUri(null);
            Alert.alert('Thành công', 'Avatar đã được xóa. Nhấn "Lưu Thông Tin" để cập nhật.');
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Nếu muốn đổi mật khẩu, kiểm tra mật khẩu hiện tại
      let newPassword: string | undefined = undefined;
      if (formData.newPassword) {
        const currentUser = await loginUser(user.username, formData.password);
        if (!currentUser) {
          setErrors({ password: 'Mật khẩu hiện tại không đúng' });
          setSaving(false);
          return;
        }
        newPassword = formData.newPassword;
      }

      // Cập nhật profile
      const usernameToUpdate = formData.username.trim() !== user.username 
        ? formData.username.trim() 
        : undefined;

      await updateUserProfile(
        user.id,
        formData.email.trim() || undefined,
        formData.phone.trim() || undefined,
        formData.address.trim() || undefined,
        usernameToUpdate,
        newPassword,
        avatarUri || undefined
      );

      // Cập nhật lại user data
      const updatedUser = await getUserById(user.id);
      if (updatedUser) {
        // Nếu đổi username, cần cập nhật lại username trong updatedUser
        if (usernameToUpdate) {
          updatedUser.username = usernameToUpdate;
        }
        login(updatedUser);
      }

      // Xóa tất cả errors và reset form password
      setErrors({});
      setFormData({
        ...formData,
        password: '',
        newPassword: '',
        confirmPassword: ''
      });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      
      // Reload để cập nhật avatar
      await loadUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông Tin Cá Nhân</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông Tin Cá Nhân</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông Tin Cá Nhân</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Ảnh đại diện</Text>
          <TouchableOpacity onPress={handlePickImage} style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Tài Khoản</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập *</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                if (errors.username) {
                  setErrors({ ...errors, username: undefined });
                }
              }}
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại (để đổi mật khẩu)</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, newPassword: text });
                if (errors.newPassword) {
                  setErrors({ ...errors, newPassword: undefined });
                }
              }}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
            />
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vai trò</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Liên Hệ</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              placeholder="Nhập email (tùy chọn)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            {!errors.email && formData.email && (
              <Text style={styles.hintText}>
                {validateEmail(formData.email) ? '✓ Email hợp lệ' : 'Email không hợp lệ'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => {
                // Chỉ cho phép số
                const numericText = text.replace(/[^0-9]/g, '');
                setFormData({ ...formData, phone: numericText });
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined });
                }
              }}
              placeholder="Nhập số điện thoại (tùy chọn)"
              keyboardType="phone-pad"
              maxLength={11}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            {!errors.phone && formData.phone && (
              <Text style={styles.hintText}>
                {validatePhone(formData.phone) ? '✓ Số điện thoại hợp lệ' : 'Số điện thoại không hợp lệ (10-11 số)'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(text) => {
                setFormData({ ...formData, address: text });
                if (errors.address) {
                  setErrors({ ...errors, address: undefined });
                }
              }}
              placeholder="Nhập địa chỉ (tùy chọn)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            {!errors.address && formData.address && (
              <Text style={styles.hintText}>
                {formData.address.trim().length >= 10 ? '✓ Địa chỉ hợp lệ' : 'Địa chỉ phải có ít nhất 10 ký tự'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu Thông Tin</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  backButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center'
  },
  placeholder: {
    width: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 15
  },
  avatarSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0'
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  avatarEditIcon: {
    fontSize: 18
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  changeAvatarButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  changeAvatarText: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  textArea: {
    height: 100,
    paddingTop: 12
  },
  inputError: {
    borderColor: '#ff4444'
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5
  },
  hintText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  saveButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default ProfileScreen;

