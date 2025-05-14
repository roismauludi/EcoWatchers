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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Calendar } from "react-native-calendars";
import { getAuth } from "firebase/auth"; 
import { DateData } from "react-native-calendars";
import moment from "moment";
import 'moment/locale/id'; // Import Indonesian locale
import * as ImagePicker from 'expo-image-picker';
import CONFIG from './../config';

type RootStackParamList = {
  PickUp: undefined;
  AddAddress: undefined;
};

const imageMapping: { [key: string]: any } = {
  "monitor-lcd.jpg": require("../../assets/images/elektronik/monitor-lcd.jpg"),
  "monitor-tabung.jpg": require("../../assets/images/elektronik/monitor-tabung.jpg"),
  "botol_kaca.png": require("../../assets/images/kaca/botol_kaca.png"),
  "pecahan_kaca.png": require("../../assets/images/kaca/pecahan_kaca.png"),
  "buku.jpg": require("../../assets/images/kertas/buku.jpg"),
  "duplex.png": require("../../assets/images/kertas/duplex.png"),
  "kardus.png": require("../../assets/images/kertas/kardus.png"),
  "kertas_nota.png": require("../../assets/images/kertas/kertas_nota.png"),
  "aluminium.png": require("../../assets/images/logam/aluminium.png"),
  "besi-padu.png": require("../../assets/images/logam/besi-padu.png"),
  "kuningan.png": require("../../assets/images/logam/kuningan.png"),
  "kaleng.png": require("../../assets/images/logam/kaleng.png"),
  "minyak_jelantah.png": require("../../assets/images/minyak/minyak_jelantah.png"),
  "botol-atom.png": require("../../assets/images/plastik/botol-atom.png"),
  "botol_plastik.png": require("../../assets/images/plastik/botol_plastik.png"),
  "ember_plastik.png": require("../../assets/images/plastik/ember_plastik.png"),
  "gelas_plastik.png": require("../../assets/images/plastik/gelas_plastik.png"),
};

const getImageSource = (imageName: string) => {
  console.log("Image requested:", imageName);  
  return imageMapping[imageName] || imageMapping["default.png"];
};


export default function PenyetoranScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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


  const fetchAddresses = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/get-addresses/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setAddresses(data);
          setSelectedAddress(data[0]);
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

    // Fetch addresses and items when the component mounts
    fetchAddresses();
    fetchItems();  // Fetch items from "tong"
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses(); // Panggil fungsi untuk refresh alamat
  };

  const formattedDate = (dateString: string): string => {
    return moment(dateString).format("dddd, DD MMMM YYYY");
    console.log(formattedDate);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotos(prevPhotos => [...prevPhotos, result.assets[0].uri]);
        console.log("Image taken:", result.assets[0].uri);
      }
    } else {
      Alert.alert('Akses Ditolak', 'Untuk melanjutkan, Anda perlu memberikan izin untuk mengakses kamera.');
    }
  };

  const handleSubmitWithPhotos = async () => {
    // Validasi input
    if (!selectedAddress || items.length === 0 || photos.length === 0 || !selectedDate) {
      Alert.alert("Error", "Pastikan semua data sudah diisi.");
      return;
    }
    
    // Persiapkan FormData
    const formData = new FormData();
    formData.append("userId", getAuth().currentUser?.uid || "");
    formData.append("address", JSON.stringify(selectedAddress));
    formData.append("items", JSON.stringify(items));
    formData.append("pickUpDate", selectedDate); // Pastikan selectedDate sesuai dengan format yang benar
    
    // Loop through photos and append them one by one
    photos.forEach((uri) => {
      const fileName = uri.split("/").pop();
      const fileType = "image/jpeg"; // Sesuaikan dengan jenis file jika bukan JPEG
      
      // Append each photo as a separate part in FormData
      formData.append("photos", {
        uri,
        name: fileName,
        type: fileType,
      } as any);
    });
  
    // Log data before sending it to the server
    console.log("Form Data:", formData);
  
    try {
      // Kirim permintaan ke server
      const response = await fetch(`${CONFIG.API_URL}/api/submit-pickup`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Hapus item setelah penyetoran berhasil
        await handleDeleteItems(items);
        Alert.alert("Sukses", "Penyetoran berhasil dikonfirmasi!");
        navigation.navigate("PickUp");
      } else {
        console.error("Error from server:", result);
        Alert.alert("Gagal", "Terjadi kesalahan saat mengirim data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Error", "Terjadi kesalahan jaringan.");
    }
  };
  
  // Fungsi untuk menghapus item setelah penyetoran
  const handleDeleteItems = async (items: Array<{ itemId: string }>) => {
    if (!items || items.length === 0) {
      console.error("Tidak ada item untuk dihapus");
      return;
    }
  
    try {
      // Loop untuk menghapus setiap item berdasarkan ID-nya
      for (const item of items) {
        if (!item.itemId) { // Pastikan Anda menggunakan itemId
          console.error("ID item tidak ditemukan");
          continue; // Skip item yang tidak memiliki ID
        }
  
        const response = await fetch(`${CONFIG.API_URL}/api/delete-item/${item.itemId}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          console.log(`Item dengan ID ${item.itemId} berhasil dihapus`);
        } else {
          const result = await response.json();
          console.error(`Gagal menghapus item dengan ID ${item.itemId}:`, result);
        }
      }
  
      // Setelah semua item dihapus, refresh data yang relevan
      // fetchItems();
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus item:", error);
    }
  };
  
  
  return (
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
        <TouchableOpacity onPress={() => navigation.navigate("AddAddress")}>
          <Text style={{ color: "#25c05d", fontWeight: "bold" }}>
            Tambah Alamat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menampilkan alamat */}
      {loading ? (
        <Text>Loading...</Text>
      ) : addresses.length > 0 ? (
        <View
          style={{ backgroundColor: "#f3f3f3", borderRadius: 10, padding: 16 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
            Pilih Alamat
          </Text>
          {addresses.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={{
                marginTop: 8,
                padding: 8,
                backgroundColor:
                  selectedAddress?.id === item.id ? "#d3f4db" : "#f3f3f3",
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              onPress={() => setSelectedAddress(item)}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
                  {item.label_Alamat}
                </Text>
                <Text style={{ fontSize: 14, color: "#25c05d" }}>
                  {item.Kecamatan}
                </Text>
                <Text style={{ fontSize: 14, color: "black" }}>
                  {item.Nama} ({item.No_tlp}){"\n"}
                  {item.Detail_Alamat}, {item["kota-kabupaten"]}, Kode Pos: {item.Kode_pos}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
          <TouchableOpacity>
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
       {/* Tombol Konfirmasi */}
       <TouchableOpacity
  onPress={handleSubmitWithPhotos}
  style={{
    backgroundColor: "#25c05d",
    paddingVertical: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
  }}
>
  <Text style={{ textAlign: "center", fontSize: 18, color: "white" }}>
    Konfirmasi Penyetoran
  </Text>
</TouchableOpacity>
  

    </ScrollView>
  );
}
