import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from '../../firebaseConfig';
import { RootStackParamList } from "../../utils/types";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Ionicons } from "@expo/vector-icons";
import SelesaiScreen from "./SelesaiScreen";
import DibatalkanScreen from "./DibatalkanScreen";
import DijemputScreen from "./DijemputScreen";
import CONFIG from "../config";
import searchingImage from "../../assets/images/pickup/searching.png";

interface PickupItem {
  itemId: string;
  name: string;
  type: string;
  description: string;
  points: number;
  image: string;
}

// Pemetaan gambar lokal
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
  return imageMapping[imageName] || imageMapping["default-sampah.jpg"];
};

export default function PickUpScreen() {
  const [activeTab, setActiveTab] = useState("Diproses");
  const [loading, setLoading] = useState(true);
  const [pickupData, setPickupData] = useState<any[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // --- Tambahkan BackHandler agar tidak keluar app ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("MainTabs");
        return true; // Cegah keluar app
      };
  
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
  
      return () => subscription.remove();
    }, [navigation])
  );  

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const collectionRef = collection(db, "Penyetoran");
      const q = query(collectionRef, where("userId", "==", userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPickupData(data);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const filterDataByStatus = (status: string) => {
    return pickupData.filter((item) => item.status === status);
  };

  const renderTabContent = () => {
    if (activeTab === "Selesai") {
      return <SelesaiScreen />;
    } else if (activeTab === "Dijemput") {
      const filteredData = filterDataByStatus("Dijemput");
      if (!filteredData || filteredData.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Image
              source={searchingImage}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.placeholderText}>Belum ada penjemputan</Text>
          </View>
        );
      }
      return <DijemputScreen />;
    }

    let filteredData = [];
    if (activeTab === "Diproses") {
      filteredData = filterDataByStatus("Pending");
    } else if (activeTab === "Dibatalkan") {
      filteredData = filterDataByStatus("Dibatalkan");
    } else if (activeTab === "Ditimbang") {
      filteredData = filterDataByStatus("Ditimbang");
    }

    if (
      activeTab === "Diproses" &&
      (!filteredData || filteredData.length === 0)
    ) {
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={searchingImage}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.placeholderText}>Belum terdapat pengajuan</Text>
          <Text style={styles.placeholderSubText}>
            Silahkan melakukan pengajuan pick up
          </Text>
        </View>
      );
    }
    if (filteredData.length === 0) {
      return (
        <Text style={styles.placeholderText}>
          Tidak ada data di tab {activeTab}.
        </Text>
      );
    }

    return (
      <View>
        {filteredData.map((item, index) => (
          <View style={styles.contentContainer} key={index}>
            {activeTab === "Diproses" && (
              <Text style={styles.notePerluDijemputCard}>Perlu Dijemput</Text>
            )}
            <View style={styles.cardContainer}>
              {item.items &&
                item.items.map((subItem: PickupItem, idx: number) => {
                  const pointUnit =
                    subItem.type === "Non-organik-elektronik"
                      ? "/ unit"
                      : "/ Kg";
                  return (
                    <View style={styles.card} key={idx}>
                      <Image
                        source={getImageSource(subItem.image)}
                        style={styles.cardImage}
                      />
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardTitle}>
                          {subItem.name || "Tidak diketahui"}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                          {subItem.type || "Jenis tidak diketahui"}
                        </Text>
                        <Text style={styles.cardPoints}>
                          {subItem.points || 0} Poin {pointUnit}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
            <View style={styles.detailInfoContainer}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>Total Sampah: </Text>
                {item.items ? item.items.length : 0} Sampah
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>
                  Sampah akan dijemput pada: {" "}
                </Text>
                {item.pickUpDate
                  ? new Date(item.pickUpDate).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }) + " pukul 15:00"
                  : "Tanggal tidak tersedia"}
              </Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  if (!item.items || item.items.length === 0) {
                    alert("Tidak ada item sampah pada penyetoran ini.");
                    return;
                  }
                  const itemId = item.items[0]?.itemId || item.items[0]?.id;
                  if (!itemId) {
                    alert("ID item tidak ditemukan pada data sampah.");
                    return;
                  }
                  navigation.navigate("Rincian", {
                    id: itemId,
                    pickupId: item.id,
                  });
                }}
              >
                <Text style={styles.detailButtonText}>Lihat Rincian</Text>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>No. Antrean: </Text>
                {item.queueNumber || "Tidak tersedia"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header custom hijau */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>Pick Up</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>
      <View style={styles.tabs}>
        {["Diproses", "Dijemput", "Ditimbang", "Selesai", "Dibatalkan"].map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabButton}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTab]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#25C05D" />
        ) : (
          renderTabContent()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "transparent",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabText: { fontSize: 14, color: "#9E9E9E", fontWeight: "500" },
  activeTab: {
    color: "#25C05D",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#25C05D",
  },
  content: { padding: 16 },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: { width: 64, height: 64, marginBottom: 8 },
  cardDetails: { alignItems: "center" },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#424242",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
  },
  cardPoints: { fontSize: 12, color: "#25C05D", fontWeight: "bold" },
  detailInfoContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: { fontSize: 14, marginBottom: 8, color: "#424242" },
  detailButton: {
    backgroundColor: "#25C05D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  detailButtonText: { color: "white", fontWeight: "bold" },
  placeholderText: {
    fontSize: 20,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 2,
  },
  placeholderSubText: {
    fontSize: 13,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 2,
  },
  headerContainer: {
    backgroundColor: "#25C05D",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrapper: { flex: 1, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  notePerluDijemputCard: {
    fontSize: 16,
    color: "#25C05D",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 8 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyImage: { width: 180, height: 180, marginBottom: 16, opacity: 0.8 },
});
