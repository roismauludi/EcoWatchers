import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import CONFIG from '../config';
import { getAuth } from "firebase/auth";
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "../../utils/types";

interface Address {
  Kode_pos: string;
  Kecamatan: string;
  label_Alamat: string;
  No_tlp: string;
  'kota-kabupaten': string;
  Detail_Alamat: string;
  Nama: string;
  Blok_No?: string;
  rtRw?: string;
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

type RincianRouteProp = RouteProp<RootStackParamList, 'Rincian'>;

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

const RincianPenjemputan = () => {
  const route = useRoute<RincianRouteProp>();
  const { id, pickupId } = route.params;
  console.log('ID yang diterima:', id);
  
  const [pickupData, setPickupData] = useState<Pickup | null>(null);
  const [selectedItem, setSelectedItem] = useState<PickupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<Address | null>(null);
  const [schedule, setSchedule] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        try {
          const response = await fetch(`${CONFIG.API_URL}/api/get-pickups/${user.uid}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            // Cari pickup berdasarkan pickupId
            const pickupData = result.data.find((pickup: any) => pickup.id === pickupId);
            if (pickupData) {
              setPickupData(pickupData);
              setAddress(pickupData.address);
              setSchedule(formatScheduleDate(pickupData.pickUpDate));
              setPhotos(pickupData.photos);
              setStatus(pickupData.status);
              // Jika ingin item tertentu:
              if (id) {
                const item = pickupData.items.find((item: any) => item.itemId === id || item.id === id);
                setSelectedItem(item || null);
              } else {
                setSelectedItem(pickupData.items[0] || null);
              }
            } else {
              console.log('Tidak ada pickup yang ditemukan untuk pickupId:', pickupId);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id, pickupId]);

  const handleCancel = async () => {
    if (pickupData && pickupData.id) {  
      const pickupId = pickupData.id; 
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/update-status/${pickupId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          setStatus('Dibatalkan');
          alert('Status berhasil diubah menjadi Dibatalkan');
        } else {
          alert(result.message || 'Gagal memperbarui status');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Terjadi kesalahan saat mengubah status');
      }
    } else {
      alert('Pickup ID tidak ditemukan');
    }
  };

  if (loading) {
    return <Text>Memuat data...</Text>;
  }

  if (!pickupData || !pickupData.items || pickupData.items.length === 0) {
    return <Text>Item tidak ditemukan.</Text>;
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alamat Penjemputan</Text>
        <View style={styles.addressContainer}>
          {address && (
            <>
              <Text style={styles.addressName}>
                {address.Nama} <Text style={styles.tag}>{address.label_Alamat}</Text>
              </Text>
              <Text style={styles.addressDetails}>{address.Detail_Alamat || '-'}</Text>
              {/* Kecamatan, Kota/Kabupaten, Kode Pos dalam satu baris jika ada */}
              <Text style={styles.addressDetails}>
                {address.Kecamatan ? address.Kecamatan + ', ' : ''}
                {address['kota-kabupaten'] ? address['kota-kabupaten'] + ' ' : ''}
                {address.Kode_pos || ''}
              </Text>
              {/* Blok/No dan RT/RW dalam satu baris jika ada */}
              {(address.Blok_No || address.rtRw) && (
                <Text style={styles.addressDetails}>
                  {address.Blok_No ? `Blok: ${address.Blok_No}` : ''}
                  {address.Blok_No && address.rtRw ? ' | ' : ''}
                  {address.rtRw ? `RT/RW: ${address.rtRw}` : ''}
                </Text>
              )}
              <Text style={styles.addressDetails}>{address.No_tlp || '-'}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Penjemputan</Text>
        {pickupData.items.map((item, idx) => (
          <View style={styles.card} key={item.itemId || idx}>
            <Image source={getImageSource(item.image)} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardType}>{item.type}</Text>
              <Text style={styles.cardPoints}>{item.points} Points</Text>
            </View>
          </View>
        ))}
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

      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => setIsNoteExpanded(!isNoteExpanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {isNoteExpanded ? 'Tutup' : 'Tampilkan Lebih Banyak'}
          </Text>
          <AntDesign
            name={isNoteExpanded ? 'up' : 'down'}
            size={16}
            color="black"
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        {isNoteExpanded && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Penjemputan akan dilakukan pukul 15:00.
            </Text>
            <Text style={styles.noteTextSub}>
              Harap memastikan bahwa sampah telah dipisahkan sesuai jenisnya sebelum penjemputan.
            </Text>
          </View>
        )}
      </View>

      {status === 'Pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            Alert.alert(
              'Konfirmasi Pembatalan',
              'Apakah Anda yakin ingin membatalkan penyetoran ini?',
              [
                { text: 'Batal', style: 'cancel' },
                { text: 'Yakin', style: 'destructive', onPress: handleCancel },
              ]
            );
          }}
        >
          <Text style={styles.cancelButtonText}>Batalkan</Text>
        </TouchableOpacity>
      )}
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#00796b',
  },
  expandIcon: {
    marginLeft: 4,
  },
  noteContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 14,
  },
  noteTextSub: {
    fontSize: 12,
    color: '#555',
  },
  cancelButton: {
    marginTop: 24,
    backgroundColor: '#e57373',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
});

export default RincianPenjemputan;
