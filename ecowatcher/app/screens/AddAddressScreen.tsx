import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../../firebaseConfig"; 
import CONFIG from './../config';

type RootStackParamList = {
  Penyetoran: undefined;
};

export default function AddAddressScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Variabel state untuk field form
  const [nama, setNama] = useState("");
  const [noTlp, setNoTlp] = useState("");
  const [labelAlamat, setLabelAlamat] = useState("");
  const [kotaKabupaten, setKotaKabupaten] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kodePos, setKodePos] = useState("");
  const [detailAlamat, setDetailAlamat] = useState("");

  // Ambil data pengguna
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Ambil userId dari AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "ID pengguna tidak ditemukan");
        return;
      }

      // Cek apakah nama pengguna sudah ada di AsyncStorage
      const userNama = await AsyncStorage.getItem("userNama");
      if (userNama) {
        setNama(userNama); // Set nama jika ada
        return;
      }

      // Jika nama pengguna belum ada di AsyncStorage, ambil dari Firestore
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setNama(userData.nama); // Set nama pengguna dari Firestore
        // Simpan nama pengguna ke AsyncStorage untuk penggunaan selanjutnya
        await AsyncStorage.setItem("userNama", userData.nama);
      } else {
        Alert.alert("Error", "Data pengguna tidak ditemukan di Firestore");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Gagal mengambil data pengguna");
    }
  };

  const handleSaveAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // Ambil ID pengguna dari AsyncStorage

      if (!userId) {
        Alert.alert("Error", "ID pengguna tidak ditemukan");
        return;
      }

      const addressData = {
        userId,
        nama,
        noTlp,
        labelAlamat,
        kotaKabupaten,
        kecamatan,
        kodePos,
        detailAlamat,
      };

      // Menggunakan fetch untuk mengirim data alamat ke backend
      const response = await fetch(`${CONFIG.API_URL}/api/add-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        // Navigasi ke halaman 'Penyetoran'
        navigation.navigate("Penyetoran");
      } else {
        Alert.alert("Error", "Gagal menambahkan alamat");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Gagal menambahkan alamat");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      {/* Informasi Pemilik */}
      <View>
        <Text style={{ fontSize: 14, fontWeight: "400", marginBottom: 8 }}>
          Informasi Pemilik
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Nama
        </Text>
        <TextInput
          value={nama}
          onChangeText={setNama}
          placeholder="Masukkan nama lengkap!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          No. Handphone
        </Text>
        <TextInput
          value={noTlp}
          onChangeText={setNoTlp}
          placeholder="Masukkan nomor handphone!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Label Alamat
        </Text>
        <TextInput
          value={labelAlamat}
          onChangeText={setLabelAlamat}
          placeholder="Masukkan label alamat!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
      </View>

      {/* Alamat */}
      <View>
        <Text style={{ fontSize: 14, fontWeight: "400", marginBottom: 8 }}>
          Alamat
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Kota / Kabupaten
        </Text>
        <TextInput
          value={kotaKabupaten}
          onChangeText={setKotaKabupaten}
          placeholder="Masukkan kota atau kabupaten!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Kecamatan
        </Text>
        <TextInput
          value={kecamatan}
          onChangeText={setKecamatan}
          placeholder="Masukkan kecamatan!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Kode Pos
        </Text>
        <TextInput
          value={kodePos}
          onChangeText={setKodePos}
          placeholder="Masukkan kode pos!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Detail Lain
        </Text>
        <TextInput
          value={detailAlamat}
          onChangeText={setDetailAlamat}
          placeholder="Masukkan detail alamat!"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
          }}
        />
      </View>

      {/* Button Simpan */}
      <TouchableOpacity
        style={{
          backgroundColor: "#25c05d",
          borderRadius: 10,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
        onPress={handleSaveAddress}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          Simpan Alamat
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
