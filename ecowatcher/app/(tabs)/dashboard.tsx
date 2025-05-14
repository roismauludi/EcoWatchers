// ecowatcher/app/(tabs)/dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EcoPoinCard from "../../components/EcoPoinCard";
import ActionSection from "../../components/ActionSection";

// Impor gambar default
const defaultPhoto = require('../../assets/images/default.jpg'); // Gambar default

// Buat objek untuk memetakan nama file ke gambar
const imageMap: { [key: string]: any } = {
  'default.jpg': defaultPhoto,
};

const { width } = Dimensions.get("window");

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

interface UserData {
  nama: string;
  foto: string; // Ubah tipe foto menjadi string
}

function Dashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [userData, setUserData] = useState<UserData>({
    nama: 'Pengguna',
    foto: defaultPhoto, // Foto default
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert('Error', 'Sesi pengguna tidak ditemukan');
        navigation.replace('Login');
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data() as UserData;
        console.log('User data fetched:', data); // Debugging
        console.log('User photo name:', data.foto); // Debugging

        // Menentukan gambar berdasarkan nama file
        const userPhoto = imageMap[data.foto] || defaultPhoto; // Gunakan gambar dari imageMap

        setUserData({
          nama: data.nama || 'Pengguna',
          foto: userPhoto, // Pastikan foto diambil dengan benar
        });
      } else {
        Alert.alert('Error', 'Data pengguna tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Gagal mengambil data pengguna');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={typeof userData.foto === 'number' ? userData.foto : { uri: userData.foto }} // Pastikan foto ditampilkan dengan benar
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Selamat Datang</Text>
            <Text style={styles.username}>{userData.nama}</Text>
          </View>
        </View>
      </View>

      {/* EcoPoint Section */}
      <View>
        <EcoPoinCard />
      </View>

      {/* Actions Section */}
      <View style={styles.actions}>
        <ActionSection />
      </View>

      {/* Blog Section */}
      {/* <View style={styles.blogSection}>
        <Text style={styles.blogSectionTitle}>Artikel Terbaru</Text> */}
        {/* Konten blog lainnya */}
        {/* <View style={styles.container}>
          <Text style={styles.title}>Edukasi Pengelolaan Sampah</Text>
          <Text style={styles.text}>
            1. Pisahkan sampah organik dan anorganik.{'\n'}
            2. Gunakan kembali barang-barang yang masih bisa didaur ulang.{'\n'}
            3. Kurangi penggunaan plastik sekali pakai.
          </Text>
        </View>
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  userPoint: {
    color: "#fff",
    fontSize: 16,
  },
  actions: {
    marginTop: 20,
  },
  blogSection: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  blogSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Dashboard;