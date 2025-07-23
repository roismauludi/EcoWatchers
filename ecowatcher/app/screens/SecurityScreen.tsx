import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { auth } from '../../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SecurityScreen = () => {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasUpperCase: false,
  });

  useEffect(() => {
    validatePasswordCriteria(newPassword);
  }, [newPassword]);

  const validatePasswordCriteria = (password: string) => {
    setValidations({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
    });
  };

  const validatePassword = (password: string) => {
    if (!validations.hasMinLength) {
      Alert.alert('Error', 'Password harus minimal 8 karakter');
      return false;
    }
    if (!validations.hasUpperCase) {
      Alert.alert('Error', 'Password harus mengandung minimal 1 huruf kapital');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password baru dan konfirmasi tidak sama');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('User tidak ditemukan');
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Sukses', 'Password berhasil diganti');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidations({ hasMinLength: false, hasUpperCase: false });
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal mengganti password');
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    <AntDesign 
      name={isValid ? "checkcircle" : "closecircle"} 
      size={16} 
      color={isValid ? "#4CAF50" : "#FF5252"}
      style={{ marginRight: 8 }}
    />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header dengan tombol back dan judul */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 10, marginLeft: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Pengaturan Keamanan</Text>
      </View>
      {/* Konten form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password Lama</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: '#222' }]}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOld}
            placeholder="Masukkan password lama"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowOld(!showOld)}>
            <Ionicons name={showOld ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Password Baru</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: '#222' }]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            placeholder="Min. 8 karakter, 1 huruf kapital"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Validation Indicators */}
        <View style={styles.validationContainer}>
          <View style={styles.validationItem}>
            <ValidationIcon isValid={validations.hasMinLength} />
            <Text style={[styles.validationText, validations.hasMinLength && styles.validText]}>
              Minimal 8 karakter
            </Text>
          </View>
          <View style={styles.validationItem}>
            <ValidationIcon isValid={validations.hasUpperCase} />
            <Text style={[styles.validationText, validations.hasUpperCase && styles.validText]}>
              Mengandung huruf kapital
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Konfirmasi Password Baru</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: '#222' }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Ulangi password baru"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Menyimpan...' : 'Ganti Password'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  formGroup: { marginHorizontal: 24, marginTop: 32, marginBottom: 24 },
  label: { fontSize: 14, color: '#333', marginBottom: 4, marginTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 15 },
  eyeIcon: { position: 'absolute', right: 12, padding: 4 },
  saveButton: { backgroundColor: '#25C05D', marginHorizontal: 24, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 32 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  validationContainer: { marginTop: 8, marginBottom: 16 },
  validationItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  validationText: { fontSize: 14, color: '#666' },
  validText: { color: '#4CAF50' },
});

export default SecurityScreen; 