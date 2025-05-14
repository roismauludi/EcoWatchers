import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

const KurirScreen = () => {
  const [penyetoranData, setPenyetoranData] = useState([]);
  const [trackData, setTrackData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth(); // Firebase Authentication

  // Listener untuk koleksi 'Penyetoran' dengan urutan berdasarkan pickUpDate terbaru
  useEffect(() => {
    const unsubscribePenyetoran = onSnapshot(
      query(collection(db, 'Penyetoran'), orderBy('pickUpDate', 'desc')), // Urutkan berdasarkan pickUpDate terbaru
      (querySnapshot) => {
        const penyetoran = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const address = data.address || {};

          return {
            id: doc.id,
            queueNumber: data.queueNumber,
            nama: address.Nama || 'Nama tidak tersedia',
            alamat: `${address.Detail_Alamat || 'Tidak ada detail alamat'}, ${
              address.Kecamatan || ''
            }, ${address['kota-kabupaten'] || ''} - ${address.Kode_pos || ''}`,
            status: data.status || 'Status tidak tersedia',
            tanggal: data.pickUpDate
              ? new Date(data.pickUpDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Tanggal tidak tersedia',
          };
        });

        // Urutkan berdasarkan status yang diinginkan
        const statusOrder = ['pending', 'dijemput', 'ditimbang', 'selesai', 'dibatalkan'];
        const sortedPenyetoran = penyetoran.sort((a, b) => {
          return statusOrder.indexOf(a.status.toLowerCase()) - statusOrder.indexOf(b.status.toLowerCase());
        });

        setPenyetoranData(sortedPenyetoran);
        setLoading(false);
      }
    );

    return () => unsubscribePenyetoran();
  }, []);

  // Track data listener
  useEffect(() => {
    const unsubscribeTrack = onSnapshot(collection(db, 'Track'), (querySnapshot) => {
      const track = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const queueNumber = data.queueNumber;
        const latestStatus = data.statuses && data.statuses.length > 0 
          ? data.statuses[data.statuses.length - 1].status
          : 'Status tidak tersedia';
        track[queueNumber] = latestStatus;
      });
      setTrackData(track);
    });

    return () => unsubscribeTrack();
  }, []);

  // Fungsi untuk Logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Redirect ke halaman login setelah logout berhasil
        navigation.navigate('Login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const getStatusStyle = (status) => {
    const baseStyle = {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    };

    switch (status.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#e0e0e0', color: '#555' };
      case 'selesai':
        return { ...baseStyle, backgroundColor: '#d4fcdc', color: '#00c853' };
      case 'dijemput':
        return { ...baseStyle, backgroundColor: '#e3d4fc', color: '#6200ee' };
      case 'ditimbang':
        return { ...baseStyle, backgroundColor: '#fde6d4', color: '#ff6f00' };
      case 'dibatalkan':
        return { ...baseStyle, backgroundColor: '#fcd4d4', color: '#d50000' };
      default:
        return { ...baseStyle, backgroundColor: '#e0e0e0', color: '#555' };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari transaksi"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardHeaderText}>{item.nama}</Text>
          <Text style={styles.cardDate}>{item.tanggal}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.statusPill, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
          <TouchableOpacity>
            <Feather name="more-vertical" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Alamat:</Text>
          <Text style={styles.value}>{item.alamat}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Track:</Text>
          <Text style={styles.value}>
            {trackData[item.queueNumber] || 'Track tidak tersedia'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
           onPress={() => navigation.navigate('Detail', { queueNumber: item.queueNumber })} // Navigasi ke DetailKurirScreen dengan data queueNumber
          >
            <Text style={styles.actionButtonText}>Lihat Detail</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={penyetoranData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Tombol Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    gap: 12,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    gap: 12,
  },
  infoSection: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  actionButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff1744',
    paddingVertical: 12,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default KurirScreen;
