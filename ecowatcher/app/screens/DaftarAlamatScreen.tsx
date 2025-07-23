import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import CONFIG from "../config";
import analytics from '@react-native-firebase/analytics';

export default function DaftarAlamatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddress, setModalAddress] = useState<any>(null);

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'DaftarAlamat' });
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listenAddresses = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      const q = query(collection(db, "Alamat"), where("userId", "==", userId));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(data);
      });
    };
    listenAddresses();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Daftar Alamat</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddAddress")}>
          <Text style={{ color: "#25c05d", fontWeight: "bold" }}>
            Tambah Alamat
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={{
              backgroundColor: selectedId === addr.id ? "#c6f7df" : "white",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              marginBottom: 20,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            onPress={() => setSelectedId(addr.id)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {addr.label_Alamat || addr.label}
              </Text>
              {(addr.isPrimary || addr.utama) && (
                <View
                  style={{
                    backgroundColor: "#b6f5d8",
                    borderRadius: 4,
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      color: "#25c05d",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    Utama
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 2 }}>
              {addr.Nama || addr.nama}
            </Text>
            <Text style={{ color: "#444", marginBottom: 2 }}>
              {addr.No_tlp || addr.noTlp}
            </Text>
            <Text style={{ color: "#444", marginBottom: 2 }}>
              {addr.Detail_Alamat || addr.detail}
            </Text>
            <Text style={{ color: "#444", marginBottom: 12 }}>
              {addr.Kecamatan || addr.kecamatan}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#f7f7f7",
                  borderRadius: 8,
                  padding: 10,
                  alignItems: "center",
                  marginRight: 8,
                }}
                onPress={() => navigation.navigate("AddAddress", { editAddress: addr })}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  Ubah Alamat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#f7f7f7",
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => { setModalAddress(addr); setModalVisible(true); }}
              >
                <Text style={{ fontSize: 24 }}>...</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Modal detail alamat */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: '85%' }}>
            {modalAddress && (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 14, textAlign: 'center' }}>Detail Alamat</Text>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2 }}>Label: <Text style={{ fontWeight: 'normal' }}>{modalAddress.label_Alamat || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Nama: <Text style={{ fontWeight: 'normal' }}>{modalAddress.Nama || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>No. HP: <Text style={{ fontWeight: 'normal' }}>{modalAddress.No_tlp || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Kota/Kabupaten: <Text style={{ fontWeight: 'normal' }}>{modalAddress['kota-kabupaten'] || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Kecamatan: <Text style={{ fontWeight: 'normal' }}>{modalAddress.Kecamatan || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Kode Pos: <Text style={{ fontWeight: 'normal' }}>{modalAddress.Kode_pos || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Blok/No: <Text style={{ fontWeight: 'normal' }}>{modalAddress.Blok_No || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>RT/RW: <Text style={{ fontWeight: 'normal' }}>{modalAddress.rtRw || '-'}</Text></Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>Detail: <Text style={{ fontWeight: 'normal' }}>{modalAddress.Detail_Alamat || '-'}</Text></Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#e74c3c', borderRadius: 8, padding: 12, marginTop: 10 }}
                  onPress={async () => {
                    Alert.alert(
                      'Hapus Alamat',
                      'Apakah Anda yakin ingin menghapus alamat ini?',
                      [
                        { text: 'Batal', style: 'cancel' },
                        {
                          text: 'Hapus', style: 'destructive', onPress: async () => {
                            try {
                              await deleteDoc(doc(db, 'Alamat', modalAddress.id));
                              setAddresses(prev => prev.filter(a => a.id !== modalAddress.id));
                              setModalVisible(false);
                            } catch (e) {
                              Alert.alert('Gagal', 'Gagal menghapus alamat.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Hapus Alamat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginTop: 10, borderRadius: 8, padding: 12, backgroundColor: '#eee' }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ textAlign: 'center', color: '#333' }}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={{
          backgroundColor: selectedId ? "#25c05d" : "#BDBDBD",
          borderRadius: 24,
          margin: 16,
          paddingVertical: 14,
          alignItems: "center",
        }}
        disabled={!selectedId}
        onPress={async () => {
          const selectedAddress = addresses.find((addr) => addr.id === selectedId);
          await AsyncStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
          navigation.goBack();
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          Pilih Alamat
        </Text>
      </TouchableOpacity>
    </View>
  );
}
