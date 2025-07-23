// ecowatcher/app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Pastikan Anda mengimpor LinearGradient
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import DeviceInfo from 'react-native-device-info';

// Definisikan tipe untuk routes
type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Profile: undefined;
  Register: undefined;
  AdminDashboard: undefined;
  EditProfile: undefined;
  Security: undefined;
};

// Definisikan tipe untuk navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Definisikan interface untuk userData
interface UserData {
  nama: string;
  email: string;
  noRekening: string;
  namaRekening: string;
  jenisBank: string;
  level: string;
  foto: string; // Ubah tipe foto menjadi string
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [userData, setUserData] = useState<UserData>({
    nama: '',
    email: '',
    noRekening: '',
    namaRekening: '',
    jenisBank: '',
    level: '',
    foto: '', // Simpan sebagai string
  });

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'Profile' });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      console.log('Fetching data for email:', userEmail); // Debugging

      if (!userEmail) {
        Alert.alert('Error', 'Sesi pengguna tidak ditemukan');
        navigation.replace('Login');
        return;
      }

      const usersRef = collection(db, 'users');
      console.log('DEBUG DB ProfileScreen:', db);
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data() as UserData;
        console.log('User data fetched:', data); // Debugging
        setUserData({
          nama: data.nama || '',
          email: data.email || '',
          noRekening: data.noRekening || '',
          namaRekening: data.namaRekening || '',
          jenisBank: data.jenisBank || '',
          level: data.level || '',
          foto: data.foto || '', // Simpan foto sebagai string
        });
      } else {
        console.log('No user data found'); // Debugging
        Alert.alert('Error', 'Data pengguna tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Gagal mengambil data pengguna');
    }
  };

  const handleLogout = async () => {
    try {
      // Hapus hanya data sesi pengguna
      await AsyncStorage.multiRemove([
        'userEmail',
        'userLevel'
      ]);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Gagal keluar dari aplikasi');
    }
  };
   
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header dengan gambar profil dan info pengguna */}
      <LinearGradient colors={["#2ECC71", "#27AE60"]} style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={userData.foto && userData.foto !== "default.jpg" ? { uri: userData.foto } : require('../../assets/images/default.jpg')} // Gunakan foto dari data pengguna atau gambar default
            style={styles.profileImage}
            onError={() => {
              console.log('Error loading image, using default image'); // Debugging
              setUserData((prev) => ({ ...prev, foto: require('../../assets/images/default.jpg') })); // Jika ada error, gunakan foto default
            }}
          />
          <Text style={styles.profileName}>{userData.nama}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
          <Text style={styles.profileLevel}>{userData.level}</Text>
        </View>
      </LinearGradient>

      {/* Info Rekening */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Informasi Rekening</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bank:</Text>
          <Text style={styles.infoValue}>{userData.jenisBank}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nama Rekening:</Text>
          <Text style={styles.infoValue}>{userData.namaRekening}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>No. Rekening:</Text>
            <Text style={styles.infoValue}>
              {userData.noRekening.length > 3 
              ? userData.noRekening.slice(0, -3) + '***' 
              : '***'} {/* Menyembunyikan tiga digit terakhir */}
        </Text>
        </View>
      </View>

      {/* Pengaturan Aplikasi */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pengaturan Aplikasi</Text>
        <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.sectionText}>Pengaturan Profil</Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Security')}>
          <Text style={styles.sectionText}>Pengaturan Keamanan</Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Informasi Umum */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Informasi Umum</Text>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.sectionText}>Tentang Kami</Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.sectionText}>Syarat & Ketentuan</Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem}>
          <Text style={styles.sectionText}>Kebijakan Privasi</Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Tombol Keluar dan Versi Aplikasi */}
      <View style={{alignItems: 'center', marginHorizontal: 16, marginTop: 24}}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>
          Versi Aplikasi {DeviceInfo.getVersion()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    alignItems: "center",
    position: 'relative',
    marginTop: 40, // Tambahkan margin untuk menghindari tumpang tindih
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
    marginBottom: 10, // Tambahkan margin bawah untuk memberi jarak
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white", // Ubah warna teks menjadi putih agar terlihat di latar belakang hijau
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 5,
    color: "white", // Ubah warna teks menjadi putih agar terlihat di latar belakang hijau
  },
  profileLevel: {
    fontSize: 14,
    marginTop: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    color: "white", // Ubah warna teks menjadi putih agar terlihat di latar belakang hijau
  },
  sectionContainer: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#27AE60",
    marginBottom: 10,
    fontWeight: "bold",
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionText: {
    fontSize: 16,
    color: "#333",
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: '100%',
    // marginHorizontal: 16, // dipindah ke View luar
    // marginTop: 24, // dipindah ke View luar
    // marginBottom: 80, // dihapus agar tidak mendorong versi aplikasi ke bawah
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#888",
    marginTop: 12,
    fontSize: 12,
  },
});

export default ProfileScreen;