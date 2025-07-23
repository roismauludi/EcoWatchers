import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import CONFIG from '../config';

export default function ChannelsScreen() {
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 3000); // update setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  // Fungsi bantu untuk parsing tanggal string ke Date
  function parseTanggal(tanggalStr: string) {
    if (!tanggalStr) return new Date(0);
    const [day, month, year] = tanggalStr.split(' ');
    const monthMap: any = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    return new Date(Number(year), monthMap[month], Number(day));
  }

  // Filter campaign sesuai pencarian dan status ongoing/ended
  const filteredCampaigns = campaigns
    .filter((item) =>
      (item.status === 'ongoing' || item.status === 'ended') &&
      item.title?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'ongoing' ? -1 : 1;
      }
      // Jika status sama, urutkan berdasarkan tanggal
      const dateA = parseTanggal(a.date);
      const dateB = parseTanggal(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Helper untuk badge reminder
  const getReminder = (dateStr: string, timeStr: string, status: string) => {
    if (!dateStr || !timeStr) return null;
    const monthMap: any = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    try {
      const [day, month, year] = dateStr.split(' ');
      const [startTime, endTime] = timeStr.split('-');
      const [startHour, startMinute] = startTime.trim().split(/[.:]/).map(Number);
      let endHour = 0, endMinute = 0;
      if (endTime) {
        [endHour, endMinute] = endTime.replace(/WIB/i, '').trim().split(/[.:]/).map(Number);
      }
      const campaignStart = new Date(Number(year), monthMap[month], Number(day), startHour, startMinute, 0, 0);
      let campaignEnd = endTime
        ? new Date(Number(year), monthMap[month], Number(day), endHour, endMinute, 0, 0)
        : null;
      if (campaignEnd) campaignEnd.setMinutes(campaignEnd.getMinutes() + 1); // tambah 1 menit agar badge berlangsung sampai menit berikutnya
      // gunakan now dari state agar update otomatis
      if (status === 'ended' || (campaignEnd && now >= campaignEnd)) {
        return { label: 'Berakhir', color: '#888' };
      }
      if (campaignEnd && now >= campaignStart && now < campaignEnd) {
        return { label: 'Sedang Berlangsung', color: '#27AE60' };
      }
      const diffMs = campaignStart.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && diffHours > 0) {
        return { label: 'Segera dimulai!', color: '#E67E22' };
      }
      return null;
    } catch {
      return null;
    }
  };

  const getImageSource = (item: any) => {
    if (item.image && typeof item.image === 'string') {
      if (item.image.startsWith('/uploads/')) {
        return { uri: `${CONFIG.API_URL}${item.image}` };
      } else if (item.image.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return { uri: `${CONFIG.API_URL}/uploads/photos/${item.image}` };
      }
    }
    return require('../../assets/images/default-sampah.jpg');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channels</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Cari Campaign"
          placeholderTextColor="#888"
          style={{ color: '#222' }}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.cardContainer}>
          {filteredCampaigns.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Tidak ada campaign</Text>
          ) : filteredCampaigns.map((item) => {
            const reminder = getReminder(item.date, item.time, item.status);
            return (
              // card lebih pudar jika ended
              <View key={item.id} style={[styles.card, item.status === 'ended' && { opacity: 0.6 }]}> 
                <Image source={getImageSource(item)} style={styles.image} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description || '-'}</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#555" />
                  <Text style={styles.detailText}>{item.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#555" />
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#555" />
                  <Text style={styles.detailText}>{item.location}</Text>
                </View>
                {reminder && (
                  <Text style={{ color: reminder.color, fontWeight: 'bold', marginTop: 6 }}>
                    {reminder.label}
                  </Text>
                )}
                {item.registerLink && (
                  <TouchableOpacity onPress={() => Linking.openURL(item.registerLink)}>
                    <Text style={styles.link}>
                      Daftarkan diri Anda di: {item.registerLink}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.closing}>Jangan lupa yaaa. 😊</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1DB954",
    paddingTop: Platform.OS === "ios" ? 50 : 30, // SafeArea
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: "relative",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 50 : 30,
  },
  searchContainer: {
    margin: 16,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  cardContainer: {
    paddingBottom: 30,
  },
  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  description: {
    marginTop: 6,
    color: "#444",
    fontSize: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    marginLeft: 6,
    color: "#333",
    fontSize: 14,
  },
  link: {
    marginTop: 6,
    fontStyle: "italic",
    color: "#1DB954",
  },
  closing: {
    marginTop: 8,
    fontSize: 14,
  },
});
