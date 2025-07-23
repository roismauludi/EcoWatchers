import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types";
import { getAuth } from "firebase/auth";
import CONFIG from "../config";
import { useFocusEffect } from '@react-navigation/native';

type Item = {
  description: string;
  image: string;
  userId: string;
  name: string;
  points: number;
  type: string;
  timestamp: string;
  itemId: string;
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
  return imageMapping[imageName] || imageMapping["default"];
};

// Komponen utama untuk DibatalkanScreen
export default function DibatalkanScreen() {
  const [activeTab, setActiveTab] = useState("Dibatalkan");
  const [loading, setLoading] = useState(true);
  const [pickupData, setPickupData] = useState<any[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Memastikan data diperbarui setiap kali tab "Dibatalkan" dibuka
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const user = getAuth().currentUser;
        if (user) {
          const userId = user.uid;
          try {
            const response = await fetch(`${CONFIG.API_URL}/api/get-pickups/${userId}`);
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const result = await response.json();
            console.log("API Response:", result);
            if (result.data) {
              setPickupData(result.data);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setLoading(false);
          }
        }
      };
      fetchData();
    }, [])
  );

  const renderDibatalkanContent = () => {
    const filteredData = pickupData.filter(item => item.status === "Dibatalkan");
    console.log("Filtered Data:", filteredData);
    if (filteredData.length === 0) {
      return <Text style={styles.placeholderText}>Tidak ada data yang dibatalkan.</Text>;
    }

    return filteredData.map((item, index) => (
      <View style={styles.contentContainer} key={index}>
        <Text style={styles.sectionTitle}>Dibatalkan</Text>
        <View style={styles.cardContainer}>
          {item.items.map((subItem: Item, idx: number) => {
            const pointUnit = subItem.type === "Non-organik-elektronik" ? "/ unit" : "/ Kg";
            return (
              <View style={styles.card} key={idx}>
                <Image
                  source={getImageSource(subItem.image)}
                  style={styles.cardImage}
                />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle}>{subItem.name || "Tidak diketahui"}</Text>
                  <Text style={styles.cardSubtitle}>{subItem.type || "Jenis tidak diketahui"}</Text>
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
            {item.items.length} Sampah
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Sampah dijadwalkan pada: </Text>
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
              const itemId = item.items[0]?.itemId;
              if (itemId) {
                navigation.navigate('Rincian', { id: itemId, pickupId: item.id });
              } else {
                console.log('ItemId tidak ditemukan');
              }
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
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {["Dibatalkan"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTab]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#25C05D" />
        ) : activeTab === "Dibatalkan" ? (
          renderDibatalkanContent()
        ) : (
          <Text style={styles.placeholderText}>
            Konten untuk tab {activeTab} sedang dalam pengembangan.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabText: {
    fontSize: 14,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  activeTab: {
    color: "#25C05D",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#25C05D",
  },
  content: {
    padding: 16,
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#424242",
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
  cardImage: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  cardDetails: {
    alignItems: "center",
  },
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
  cardPoints: {
    fontSize: 12,
    color: "#25C05D",
    fontWeight: "bold",
  },
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
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#424242",
  },
  detailButton: {
    backgroundColor: "#25C05D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  detailButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  placeholderText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 50,
  },
});
