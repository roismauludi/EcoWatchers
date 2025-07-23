import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../../firebaseConfig"; 
import CONFIG from '../config';
import { Picker } from '@react-native-picker/picker';
import analytics from '@react-native-firebase/analytics';

type RootStackParamList = {
  Penyetoran: undefined;
};

export default function AddAddressScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const editAddress = (route.params as any)?.editAddress;

  // Variabel state untuk field form
  const [nama, setNama] = useState("");
  const [noTlp, setNoTlp] = useState("");
  const [labelAlamat, setLabelAlamat] = useState("");
  const [kotaKabupaten, setKotaKabupaten] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kodePos, setKodePos] = useState("");
  const [detailAlamat, setDetailAlamat] = useState("");
  const [blokNo, setBlokNo] = useState("");
  const [rtRw, setRtRw] = useState("");

  // Daftar kecamatan Batam
  const kecamatanBatam = [
    'Batam Kota',
    'Lubuk Baja',
    'Batu Ampar',
    'Bengkong',
    'Sei Beduk',
    'Nongsa',
    'Sekupang',
    'Batu Aji',
    'Sagulung',
    'Belakang Padang',
    'Bulang',
    'Galang',
  ];

  // Ambil data pengguna & autofill jika edit
  useEffect(() => {
    fetchUserData();
    if (editAddress) {
      setNama(editAddress.Nama || "");
      setNoTlp(editAddress.No_tlp || "");
      setLabelAlamat(editAddress.label_Alamat || "");
      setKotaKabupaten(editAddress["kota-kabupaten"] || "");
      setKecamatan(editAddress.Kecamatan || "");
      setKodePos(editAddress.Kode_pos || "");
      setDetailAlamat(editAddress.Detail_Alamat || "");
      setBlokNo(editAddress.Blok_No || "");
      setRtRw(editAddress.RT && editAddress.RW ? `${editAddress.RT}/${editAddress.RW}` : (editAddress.rtRw || ""));
    }
  }, [editAddress]);

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'AddAddress' });
  }, []);

  const fetchUserData = async () => {
    try {
      // Ambil userId dari AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "ID pengguna tidak ditemukan");
        return;
      }
      // Selalu ambil dari Firestore, jangan dari AsyncStorage
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setNama(userData.nama); // Set nama pengguna dari Firestore
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
        blokNo,
        rtRw,
      };

      if (editAddress && editAddress.id) {
        // MODE EDIT: update alamat
        const response = await fetch(`${CONFIG.API_URL}/api/edit-address/${editAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        if (response.ok) {
          navigation.goBack();
        } else {
          Alert.alert("Error", "Gagal mengupdate alamat");
        }
      } else {
        // MODE TAMBAH: tambah alamat baru
        const response = await fetch(`${CONFIG.API_URL}/api/add-address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        if (response.ok) {
          navigation.goBack();
        } else {
          Alert.alert("Error", "Gagal menambahkan alamat");
        }
      }
    } catch (error) {
      console.error("Error adding/updating address:", error);
      Alert.alert("Error", "Gagal menyimpan alamat");
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
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          No. Handphone
        </Text>
        <TextInput
          value={noTlp}
          onChangeText={setNoTlp}
          placeholder="Masukkan nomor handphone!"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Label Alamat
        </Text>
        <TextInput
          value={labelAlamat}
          onChangeText={setLabelAlamat}
          placeholder="Masukkan label alamat!"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
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
        <View style={{ borderWidth: 1, borderColor: "#D3D3D3", borderRadius: 4, marginBottom: 16 }}>
          <Picker
            selectedValue={kotaKabupaten}
            onValueChange={setKotaKabupaten}
            style={{ color: '#222' }}
          >
            <Picker.Item label="Pilih Kota/Kabupaten" value="" />
            <Picker.Item label="Batam" value="Batam" />
          </Picker>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Kecamatan
        </Text>
        {kotaKabupaten.trim().toLowerCase() === 'batam' ? (
          <View style={{ borderWidth: 1, borderColor: "#D3D3D3", borderRadius: 4, marginBottom: 16 }}>
            <Picker
              selectedValue={kecamatan}
              onValueChange={setKecamatan}
              style={{ color: '#222' }}
            >
              <Picker.Item label="Pilih kecamatan" value="" />
              {kecamatanBatam.map((kec) => (
                <Picker.Item key={kec} label={kec} value={kec} />
              ))}
            </Picker>
          </View>
        ) : (
          <TextInput
            value={kecamatan}
            onChangeText={setKecamatan}
            placeholder="Masukkan kecamatan!"
            placeholderTextColor="#888"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#D3D3D3",
              marginBottom: 16,
              paddingVertical: 4,
              color: '#222',
            }}
          />
        )}
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Kode Pos
        </Text>
        <TextInput
          value={kodePos}
          onChangeText={setKodePos}
          placeholder="Masukkan kode pos!"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Detail Lain
        </Text>
        <TextInput
          value={detailAlamat}
          onChangeText={setDetailAlamat}
          placeholder="Masukkan detail alamat!"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Blok / No. Rumah
        </Text>
        <TextInput
          value={blokNo}
          onChangeText={setBlokNo}
          placeholder="Masukkan blok atau nomor rumah!"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          RT/RW
        </Text>
        <TextInput
          value={rtRw}
          onChangeText={setRtRw}
          placeholder="Contoh: 02/05"
          placeholderTextColor="#888"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#D3D3D3",
            marginBottom: 16,
            paddingVertical: 4,
            color: '#222',
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
