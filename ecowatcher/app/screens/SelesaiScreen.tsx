import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import CONFIG from "./../config";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

type Item = {
  description: string;
  image: string;
  userId: string;
  name: string;
  points: number;
  type: string;
  timestamp: string;
  itemId: string;
  quantity: number;
};

const imageMapping: { [key: string]: any } = {
  'default-sampah': require('../../assets/images/default-sampah.png'),
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
  return imageMapping[imageName] || imageMapping["default"];
};

export default function SelesaiScreen() {
  const [loading, setLoading] = useState(true);
  const [pickupData, setPickupData] = useState<any[]>([]); // Data untuk menyimpan pickup
  const [grandTotal, setGrandTotal] = useState<number>(0); // State untuk grandTotal
  const [isPointsSent, setIsPointsSent] = useState(false); // Tambahkan state untuk memeriksa apakah poin sudah dikirim
  const [pointsAdded, setPointsAdded] = useState(false); 

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const user = getAuth().currentUser;
        if (user) {
          const userId = user.uid;
          try {
            const response = await fetch(
              `${CONFIG.API_URL}/api/get-pickups/${userId}`
            );
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const result = await response.json();
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

  // Fungsi untuk menambahkan poin ke pengguna
  const addPointsToUser = async (pointsToAdd: number) => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;

      console.log("Mengirimkan poin ke backend:", pointsToAdd); // Memastikan poin yang dikirim benar

      try {
        const response = await fetch(`${CONFIG.API_URL}/api/add-points`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, points: pointsToAdd }),
        });

        if (!response.ok) {
          throw new Error("Gagal menambahkan poin");
        }

        console.log("Poin berhasil ditambahkan:", pointsToAdd);
      } catch (error) {
        console.error("Terjadi kesalahan saat menambahkan poin:", error);
      }
    }
  };

 // Fungsi untuk menghitung dan menambahkan poin
 useEffect(() => {
  const calculateAndAddPoints = async () => {
    for (let item of pickupData) {
      if (item.status === "Selesai") {
        const uniqueItemId = item.id; // ID utama pesanan sebagai identifier unik
        const pointsAdded = await AsyncStorage.getItem(`pointsAdded_${uniqueItemId}`);
        
        if (!pointsAdded) {
          const totalPoints = item.items.reduce((acc: number, subItem: Item) => {
            return acc + subItem.points * subItem.quantity;
          }, 0);

          const grandTotal = totalPoints - item.pickUpFee;
          
          if (grandTotal > 0) {
            console.log(`Mengirimkan poin untuk ${uniqueItemId}:`, grandTotal);
            await addPointsToUser(grandTotal); // Kirim poin ke backend
            await AsyncStorage.setItem(`pointsAdded_${uniqueItemId}`, "true"); // Tandai bahwa poin sudah ditambahkan
          } else {
            console.log(`Grand total untuk ${uniqueItemId} tidak valid:`, grandTotal);
          }
        } else {
          console.log(`Poin untuk ${uniqueItemId} sudah ditambahkan sebelumnya.`);
        }
      }
    }
  };

  if (pickupData.length > 0) {
    calculateAndAddPoints();
  }
}, [pickupData]);



  // Fungsi untuk merender konten Selesai
  const renderSelesaiContent = () => {
    const filteredData = pickupData.filter((item) => item.status === "Selesai");

    if (filteredData.length === 0) {
      return (
        <Text style={styles.placeholderText}>Tidak ada data selesai.</Text>
      );
    }

    return filteredData.map((item, index) => {
      const totalPoints = item.items.reduce((acc: number, subItem: Item) => {
        return acc + (subItem.points * subItem.quantity);
      }, 0);

      const grandTotal = totalPoints - item.pickUpFee;

      return (
        <View style={styles.cardContainer} key={index}>
          {/* Bagian Item */}
          <View style={styles.itemSection}>
            {item.items.map((subItem: Item, idx: number) => (
              <View style={styles.itemRow} key={idx}>
                <Image
                  source={getImageSource(subItem.image)}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{subItem.name}</Text>
                  <Text style={styles.itemPoints}>
                    {subItem.points} Poin / {subItem.type === "Non-organik-elektronik" ? "unit" : "Kg"}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    Kuantitas: {subItem.quantity || "Tidak tersedia"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tanggal dan Nama */}
          <View style={styles.infoSection}>
            <Text style={styles.dateText}>
              {new Date(item.pickUpDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long", // Nama bulan
                year: "numeric",
              })}
            </Text>
            <Text style={styles.userNameText}>
              {item.address?.Nama || "Nama tidak tersedia"} {/* Menampilkan nama pengguna */}
            </Text>
          </View>

          {/* Tabel Jenis Sampah */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColumn}>Jenis Sampah</Text>
              <Text style={styles.tableColumn}>Kuantitas</Text>
              <Text style={styles.tableColumn}>Harga Poin</Text>
              <Text style={styles.tableColumn}>Total Poin</Text>
            </View>
            {item.items.map((subItem: Item, idx: number) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableColumn}>{subItem.name}</Text>
                <Text style={styles.tableColumn}>
                  {subItem.quantity || "Tidak tersedia"}
                </Text>
                <Text style={styles.tableColumn}>
                  {subItem.points} Poin
                </Text>
                <Text style={styles.tableColumn}>
                  {subItem.points * subItem.quantity} Poin
                </Text>
              </View>
            ))}
            <View style={styles.tableFooter}>
              <Text style={styles.tableFooterText}>Total Poin: {grandTotal} Poin</Text>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        renderSelesaiContent()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  scrollView: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemSection: {
    flexDirection: "column",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemPoints: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  infoSection: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#888",
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableSection: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tableColumn: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tableFooter: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    textAlign: "center",
  },
  tableFooterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
    marginTop: 50,
  },
});
