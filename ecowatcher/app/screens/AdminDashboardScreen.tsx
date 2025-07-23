import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Entypo, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CampaignDetailScreen from './CampaignDetailScreen';
import CONFIG from '../config';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { RootStackParamList } from '../../utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const API_URL = `${CONFIG.API_URL}/api/campaigns`;

const AdminDashboardScreen = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>("ongoing");
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    registerLink: 'https://whatsapp.com/channel/0029VbBQBGS0Vyc9DV9IzL0k',
    description: '',
    image: null as any,
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pickupFee, setPickupFee] = useState<number>(500);
  const [feeInput, setFeeInput] = useState('500');
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeKecamatan, setFeeKecamatan] = useState<any>({});
  const [feeKecamatanLoading, setFeeKecamatanLoading] = useState(false);
  const [feeKecamatanEdit, setFeeKecamatanEdit] = useState<any>({});
  const [newKecamatan, setNewKecamatan] = useState('');
  const [newFee, setNewFee] = useState('');
  const [mapRegion, setMapRegion] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(data);
    });
    return () => unsubscribe();
  }, []);

  // Fetch biaya penjemputan dari backend saat mount
  useEffect(() => {
    const fetchFee = async () => {
      setFeeLoading(true);
      try {
        // Ganti endpoint sesuai backend jika sudah ada
        const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee`);
        if (res.ok) {
          const data = await res.json();
          setPickupFee(data.fee);
          setFeeInput(String(data.fee));
        } else {
          setPickupFee(500);
          setFeeInput('500');
        }
      } catch {
        setPickupFee(500);
        setFeeInput('500');
      }
      setFeeLoading(false);
    };
    fetchFee();
  }, []);

  // Ambil mapping biaya per kecamatan saat mount
  useEffect(() => {
    const fetchFeeKecamatan = async () => {
      setFeeKecamatanLoading(true);
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee-kecamatan`);
        if (res.ok) {
          const data = await res.json();
          setFeeKecamatan(data.mapping || {});
          setFeeKecamatanEdit(data.mapping || {});
        }
      } catch {}
      setFeeKecamatanLoading(false);
    };
    fetchFeeKecamatan();
  }, []);

  // Update biaya penjemputan
  const handleUpdateFee = async () => {
    if (!feeInput || isNaN(Number(feeInput)) || Number(feeInput) < 0) {
      Alert.alert('Error', 'Masukkan biaya penjemputan yang valid!');
      return;
    }
    setFeeLoading(true);
    try {
      // Ganti endpoint sesuai backend jika sudah ada
      const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee: Number(feeInput) })
      });
      if (res.ok) {
        setPickupFee(Number(feeInput));
        Alert.alert('Sukses', 'Biaya penjemputan berhasil diubah!');
      } else {
        Alert.alert('Error', 'Gagal mengubah biaya penjemputan!');
      }
    } catch {
      Alert.alert('Error', 'Gagal mengubah biaya penjemputan!');
    }
    setFeeLoading(false);
  };

  const handleFeeKecamatanChange = (kec: string, value: string) => {
    setFeeKecamatanEdit({ ...feeKecamatanEdit, [kec]: value.replace(/[^0-9]/g, '') });
  };

  const handleSaveFeeKecamatan = async () => {
    setFeeKecamatanLoading(true);
    try {
      // Konversi semua value ke number
      const mapping = Object.fromEntries(Object.entries(feeKecamatanEdit).map(([k, v]) => [k, Number(v)]));
      const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee-kecamatan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapping })
      });
      if (res.ok) {
        setFeeKecamatan(mapping);
        Alert.alert('Sukses', 'Biaya per kecamatan berhasil diubah!');
      } else {
        Alert.alert('Error', 'Gagal mengubah biaya per kecamatan!');
      }
    } catch {
      Alert.alert('Error', 'Gagal mengubah biaya per kecamatan!');
    }
    setFeeKecamatanLoading(false);
  };

  const handleAddKecamatan = () => {
    const nama = newKecamatan.trim();
    const fee = newFee.trim();
    if (!nama || !fee || isNaN(Number(fee))) {
      Alert.alert('Error', 'Nama kecamatan dan biaya harus diisi dengan benar!');
      return;
    }
    if (feeKecamatanEdit[nama]) {
      Alert.alert('Error', 'Kecamatan sudah ada!');
      return;
    }
    setFeeKecamatanEdit({ ...feeKecamatanEdit, [nama]: Number(fee) });
    setNewKecamatan('');
    setNewFee('');
  };

  const handleInput = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, image: { uri: result.assets[0].uri } });
    }
  };

  const openMap = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setForm({ ...form, latitude: null, longitude: null });
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.0015,
        longitudeDelta: 0.0015,
      });
      setShowMap(true);
    } else {
      Alert.alert('Izin lokasi diperlukan untuk memilih lokasi di map');
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    let address = '';
    try {
      let res = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (res && res.length > 0) {
        address = `${res[0].name || ''} ${res[0].street || ''}, ${res[0].city || ''}`;
      }
    } catch (err) {}
    setForm({ ...form, latitude, longitude, location: (address ? address + ` (${latitude},${longitude})` : `${latitude},${longitude}`) });
    setShowMap(false);
  };

  const handleMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    let address = '';
    try {
      let res = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (res && res.length > 0) {
        address = `${res[0].name || ''} ${res[0].street || ''}, ${res[0].city || ''}`;
      }
    } catch (err) {}
    setForm({ ...form, latitude, longitude, location: address || `${latitude},${longitude}` });
  };

  const handlePoiClick = (e: any) => {
    const { coordinate, name } = e.nativeEvent;
    setForm({
      ...form,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      location: name || `${coordinate.latitude},${coordinate.longitude}`,
    });
    setShowMap(false);
  };

  const handleAddCampaign = async () => {
    if (!form.title || !form.date || !form.location || !form.organizer) {
      Alert.alert('Error', 'Semua field harus diisi!');
      return;
    }
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('title', form.title);
      formData.append('date', form.date);
      formData.append('time', form.time);
      formData.append('location', form.location);
      formData.append('organizer', form.organizer);
      formData.append('registerLink', form.registerLink);
      formData.append('description', form.description);
      formData.append('status', 'ongoing');
      formData.append('latitude', String(form.latitude) || '');
      formData.append('longitude', String(form.longitude) || '');
      if (form.image && form.image.uri) {
        const uriParts = form.image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: form.image.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      if (!res.ok) throw new Error('Gagal tambah campaign');
      setModalVisible(false);
      setForm({ title: '', date: '', time: '', location: '', organizer: '', registerLink: 'https://whatsapp.com/channel/0029VbBQBGS0Vyc9DV9IzL0k', description: '', image: null, latitude: null, longitude: null });
    } catch (e) {
      Alert.alert('Error', 'Gagal menambah campaign, cek koneksi atau backend!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userEmail', 'userLevel', 'userId']);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      Alert.alert('Error', 'Gagal logout');
    }
  };

  const handlePressCampaign = (item: any) => {
    navigation.navigate('CampaignDetail', { campaign: item });
  };

  const renderCampaign = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePressCampaign(item)}>
      <Image
        source={{ uri: `${CONFIG.API_URL}${item.image}` }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.organizer}>{item.organizer}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <FontAwesome5 name="calendar-alt" size={12} color="#999" />
          <Text style={styles.metaText}> {item.date}</Text>
          <Entypo
            name="location-pin"
            size={14}
            color="#999"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Buat Campaign</Text>
        </TouchableOpacity>
      </View>

      {/* Pengaturan Biaya Penjemputan per Kecamatan */}
      <View style={[styles.feeBox, { marginTop: 12, backgroundColor: '#f7f7f7', borderWidth: 1, borderColor: '#e0e0e0' }]}>
        <Text style={[styles.feeLabel, { marginBottom: 8 }]}>Biaya Penjemputan per Kecamatan:</Text>
        {/* Form tambah kecamatan baru */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TextInput
            style={[styles.feeInput, { flex: 2, marginRight: 8, color: '#222' }]}
            placeholder="Nama Kecamatan"
            value={newKecamatan}
            onChangeText={setNewKecamatan}
            placeholderTextColor="#888"
            editable={!feeKecamatanLoading}
          />
          <TextInput
            style={[styles.feeInput, { flex: 1, marginRight: 8, color: '#222' }]}
            placeholder="Biaya"
            value={newFee}
            onChangeText={setNewFee}
            keyboardType="numeric"
            placeholderTextColor="#888"
            editable={!feeKecamatanLoading}
          />
          <TouchableOpacity style={[styles.feeSaveButton, { paddingHorizontal: 12 }]} onPress={handleAddKecamatan} disabled={feeKecamatanLoading}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tambah</Text>
          </TouchableOpacity>
        </View>
        {feeKecamatanLoading ? (
          <ActivityIndicator size="small" color="#25c05d" />
        ) : (
          <ScrollView style={{ maxHeight: 300 }}>
            {Object.keys(feeKecamatanEdit).length === 0 && (
              <Text style={{ color: '#888', fontStyle: 'italic' }}>Belum ada data kecamatan.</Text>
            )}
            {Object.entries(feeKecamatanEdit).map(([kec, fee]: any) => (
              <View key={kec} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ flex: 1 }}>{kec}</Text>
                <TextInput
                  style={[styles.feeInput, { flex: 1, marginLeft: 8, color: '#222' }]}
                  value={String(fee)}
                  onChangeText={v => handleFeeKecamatanChange(kec, v)}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                  editable={!feeKecamatanLoading}
                />
              </View>
            ))}
            <TouchableOpacity style={[styles.feeSaveButton, { marginTop: 8 }]} onPress={handleSaveFeeKecamatan} disabled={feeKecamatanLoading}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{feeKecamatanLoading ? 'Menyimpan...' : 'Simpan Semua'}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
          onPress={() => setActiveTab("ongoing")}
        >
          <Text style={[styles.tabText, activeTab === "ongoing" && styles.activeTabText]}>Berlangsung</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ended" && styles.activeTab]}
          onPress={() => setActiveTab("ended")}
        >
          <Text style={[styles.tabText, activeTab === "ended" && styles.activeTabText]}>Berakhir</Text>
        </TouchableOpacity>
      </View>

      {/* List Campaign */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={campaigns.filter((c: any) => c.status === (activeTab === 'ongoing' ? 'ongoing' : 'ended'))}
          renderItem={renderCampaign}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal Form Tambah Campaign */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buat Campaign Baru</Text>
            <ScrollView>
              <TextInput
                style={[styles.input, { color: '#222' }]}
                placeholder="Judul Campaign"
                value={form.title}
                onChangeText={(text) => handleInput('title', text)}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: form.date ? '#333' : '#aaa' }}>{form.date || 'Pilih Tanggal Campaign'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date ? new Date(form.date) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const tgl = selectedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                      setForm({ ...form, date: tgl });
                    }
                  }}
                />
              )}
              <TextInput
                style={[styles.input, { color: '#222' }]}
                placeholder="Jam (cth: 09.00–10.30 WIB)"
                value={form.time}
                onChangeText={(text) => handleInput('time', text)}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.input} onPress={openMap}>
                <Text style={{ color: form.location ? '#333' : '#aaa' }}>{form.location ? form.location : 'Pilih Lokasi di Map'}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: '#222' }]}
                placeholder="Edit Nama Lokasi (opsional)"
                value={form.location}
                onChangeText={(text) => handleInput('location', text)}
                placeholderTextColor="#888"
              />
              {showMap && (
                <Modal visible={showMap} animationType="slide">
                  <View style={{ flex: 1 }}>
                    {!userLocation ? (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Memuat lokasi Anda...</Text>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        <MapView
                          style={{ flex: 1 }}
                          region={form.latitude && form.longitude ? {
                            latitude: form.latitude,
                            longitude: form.longitude,
                            latitudeDelta: 0.0015,
                            longitudeDelta: 0.0015,
                          } : mapRegion}
                          onPress={handleMapPress}
                          onPoiClick={handlePoiClick}
                          mapType="hybrid"
                        >
                          {form.latitude && form.longitude ? (
                            <Marker
                              coordinate={{ latitude: form.latitude, longitude: form.longitude }}
                              draggable
                              onDragEnd={handleMarkerDragEnd}
                            />
                          ) : (
                            <Marker
                              coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                              pinColor="#22B07D"
                            />
                          )}
                        </MapView>
                      </View>
                    )}
                    <TouchableOpacity style={{ padding: 16, backgroundColor: '#22B07D' }} onPress={() => setShowMap(false)}>
                      <Text style={{ color: '#fff', textAlign: 'center' }}>Tutup</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
              )}
              <TextInput
                style={[styles.input, { color: '#222' }]}
                placeholder="Penyelenggara"
                value={form.organizer}
                onChangeText={(text) => handleInput('organizer', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, { height: 80, color: '#222' }]}
                placeholder="Deskripsi Campaign"
                value={form.description}
                onChangeText={(text) => handleInput('description', text)}
                multiline
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={{ color: '#22B07D' }}>{form.image ? 'Ganti Gambar' : 'Pilih Gambar'}</Text>
              </TouchableOpacity>
              {form.image && (
                <Image source={form.image} style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 8 }} />
              )}
              <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.7 }]}
                onPress={handleAddCampaign}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#22B07D' }}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#22B07D",
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    marginLeft: 12,
    backgroundColor: '#E74C3C',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f2f2f2",
  },
  activeTab: {
    borderBottomColor: "#22B07D",
  },
  tabText: {
    fontSize: 14,
    color: "#aaa",
  },
  activeTabText: {
    color: "#22B07D",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  organizer: {
    fontSize: 12,
    color: "#22B07D",
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22B07D',
    marginBottom: 16,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  imagePicker: {
    backgroundColor: '#E0F7EF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#22B07D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#E0F7EF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  feeBox: {
    backgroundColor: '#E0F7EF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  feeLabel: {
    fontSize: 15,
    color: '#22B07D',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feeValue: {
    fontSize: 18,
    color: '#22B07D',
    fontWeight: 'bold',
    marginRight: 12,
  },
  feeInput: {
    borderWidth: 1,
    borderColor: '#22B07D',
    borderRadius: 8,
    padding: 8,
    width: 90,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  feeSaveButton: {
    backgroundColor: '#22B07D',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default AdminDashboardScreen; 