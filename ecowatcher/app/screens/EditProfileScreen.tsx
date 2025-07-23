import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userDocId, setUserDocId] = useState('');
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noRekening: '',
    namaRekening: '',
    jenisBank: '',
    foto: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserDocId(userDoc.id);
        const data = userDoc.data();
        setForm({
          nama: data.nama || '',
          email: data.email || '',
          noRekening: data.noRekening || '',
          namaRekening: data.namaRekening || '',
          jenisBank: data.jenisBank || '',
          foto: data.foto || '',
        });
      }
    } catch (e) {
      Alert.alert('Gagal', 'Tidak bisa mengambil data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!userDocId) throw new Error('User docId not found');
      const userRef = doc(db, 'users', userDocId);
      await updateDoc(userRef, {
        nama: form.nama,
        noRekening: form.noRekening,
        namaRekening: form.namaRekening,
        jenisBank: form.jenisBank,
        // foto: form.foto, // Untuk update foto, tambahkan upload handler
      });
      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Gagal', 'Tidak bisa menyimpan perubahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={form.foto && form.foto !== 'default.jpg' ? { uri: form.foto } : require('../../assets/images/default.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.profileEmail}>{form.email}</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nama</Text>
        <TextInput
          placeholderTextColor="#888"
          style={{ color: '#222' }}
          value={form.nama}
          onChangeText={nama => setForm({ ...form, nama })}
        />
        <Text style={styles.label}>Nama Rekening</Text>
        <TextInput
          placeholderTextColor="#888"
          style={{ color: '#222' }}
          value={form.namaRekening}
          onChangeText={namaRekening => setForm({ ...form, namaRekening })}
        />
        <Text style={styles.label}>No. Rekening</Text>
        <TextInput
          placeholderTextColor="#888"
          style={{ color: '#222' }}
          value={form.noRekening}
          onChangeText={noRekening => setForm({ ...form, noRekening })}
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Bank</Text>
        <TextInput
          placeholderTextColor="#888"
          style={{ color: '#222' }}
          value={form.jenisBank}
          onChangeText={jenisBank => setForm({ ...form, jenisBank })}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  profileContainer: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 8 },
  profileEmail: { fontSize: 14, color: '#888', marginBottom: 16 },
  formGroup: { marginHorizontal: 24, marginBottom: 24 },
  label: { fontSize: 14, color: '#333', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 15 },
  saveButton: { backgroundColor: '#25C05D', marginHorizontal: 24, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 32 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default EditProfileScreen; 