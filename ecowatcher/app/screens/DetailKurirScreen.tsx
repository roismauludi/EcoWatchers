import React, { useState, useEffect } from 'react';
import { Modal, Button, Text, View, ScrollView, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Feather } from '@expo/vector-icons';
import moment from 'moment';
import CONFIG from '../config';
import { getAuth } from "firebase/auth";
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "../../utils/types";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore();

interface Address {
  Kode_pos: string;
  Kecamatan: string;
  label_Alamat: string;
  No_tlp: string;
  'kota-kabupaten': string;
  Detail_Alamat: string;
  Nama: string;
  Blok_No?: string; // Added Blok_No
  rtRw?: string; // Added rtRw
}

interface PickupItem {
  id: string;
  name: string;
  type: string;
  description: string;
  points: number;
  image: string;
  quantity?: number; // Added quantity field
}

interface Pickup {
  id: string;  
  items: PickupItem[];
  status: string;
  userId: string;
  photos: string[];
  createdAt: string;
  queueNumber: string;
  pickUpDate: string;
  address: Address;
}

type DetailKurirRouteProp = RouteProp<RootStackParamList, 'Detail'>;

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
  if (!imageName) {
    console.log("Image name is missing");
    return imageMapping["default"];
  }
  return imageMapping[imageName] || imageMapping["default"];
};

const formatScheduleDate = (isoDate: string) => {
  if (!isoDate) return "Tanggal tidak tersedia";
  return moment(isoDate).format('dddd, D MMMM YYYY');
};

const DetailKurirScreen = () => {
  const route = useRoute<DetailKurirRouteProp>(); // Menggunakan tipe yang sudah didefinisikan
  const navigation = useNavigation();
  const { queueNumber } = route.params; 
  console.log('Route params:', route.params); // Melihat parameter yang diterima
  console.log('Queue number yang diterima:', queueNumber);
  const [pickupId, setPickupId] = useState<string | null>(null); // Menyimpan pickupId di state
  const [pickupData, setPickupData] = useState<Pickup | null>(null);
  const [selectedItem, setSelectedItem] = useState<PickupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<Address | null>(null);
  const [schedule, setSchedule] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [openTrackStatusModalState, setOpenTrackStatusModalState] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackStatus, setTrackStatus] = useState<string>('');
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  // Tambahkan state untuk item yang sedang diedit quantity-nya
  const [editQuantityModalOpen, setEditQuantityModalOpen] = useState(false);
  const [editQuantityItem, setEditQuantityItem] = useState<PickupItem | null>(null);
  const [editQuantityValue, setEditQuantityValue] = useState<number>(0);
  // Tambahkan state untuk tracking perubahan quantity oleh kurir
  const [changedQuantities, setChangedQuantities] = useState<string[]>([]);
  const [editQuantityValueStr, setEditQuantityValueStr] = useState<string>('');

  useEffect(() => {
    let unsubscribePickup: () => void;
    let unsubscribeTrack: () => void; // Menambahkan unsubscribe untuk Track

    const fetchData = async () => {
        const user = getAuth().currentUser;
        if (user) {
            const userId = user.uid;
            try {
                console.log('queueNumber yang digunakan:', queueNumber);

                if (!queueNumber) {
                    console.error('queueNumber tidak valid:', queueNumber);
                    return;
                }

                const pickupQuery = query(
                    collection(db, "Penyetoran"),
                    where("queueNumber", "==", queueNumber)
                );

                unsubscribePickup = onSnapshot(pickupQuery, async (querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const pickupDoc = querySnapshot.docs[0];
                        const pickupData = pickupDoc.data() as Pickup; // casting agar tidak error
                        const id = pickupDoc.id;

                        console.log('pickupId yang ditemukan:', id);
                        console.log('Data pickup:', pickupData);
                        setPickupData(pickupData);
                        setPickupId(id); // Menyimpan pickupId di state

                        // Periksa apakah items ada dan tidak kosong
                        if (pickupData.items && pickupData.items.length > 0) {
                            setSelectedItem(pickupData.items[0]); // Mengambil item pertama (jika ada)
                        } else {
                            console.log('Tidak ada item yang ditemukan dalam pickupData.');
                        }

                        // Mengambil alamat, tanggal pickup, dan foto
                        setAddress(pickupData.address || {}); // Mengambil alamat, default ke objek kosong jika tidak ada
                        setSchedule(formatScheduleDate(pickupData.pickUpDate)); // Format tanggal pickup
                        setPhotos(pickupData.photos || []); // Menyimpan foto, default ke array kosong jika tidak ada

                        // Ambil status kurir secara real-time
                        const trackQuery = query(
                            collection(db, "Track"),
                            where("pickupId", "==", id)
                        );

                        unsubscribeTrack = onSnapshot(trackQuery, (trackSnapshot) => {
                            if (!trackSnapshot.empty) {
                                const trackData = trackSnapshot.docs[0].data();
                                if (trackData && trackData.statuses && trackData.statuses.length > 0) {
                                    // Ambil status terakhir dari array statuses
                                    const latestStatus = trackData.statuses[trackData.statuses.length - 1].status;
                                    setTrackStatus(latestStatus);
                                } else {
                                    setTrackStatus(""); // Track baru, belum ada status
                                }
                            } else {
                                setTrackStatus(""); // Tidak ada track
                            }
                        });
                    } else {
                        console.log('Tidak ada pickup data yang ditemukan dengan queueNumber tersebut');
                    }
                });

                return () => {
                    if (unsubscribePickup) unsubscribePickup();
                    if (unsubscribeTrack) unsubscribeTrack(); // Bersihkan listener Track saat komponen unmount
                };
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    fetchData();
}, [queueNumber]);
  
  const updateStatus = async (pickupId: string, newStatus: string) => {
    console.log('pickupId yang akan dikirim:', pickupId); // Log pickupId yang akan dikirim
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/updatestatus/${pickupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
      });
  
      const result = await response.json();
      console.log('Hasil pembaruan status:', result); // Log hasil pembaruan status
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat memperbarui status');
    }
  };
  
