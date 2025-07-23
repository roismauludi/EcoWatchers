import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Calendar } from "react-native-calendars";
import { getAuth } from "firebase/auth"; 
import { DateData } from "react-native-calendars";
import moment from "moment";
import 'moment/locale/id'; // Import Indonesian locale
import * as ImagePicker from 'expo-image-picker';
import CONFIG from '../config';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import analytics from '@react-native-firebase/analytics';
import { useSelectedItems } from '../../context/SelectedItemsContext';


type RootStackParamList = {
  PickUp: undefined;
  AddAddress: undefined;
  DaftarAlamat: undefined;
  Penyetoran: { selectedAddress?: any; items?: any[] } | undefined;
  Tong: undefined;
  Catalog: { onSelectItem: (item: any) => void } | undefined;
};

const imageMapping: { [key: string]: any } = {
  "default-sampah.jpg": require("../../assets/images/default-sampah.jpg"),
  "monitor-lcd.jpg": require("../../assets/images/elektronik/monitor-lcd.jpg"),
  "monitor-tabung.jpg": require("../../assets/images/elektronik/monitor-tabung.jpg"),
  "botol_kaca.png": require("../../assets/images/kaca/botol_kaca.png"),
  "pecahan_kaca.jpg": require("../../assets/images/kaca/pecahan_kaca.jpg"),
  "buku.jpg": require("../../assets/images/kertas/buku.jpg"),
  "duplex.jpg": require("../../assets/images/kertas/duplex.jpg"),
  "kardus.png": require("../../assets/images/kertas/kardus.png"),
  "kertas_nota.jpg": require("../../assets/images/kertas/kertas_nota.jpg"),
  "aluminium.png": require("../../assets/images/logam/aluminium.png"),
  "besi-padu.png": require("../../assets/images/logam/besi-padu.png"),
  "kuningan.png": require("../../assets/images/logam/kuningan.png"),
  "kaleng.png": require("../../assets/images/logam/kaleng.png"),
  "minyak_jelantah.jpg": require("../../assets/images/minyak/minyak_jelantah.jpg"),
  "botol-atom.png": require("../../assets/images/plastik/botol-atom.png"),
  "botol_plastik.png": require("../../assets/images/plastik/botol_plastik.png"),
  "ember_plastik.png": require("../../assets/images/plastik/ember_plastik.png"),
  "gelas_plastik.jpg": require("../../assets/images/plastik/gelas_plastik.jpg"),
};

const getImageSource = (imageName: string) => {
  console.log("Image requested:", imageName);  
  return imageMapping[imageName] || imageMapping["default.png"];
};


