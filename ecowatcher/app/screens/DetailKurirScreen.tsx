import React, { useState, useEffect } from 'react';
import { Modal, Button, Text, View, ScrollView, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Feather } from '@expo/vector-icons';
import moment from 'moment';
import CONFIG from './../config';
import { getAuth } from "firebase/auth";
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "../types";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

const db = getFirestore();

interface Address {
  Kode_pos: string;
  Kecamatan: string;
  label_Alamat: string;
  No_tlp: string;
  'kota-kabupaten': string;
  Detail_Alamat: string;
  Nama: string;
}

interface PickupItem {
  itemId: string;
  name: string;
  type: string;
  description: string;
  points: number;
  image: string;
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
  "default-sampah.png": require("../../assets/images/default-sampah.png"),
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
                        const pickupData = pickupDoc.data();
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
                                const trackData = trackSnapshot.docs[0].data(); // Ambil data dari dokumen pertama
                                if (trackData && trackData.statuses) {
                                    const statuses = trackData.statuses;

                                    // Periksa apakah statuses tidak kosong
                                    if (statuses.length > 0) {
                                        const sortedStatuses = statuses.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
                                        const latestStatus = sortedStatuses[0];

                                        // Pastikan latestStatus ada sebelum mengakses status
                                        if (latestStatus) {
                                            setTrackStatus(latestStatus.status); // Menyimpan status terbaru kurir
                                        } else {
                                            console.log('latestStatus tidak ditemukan.');
                                        }
                                    } else {
                                        console.log('statuses kosong, tidak ada status terbaru.');
                                        setTrackStatus('Status belum diperbarui'); // Contoh status default
                                    }
                                } else {
                                    console.log('Track data tidak memiliki statuses.');
                                }
                            } else {
                                console.log('Track data tidak ditemukan.');
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
  
  const updateStatus = async (pickupId, newStatus) => {
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
  
const updateStatusTrack = async (pickupId, newStatus) => {
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

  const handleTrackStatusChange = () => {
    if (pickupId && newStatus) {
      updateStatusTrack(pickupId, newStatus); // Mengirim status baru
    } else {
      alert('Status tidak boleh kosong');
    }
  };

  const updateItemQuantity = async (pickupId, itemId, quantity) => {
    if (!pickupId || !itemId || quantity === undefined) {
        alert('pickupId, itemId, dan newQuantity harus diberikan'); // Tampilkan alert jika salah satu tidak ada
        return; // Keluar dari fungsi jika parameter tidak valid
    }

    const url = `${CONFIG.API_URL}/api/update-quantity/${itemId}`;
    console.log("URL:", url); // Debugging URL yang dikirimkan

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pickupId, itemId, newQuantity: quantity }), // Pastikan pickupId dan itemId juga dikirimkan
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText); // Tampilkan respons error
            alert(`Error: ${errorText}`);
            return;
        }

        const result = await response.json();
        alert(result.message);
        setQuantityModalOpen(false); // Close modal after successful update

        // Setelah quantity berhasil diubah, update status ke "Selesai"
        updateStatus(pickupId, 'Selesai');
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

  if (loading) {
    return <Text>Memuat data...</Text>;
  }

  if (!selectedItem) {
    return <Text>Item tidak ditemukan.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
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
              <Text style={styles.addressDetails}>{address.No_tlp}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Penjemputan</Text>
        <View style={styles.card}>
          <Image source={getImageSource(selectedItem?.image || "")} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{selectedItem?.name}</Text>
            <Text style={styles.cardType}>{selectedItem?.type}</Text>
            <Text style={styles.cardPoints}>{selectedItem?.points} Points</Text>
          </View>
        </View>
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
            <Button 
                title="Ubah Status ke Dijemput" 
                onPress={() => updateStatus(pickupId, 'Dijemput')} // Menggunakan pickupId
            />
        )}
    {/* Status update button */}
    {pickupData?.status === "Ditimbang" && (
     <Button title="Ubah Quantity Item" onPress={openQuantityModal} />
    )}

    {/* Button untuk update status ke Ditimbang hanya jika status bukan "Ditimbang" */}
    {pickupData?.status !== "Ditimbang" && pickupData?.status !== "Selesai" && trackStatus === "Kurir tiba di lokasi" && (
        <Button
          title="Update Status ke Ditimbang"
          onPress={() => updateStatus(pickupId, "Ditimbang")} // Mengupdate status ke "Ditimbang"
        />
    )}

       {/* Button untuk membuka modal */}
       {pickupData && pickupData.status === "Dijemput" && pickupData.trackStatus !== "Kurir tiba di lokasi" && (
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
                  style={styles.select}
                  onValueChange={(itemValue) => setNewStatus(itemValue)}
                >
                  <Picker.Item label="Pilih Status Track" value="" />
                  <Picker.Item 
                    label="Kurir akan menjemput sampah Anda" 
                    value="Kurir akan menjemput sampah Anda" 
                  />
                  <Picker.Item 
                    label="Kurir sedang dalam perjalanan" 
                    value="Kurir sedang dalam perjalanan" 
                  />
                  <Picker.Item 
                    label="Kurir tiba di lokasi" 
                    value="Kurir tiba di lokasi" 
                  />
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
                            setNewQuantity(parseFloat(text) || 0);
                        }
                    }}
                    keyboardType="numeric" // Gunakan numeric untuk angka saja
                    style={styles.quantityInput}
                    placeholder="Masukkan Quantity Baru (contoh: 1.5)"
                    onKeyPress={({ nativeEvent }) => {
                        // Jika pengguna menekan tombol titik
                        if (nativeEvent.key === '.') {
                            // Hanya satu titik desimal yang boleh ada dalam input
                            if (!newQuantity.toString().includes('.')) {
                                setNewQuantity(prev => prev + '.');
                            }
                        }
                    }}
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
                                    console.log('itemId:', selectedItem.itemId);
                                    console.log('newQuantity:', newQuantity);
                                    updateItemQuantity(pickupId, selectedItem.itemId, newQuantity);
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
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              placeholder="Masukkan alasan pembatalan..."
              value={cancelReason}
              onChangeText={setCancelReason}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  select: {
    height: 50,
    width: '100%',
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#00796b',
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
});

export default DetailKurirScreen;