const updateStatusTrack = async (pickupId: string, newStatus: string) => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/update-track-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickupId, newStatus }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message); // Tampilkan pesan sukses
        closeTrackStatusModal(); // Tutup modal setelah berhasil update
      } else {
        alert(result.message); // Tampilkan pesan error
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat memperbarui status');
    }
  };

  // Tambahkan fungsi untuk urutan status track
  const TRACK_STATUS_ORDER = [
    'Kurir akan menjemput sampah Anda',
    'Kurir sedang dalam perjalanan',
    'Kurir tiba di lokasi',
  ];

  const handleTrackStatusChange = () => {
    if (pickupId && newStatus) {
      // Cek urutan status
      const currentIdx = TRACK_STATUS_ORDER.indexOf(trackStatus);
      const newIdx = TRACK_STATUS_ORDER.indexOf(newStatus);
      if (newIdx > currentIdx) {
        updateStatusTrack(pickupId, newStatus); // Mengirim status baru
      } else {
        alert('Tidak bisa kembali ke status sebelumnya!');
      }
    } else {
      alert('Status tidak boleh kosong');
    }
  };

  const updateItemQuantity = async (pickupId: string, itemId: string, quantity: number) => {
    if (!pickupId || !itemId || quantity === undefined || quantity === null) {
      console.log('DEBUG updateItemQuantity: pickupId:', pickupId, 'itemId:', itemId, 'quantity:', quantity);
      alert('pickupId, itemId, dan newQuantity harus diberikan dan quantity harus lebih dari 0.');
      return;
    }

    const url = `${CONFIG.API_URL}/api/update-quantity/${itemId}`;
    console.log('DEBUG updateItemQuantity URL:', url, 'pickupId:', pickupId, 'itemId:', itemId, 'quantity:', quantity);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickupId, newQuantity: Number(quantity) }), // Pastikan pickupId dan itemId juga dikirimkan
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText); // Tampilkan respons error
        alert(`Error: ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('DEBUG updateItemQuantity response:', result);
      alert(result.message);
      // setQuantityModalOpen(false); // Close modal after successful update - This was for the main quantity modal

      // Setelah quantity berhasil diubah, update status ke "Selesai"
      // updateStatus(pickupId, 'Selesai'); // This was for the main status update
    } catch (error) {
      console.error('Error updating item quantity:', error);
      alert('Terjadi kesalahan saat memperbarui quantity');
    }
  };

  const openQuantityModal = () => {
    setQuantityModalOpen(true);
  };

  const closeQuantityModal = () => {
    setQuantityModalOpen(false);
  };


  const openTrackStatusModal = () => {
    setOpenTrackStatusModalState(true);
  };
  
  // Fungsi untuk menutup modal
  const closeTrackStatusModal = () => {
    setOpenTrackStatusModalState(false);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Mohon isi alasan pembatalan');
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/cancel-pickup/${pickupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason,
          status: 'Pending' // Tetap mempertahankan status Pending
        }),
      });

      if (response.ok) {
        alert('Pembatalan berhasil disimpan');
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        alert('Gagal menyimpan pembatalan');
      }
    } catch (error) {
      console.error('Error canceling pickup:', error);
      alert('Terjadi kesalahan saat menyimpan pembatalan');
    }
  };

  // Fungsi untuk membuka modal edit quantity per item
  const openEditQuantityModal = (item: PickupItem) => {
    setEditQuantityItem(item);
    setEditQuantityValueStr(item.quantity ? item.quantity.toString() : ''); // Pastikan field quantity ada di item
    setEditQuantityModalOpen(true);
  };

  const closeEditQuantityModal = () => {
    setEditQuantityModalOpen(false);
    setEditQuantityItem(null);
    setEditQuantityValueStr('');
  };

  // Fungsi update quantity per item (validasi di sini)
  const handleUpdateItemQuantity = () => {
    console.log('DEBUG STATE:', { pickupId, editQuantityItem, editQuantityValueStr });
    if (pickupId && editQuantityItem && editQuantityItem.id) {
      const normalized = editQuantityValueStr.replace(',', '.');
      const value = parseFloat(normalized);
      if (!isNaN(value) && value > 0) {
        console.log('FRONTEND DEBUG update quantity:', {
          pickupId,
          itemId: editQuantityItem.id,
          newQuantity: value
        });
        fetch(`${CONFIG.API_URL}/api/update-quantity/${editQuantityItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pickupId, newQuantity: value })
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Error response:', errorText);
              alert(`Error: ${errorText}`);
              return;
            }
            const result = await response.json();
            console.log('DEBUG updateItemQuantity response:', result);
            alert(result.message);
            setChangedQuantities((prev) => prev.includes(editQuantityItem.id) ? prev : [...prev, editQuantityItem.id]);
            closeEditQuantityModal();
          })
          .catch((error) => {
            console.error('Error updating item quantity:', error);
            alert('Terjadi kesalahan saat memperbarui quantity');
          });
      } else {
        alert('Quantity harus berupa angka lebih dari 0.');
      }
    } else {
      alert('pickupId, itemId, dan newQuantity harus diberikan dan quantity harus lebih dari 0.');
    }
  };

  // Fungsi untuk cek apakah semua item sudah diubah quantity-nya oleh kurir
  const allItemsQuantityChanged = pickupData?.items && pickupData.items.length > 0 && pickupData.items.every(item => changedQuantities.includes(item.id));

  // Fungsi untuk handle penyetoran selesai
  const handlePenyetoranSelesai = () => {
    if (allItemsQuantityChanged) {
      updateStatus(pickupId || '', 'Selesai');
    } else {
      alert('Semua quantity item harus diisi dan lebih dari 0 sebelum menyelesaikan penyetoran.');
    }
  };

  if (loading) {
    return <Text>Memuat data...</Text>;
  }

  if (!selectedItem) {
    return <Text>Item tidak ditemukan.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header dengan tombol back dan judul */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.07)' }}>
          <Ionicons name="arrow-back" size={26} color="#00796b" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00796b' }}>Detail Penjemputan</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alamat Penjemputan</Text>
        <View style={styles.addressContainer}>
          {address && (
            <>
              <Text style={styles.addressName}>
                {address.Nama} <Text style={styles.tag}>{address.label_Alamat}</Text>
              </Text>
              <Text style={styles.addressDetails}>
                {address.Detail_Alamat}, {address.Kecamatan}, {address['kota-kabupaten']} {address.Kode_pos}
              </Text>
              {/* Tambahkan Blok_No dan rtRw jika ada */}
              {(address.Blok_No || address.rtRw) && (
                <Text style={styles.addressDetails}>
                  {address.Blok_No ? `Blok: ${address.Blok_No}` : ''}
                  {address.Blok_No && address.rtRw ? ' | ' : ''}
                  {address.rtRw ? `RT/RW: ${address.rtRw}` : ''}
                </Text>
              )}
              <Text style={styles.addressDetails}>{address.No_tlp}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Penjemputan</Text>
        {/* Tampilkan semua item penjemputan */}
        {pickupData?.items && pickupData.items.length > 0 ? (
          pickupData.items.map((item, idx) => (
            <View style={styles.card} key={item.id || idx}>
              <Image source={getImageSource(item?.image || "")}
                style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item?.name}</Text>
                <Text style={styles.cardType}>{item?.type}</Text>
                <Text style={styles.cardPoints}>{item?.points} Points</Text>
                <Text style={styles.cardType}>Quantity: {item.quantity || 0}</Text>
                {/* Tampilkan tombol Ubah Quantity hanya jika status penyetoran sudah Ditimbang */}
                {pickupData.status === "Ditimbang" && (
                  <TouchableOpacity
                    style={{ marginTop: 8, backgroundColor: '#00796b', padding: 8, borderRadius: 6, alignSelf: 'flex-start' }}
                    onPress={() => openEditQuantityModal(item)}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Ubah Quantity</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text>Tidak ada item penjemputan.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foto Kamera</Text>
        <ScrollView horizontal>
          {photos.map((photo, index) => {
            const formattedPhoto = photo.replace(/\\/g, '/');
            return (
              <Image
                key={index}
                source={{ uri: `${CONFIG.API_URL}/${formattedPhoto}` }}
                style={styles.cameraPhoto}
                onError={(error) => console.log(`Error loading image [${index}]:`, error.nativeEvent)}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jadwal Penjemputan</Text>
        <View style={styles.scheduleContainer}>
          <AntDesign name="calendar" size={24} color="#00796b" style={styles.calendarIcon} />
          <Text style={styles.scheduleDate}>{schedule}</Text>
        </View>
      </View>
      
      {pickupData?.status === "Pending" && (
  <TouchableOpacity
    style={styles.updateStatusButton}
    onPress={() => updateStatus(pickupId!, 'Dijemput')}
  >
    <Feather name="truck" size={20} color="white" style={{ marginRight: 8 }} />
    <Text style={styles.updateStatusButtonText}>Ubah Status ke Dijemput</Text>
  </TouchableOpacity>
)}
{pickupData?.status === "Ditimbang" && allItemsQuantityChanged && (
  <TouchableOpacity
    style={styles.updateStatusButton}
    onPress={handlePenyetoranSelesai}
  >
    <Feather name="check-circle" size={20} color="white" style={{ marginRight: 8 }} />
    <Text style={styles.updateStatusButtonText}>Penyetoran Selesai</Text>
  </TouchableOpacity>
)}
{pickupData?.status !== "Ditimbang" && pickupData?.status !== "Selesai" && trackStatus === "Kurir tiba di lokasi" && (
  <TouchableOpacity
    style={styles.updateStatusButton}
    onPress={() => updateStatus(pickupId!, "Ditimbang")}
  >
    <Feather name="check-circle" size={20} color="white" style={{ marginRight: 8 }} />
    <Text style={styles.updateStatusButtonText}>Update Status ke Ditimbang</Text>
  </TouchableOpacity>
)}

       {/* Button untuk membuka modal */}
       {pickupData && pickupData.status === "Dijemput" && trackStatus !== "Kurir tiba di lokasi" && (
         <TouchableOpacity
           style={styles.updateStatusButton}
           onPress={openTrackStatusModal}
         >
           <AntDesign name="edit" size={20} color="white" style={{ marginRight: 8 }} />
           <Text style={styles.updateStatusButtonText}>
             Ubah Status Pickup
           </Text>
         </TouchableOpacity>
       )}

      {/* Modal untuk update status */}
      {openTrackStatusModalState && (
        <Modal
          visible={openTrackStatusModalState}
          onRequestClose={closeTrackStatusModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Status Pickup</Text>
                <TouchableOpacity onPress={closeTrackStatusModal}>
                  <AntDesign name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalInfo}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>Nama Penyetor:</Text>
                  <Text style={styles.modalValue}>{address?.Nama || '-'}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalLabel}>ID Penyetoran:</Text>
                  <Text style={styles.modalValue}>#{queueNumber}</Text>
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newStatus}
                  style={[styles.select]}
                  onValueChange={(itemValue) => setNewStatus(itemValue)}
                >
                  <Picker.Item label="Pilih Status Track" value="" color="#888" />
                  {/* Logic dinamis untuk opsi status track */}
                  {(!trackStatus || trackStatus === null || trackStatus === "") && (
                    <Picker.Item label="Kurir akan menjemput sampah Anda" value="Kurir akan menjemput sampah Anda" />
                  )}
                  {trackStatus === "Kurir akan menjemput sampah Anda" && (
                    <Picker.Item label="Kurir sedang dalam perjalanan" value="Kurir sedang dalam perjalanan" />
                  )}
                  {trackStatus === "Kurir sedang dalam perjalanan" && (
                    <Picker.Item label="Kurir tiba di lokasi" value="Kurir tiba di lokasi" />
                  )}
                </Picker>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButtonModal]} 
                  onPress={closeTrackStatusModal}
                >
                  <Text style={styles.modalButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.submitButtonModal,
                    { opacity: newStatus ? 1 : 0.5 }
                  ]}
                  onPress={() => handleTrackStatusChange()}
                  disabled={!newStatus}
                >
                  <Text style={styles.modalButtonText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

       {/* Quantity update modal */}
       {quantityModalOpen && (
    <Modal visible={quantityModalOpen} onRequestClose={closeQuantityModal} transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ubah Quantity Item</Text>
                <TextInput
                    value={newQuantity.toString()}
                    onChangeText={(text) => {
                        // Validasi input agar hanya angka dan satu titik desimal yang diperbolehkan
                        if (/^\d*\.?\d*$/.test(text)) {
                            setNewQuantity(text === '' ? 0 : parseFloat(text));
                        }
                    }}
                    keyboardType="numeric"
                    style={[styles.quantityInput, { color: '#222' }]}
                    placeholder="Masukkan Quantity Baru (contoh: 1.5)"
                    placeholderTextColor="#888"
                />
                <View style={styles.modalFooter}>
                    <Button title="Batal" onPress={closeQuantityModal} />
                    <Button
                        title="Simpan"
                        onPress={() => {
                            // Pastikan pickupData dan selectedItem ada
                            if (pickupData && selectedItem) {
                                if (newQuantity > 0) { // Validasi angka positif
                                    console.log('pickupId:', pickupId);
                                    console.log('itemId:', selectedItem.id);
                                    console.log('newQuantity:', newQuantity);
                                    updateItemQuantity(pickupId!, selectedItem.id, newQuantity);
                                } else {
                                    alert("Quantity harus lebih dari 0.");
                                }
                            } else {
                                alert("Data pickup atau item tidak tersedia.");
                            }
                        }}
                    />
                </View>
            </View>
        </View>
    </Modal>
)}

      {/* Modal untuk edit quantity per item */}
      {editQuantityModalOpen && (
        <Modal visible={editQuantityModalOpen} onRequestClose={closeEditQuantityModal} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ubah Quantity Item</Text>
              <Text style={{ marginBottom: 8 }}>{editQuantityItem?.name}</Text>
              <TextInput
                value={editQuantityValueStr}
                onChangeText={setEditQuantityValueStr}
                keyboardType="decimal-pad"
                style={[styles.quantityInput, { color: '#222' }]}
                placeholder="Masukkan Quantity Baru (contoh: 1.5 atau 0,5)"
                placeholderTextColor="#888"
              />
              <View style={styles.modalFooter}>
                <Button title="Batal" onPress={closeEditQuantityModal} />
                <Button title="Simpan" onPress={handleUpdateItemQuantity} />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {pickupData?.status === "Pending" && (
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={styles.cancelButtonText}>Batalkan Penjemputan</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alasan Pembatalan</Text>
            <TextInput
              style={[styles.reasonInput, { color: '#222' }]}
              multiline
              numberOfLines={4}
              placeholder="Masukkan alasan pembatalan..."
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButtonModal]} 
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButtonModal]} 
                onPress={handleCancel}
              >
                <Text style={styles.modalButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  addressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tag: {
    fontSize: 12,
    color: '#00796b',
  },
  addressDetails: {
    fontSize: 14,
    color: '#555',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 12,
    marginTop: 8,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardType: {
    fontSize: 14,
    color: '#555',
  },
  cardPoints: {
    fontSize: 14,
    color: '#00796b',
  },
  cameraPhoto: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  scheduleDate: {
    fontSize: 16,
    color: '#00796b',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  select: {
    height: 50,
    width: '100%',
    color: '#222',
  },
  quantityInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#00796b',
  },
  cancelButton: {
    backgroundColor: '#e57373',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalInfo: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796b',
    flex: 2,
    textAlign: 'right',
  },
  updateStatusButton: {
    backgroundColor: '#00796b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateStatusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerContainer: {
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonModal: {
    backgroundColor: '#e57373',
  },
  submitButtonModal: {
    backgroundColor: '#00796b',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DetailKurirScreen;