export default function PenyetoranScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { setSelectedItems } = useSelectedItems();

  // State untuk kontrol modal dan tanggal yang dipilih
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(moment().locale('id').format("dddd, DD MMMM YYYY"));

  // State untuk alamat dan kontrol tampilan alamat
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]); // State untuk menyimpan item sampah yang dikirim dari "tong"

  // State untuk menyimpan foto yang diambil
  const [photos, setPhotos] = useState<string[]>([]);
  const [pickupFee, setPickupFee] = useState<number | null>(null);
  const [feeKecamatan, setFeeKecamatan] = useState<any>({});
  const [feeKecamatanLoading, setFeeKecamatanLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update pickupFee setiap kali selectedAddress atau feeKecamatan berubah
  useEffect(() => {
    if (selectedAddress && selectedAddress.Kecamatan && feeKecamatan) {
      // Normalisasi nama kecamatan agar pencocokan tidak sensitif kapital/spasi
      const kecamatanUser = (selectedAddress.Kecamatan || '').trim().toLowerCase();
      const mappingKeys = Object.keys(feeKecamatan);
      const foundKey = mappingKeys.find(
        k => k.trim().toLowerCase() === kecamatanUser
      );
      const fee = foundKey ? Number(feeKecamatan[foundKey]) : 0;
      setPickupFee(isNaN(fee) ? 0 : fee);
    } else {
      setPickupFee(null);
    }
  }, [selectedAddress, feeKecamatan]);

  // Update selectedAddress jika ada di route.params
  useEffect(() => {
    if (route.params && (route.params as any).selectedAddress) {
      setSelectedAddress((route.params as any).selectedAddress);
    }
  }, [route.params]);

  // Tambahkan useFocusEffect untuk mengambil selectedAddress dari AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const getSelectedAddress = async () => {
        const stored = await AsyncStorage.getItem('selectedAddress');
        if (stored) {
          setSelectedAddress(JSON.parse(stored));
        }
      };
      getSelectedAddress();
    }, [])
  );

  // Fetch mapping biaya per kecamatan dari API saat mount
  useEffect(() => {
    setFeeKecamatanLoading(true);
    const fetchFeeKecamatan = async () => {
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee-kecamatan`);
        if (res.ok) {
          const data = await res.json();
          setFeeKecamatan(data.mapping || {});
        }
      } catch {}
      setFeeKecamatanLoading(false);
    };
    fetchFeeKecamatan();
  }, []);

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'Penyetoran' });
  }, []);


  const fetchAddresses = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/get-addresses/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setAddresses(data);
          // Ambil alamat terpilih dari AsyncStorage
          const stored = await AsyncStorage.getItem('selectedAddress');
          if (stored) {
            const selected = JSON.parse(stored);
            // Cari di data hasil fetch, jika ada, set sebagai selectedAddress
            const found = data.find((addr: any) => addr.id === selected.id);
            if (found) {
              setSelectedAddress(found);
            } else {
              setSelectedAddress(data[0]);
            }
          } else {
            setSelectedAddress(data[0]);
          }
        } else {
          console.error('No addresses found');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const fetchItems = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/get-items/${userId}`);
        const data = await response.json();

        if (response.ok) {
          console.log('Items received:', data);
          setItems(data);  // Menyimpan data item yang diterima
        } else {
          console.error('No items found');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
  };

  useEffect(() => {
    moment.locale("id");
    console.log('Locale setelah diatur:', moment().locale()); // Pastikan "id"

    // Fetch addresses when the component mounts
    fetchAddresses();

    // Ambil items dari navigation jika ada, jika tidak fetch dari server
    if (route.params && (route.params as any).items) {
      setItems((route.params as any).items);
    } else {
      fetchItems();
    }

    // Fetch pickup fee
    const fetchFee = async () => {
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/pickup-fee`);
        if (res.ok) {
          const data = await res.json();
          setPickupFee(data.fee);
        } else {
          setPickupFee(500);
        }
      } catch {
        setPickupFee(500);
      }
    };
    fetchFee();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses(); // Panggil fungsi untuk refresh alamat
  };

  const formattedDate = (dateString: string): string => {
    return moment(dateString).format("dddd, DD MMMM YYYY");
    console.log(formattedDate);
  };

  // Ubah handlePickImage: hanya simpan URI lokal, tidak upload ke ImageKit
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        setPhotos(prevPhotos => [...prevPhotos, fileUri]);
        console.log('Image picked:', fileUri);
      }
    } else {
      Alert.alert('Akses Ditolak', 'Untuk melanjutkan, Anda perlu memberikan izin untuk mengakses kamera.');
    }
  };

  // Ubah handleSubmitWithPhotos: upload semua foto ke ImageKit saat submit
  const handleSubmitWithPhotos = async () => {
    if (isSubmitting) return; // Cegah double submit
    setIsSubmitting(true);
    // Validasi input
    if (!selectedAddress || items.length === 0 || photos.length === 0 || !selectedDate) {
      Alert.alert("Error", "Pastikan semua data sudah diisi.");
      setIsSubmitting(false);
      return;
    }
    // Persiapkan FormData
    const formData = new FormData();
    formData.append("userId", getAuth().currentUser?.uid || "");
    formData.append("address", JSON.stringify(selectedAddress));
    formData.append("items", JSON.stringify(items));
    formData.append("pickUpDate", selectedDate);
    // Kirim file foto satu per satu
    photos.forEach((uri) => {
      const fileName = uri.split("/").pop();
      formData.append("photos", {
        uri,
        name: fileName,
        type: "image/jpeg",
      } as any);
    });
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/submit-pickup`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        await handleDeleteItems(items);
        // Hapus dari state lokal SelectedItemsContext
        setSelectedItems((prev) =>
          prev.filter((item) =>
            !items.some((deleted) => (deleted.id || deleted.itemId) === (item.id || item.id))
          )
        );
        Alert.alert("Sukses", "Penyetoran berhasil dikonfirmasi!");
        navigation.reset({
          index: 0,
          routes: [{ name: "PickUp" }],
        });
      } else {
        console.error("Error from server:", result);
        Alert.alert("Gagal", "Terjadi kesalahan saat mengirim data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fungsi untuk menghapus item setelah penyetoran
  const handleDeleteItems = async (items: Array<{ itemId?: string; id?: string }>) => {
    if (!items || items.length === 0) {
      console.error("Tidak ada item untuk dihapus");
      return;
    }

    try {
      // Loop untuk menghapus setiap item berdasarkan ID-nya
      for (const item of items) {
        const itemId = item.itemId || item.id;
        if (!itemId) {
          console.error("ID item tidak ditemukan");
          continue; // Skip item yang tidak memiliki ID
        }

        const response = await fetch(`${CONFIG.API_URL}/api/delete-item/${itemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log(`Item dengan ID ${itemId} berhasil dihapus`);
        } else {
          const result = await response.json();
          console.error(`Gagal menghapus item dengan ID ${itemId}:`, result);
        }
      }

      // Setelah semua item dihapus, refresh data yang relevan
      // fetchItems();
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus item:", error);
    }
  };

  // Fungsi untuk menambah item sampah
  const handleAddItem = () => {
    navigation.navigate('Catalog', {
      onSelectItem: (item: any) => {
        setItems((prev: any[]) => {
          // Mapping kategori ke type jika perlu
          const mapping: Record<string, string> = {
            Elektronik: "Non-organik-elektronik",
            Kaca: "Non-organik-kaca",
            Kertas: "Non-organik-kertas",
            Logam: "Non-organik-logam",
            Minyak: "Non-organik-minyak",
            Plastik: "Non-organik-plastik",
          };
          const exist = prev.find(i => (i.id || i.itemId) === (item.id || item.itemId));
          const type = item.type || mapping[item.category] || "Non-organik-lainnya";
          const category = item.category || "Tidak Diketahui";
          if (exist) {
            return prev.map(i => (i.id || i.itemId) === (item.id || item.itemId)
              ? { ...i, quantity: (i.quantity || 1) + 1 }
              : i);
          } else {
            return [...prev, { ...item, type, category, quantity: 1 }];
          }
        });
      }
    });
  };

  // Fungsi untuk mengubah quantity item
  const handleChangeItemQuantity = (itemId: string, delta: number) => {
    setItems((prevItems: any[]) => {
      return prevItems.reduce((acc: any[], item) => {
        if (item.id === itemId || item.itemId === itemId) {
          const currentQty = item.quantity || 1;
          const newQty = currentQty + delta;
          if (newQty < 1) {
            // Jika quantity < 1, hapus item
            return acc;
          } else {
            return [...acc, { ...item, quantity: newQty }];
          }
        } else {
          return [...acc, item];
        }
      }, []);
    });
  };
  
  // Validasi input untuk enable/disable tombol
  const isFormValid = !!selectedAddress && items.length > 0 && photos.length > 0 && !!selectedDate;
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
    <ScrollView
    style={{ flex: 1, backgroundColor: "white" }}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  >
    {/* Alamat Penjemputan */}
    <View style={{ paddingHorizontal: 16, paddingVertical: 5 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
          Alamat Penjemputan
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('DaftarAlamat')}> 
          <Text style={{ color: "#25c05d", fontWeight: "bold" }}>
            Pilih Alamat Lain
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : selectedAddress ? (
        <View
          style={{ backgroundColor: "#f3f3f3", borderRadius: 10, padding: 16, marginBottom: 8 }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {selectedAddress.label_Alamat}
          </Text>
          <Text style={{ color: "#25c05d" }}>
            {selectedAddress.Kecamatan}
          </Text>
          <Text style={{ fontSize: 14, color: "black" }}>
            {selectedAddress.Nama} ({selectedAddress.No_tlp}){"\n"}
            {selectedAddress.Detail_Alamat}, {selectedAddress["kota-kabupaten"]}, Kode Pos: {selectedAddress.Kode_pos}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: 14, color: "black" }}>
          Belum ada alamat penjemputan.
        </Text>
      )}
    </View>

      {/* Item Sampah */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 0 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
            Item Sampah
          </Text>
          <TouchableOpacity onPress={handleAddItem}>
            <Text style={{ color: "#25c05d", fontWeight: "bold" }}>
              Tambah Sampah?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Displaying items dynamically */}
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          {items.length > 0 ? (
            items.map((item: any, index: number) => {
              // Menentukan cara menghitung poin berdasarkan kategori
              const pointDisplay = item.type === "Non-organik-elektronik"
                ? `${item.points} Poin / Unit`
                : `${item.points} Poin / Kg`;

              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#f3f3f3",
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    shadowColor: "black",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    marginBottom: 10
                  }}
                >
                  {/* Menampilkan gambar berdasarkan nama item */}
                  <Image
                    source={getImageSource(item.image)}  // Menggunakan nama gambar dari item.imageUrl
                    style={{ width: 41, height: 56.78, marginRight: 16 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
                      {item.name} {/* Nama item */}
                    </Text>
                    <Text style={{ fontSize: 14, color: "gray" }}>
                      {item.type} {/* Kategori item */}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#25c05d", fontWeight: "bold" }}>
                      {pointDisplay} {/* Menampilkan poin berdasarkan kategori */}
                    </Text>
                    {/* Kontrol quantity */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#25c05d',
                          borderRadius: 20,
                          width: 32,
                          height: 32,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}
                        onPress={() => handleChangeItemQuantity(item.id || item.itemId, -1)}
                      >
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>-</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', minWidth: 32, textAlign: 'center' }}>{item.quantity || 1}</Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#25c05d',
                          borderRadius: 20,
                          width: 32,
                          height: 32,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 8,
                        }}
                        onPress={() => handleChangeItemQuantity(item.id || item.itemId, 1)}
                      >
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={{ color: "#25c05d", fontWeight: "bold" }}>
                      Lihat Detail
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={{ fontSize: 14, color: "black" }}>No items available.</Text>
          )}
        </View>


      </View>
           {/* Foto Sampah */}
       <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "black",
            marginBottom: 8,
          }}
        >
          Foto Sampah
        </Text>
        <View style={{ flexDirection: "row", marginRight: 16, marginLeft: 16 }}>
          <TouchableOpacity
            style={{
              width: 50, // Mengubah ukuran tombol untuk menampung ikon kamera
              height: 50,
              backgroundColor: "#25c05d", // Menggunakan warna hijau yang sesuai dengan tema
              borderRadius: 25, // Membuat tombol berbentuk lingkaran
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handlePickImage} // Menambahkan aksi untuk membuka kamera
          >
            <Feather
              name="camera"
              size={30} // Ukuran ikon kamera
              color="white" // Mengubah warna ikon menjadi putih agar kontras
            />
          </TouchableOpacity>
        </View>

        {/* Menampilkan foto yang diambil */}
        {photos.length > 0 && (
          <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap" }}>
            {photos.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: 150, height: 150, borderRadius: 10, marginRight: 10, marginBottom: 10 }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Jadwal Penjemputan */}
      <View style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
          Pilih Tanggal Penjemputan
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            marginTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: "#f3f3f3",
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: "black" }}>
            {selectedDate}
          </Text>
        </TouchableOpacity>
        {selectedDate && (
    <Text style={{ marginTop: 10, fontSize: 14, color: '#555' }}>
      Jadwal Penjemputan Akan Dilakukan Pada Pukul 15:00 Sesuai dengan tanggal yang dipilih.
    </Text>
  )}
      </View>

      {/* Modal Calendar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 16,
              width: 300,
            }}
          >
            <Calendar
              onDayPress={(day: DateData) => {
                const selectedDate = moment(day.dateString);
                const tomorrow = moment().add(1, 'days').startOf('day');
                
                if (selectedDate.isBefore(tomorrow)) {
                  Alert.alert(
                    "Peringatan",
                    "Anda hanya dapat memilih tanggal mulai besok"
                  );
                  return;
                }
                
                const formattedDate = selectedDate.locale('id').format("dddd, DD MMMM YYYY");
                setSelectedDate(formattedDate);
                setModalVisible(false);
              }}
              minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
              markedDates={{
                [moment().format("YYYY-MM-DD")]: {
                  selected: true,
                  selectedColor: "#25C05D",
                },
              }}
              theme={{
                todayTextColor: '#25C05D',
                selectedDayBackgroundColor: '#25C05D',
                arrowColor: '#25C05D',
              }}
            />
          </View>
        </View>
      </Modal>
       {/* Biaya Penjemputan (dinamis sesuai kecamatan) */}
       {pickupFee !== null && (
          <View style={{ backgroundColor: '#E0F7EF', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#22B07D' }}>
            <Text style={{ color: '#22B07D', fontSize: 15, textAlign: 'center', fontWeight: 'bold' }}>
              Biaya Penjemputan: {Number(pickupFee) > 0 ? `Rp ${Number(pickupFee).toLocaleString('id-ID')}` : 'Gratis'}
            </Text>
          </View>
        )}
        {/* Note biaya penjemputan dipotong dari poin */}
        <View style={{ backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FFD54F' }}>
          <Text style={{ color: '#B8860B', fontSize: 14, textAlign: 'center' }}>
            *Biaya penjemputan akan otomatis dipotong dari poin yang Anda dapatkan setelah penyetoran selesai.
          </Text>
        </View>
       <TouchableOpacity
  onPress={handleSubmitWithPhotos}
  style={{
    backgroundColor: isFormValid && !isSubmitting ? "#25c05d" : '#ccc',
    paddingVertical: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
  }}
  disabled={!isFormValid || isSubmitting}
>
  {isSubmitting ? (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
      <Text style={{ textAlign: "center", fontSize: 18, color: "white" }}>
        Loading...
      </Text>
    </View>
  ) : (
    <Text style={{ textAlign: "center", fontSize: 18, color: "white" }}>
      Konfirmasi Penyetoran
    </Text>
  )}
</TouchableOpacity>
  
  </ScrollView>
    </SafeAreaView>
  );
}
