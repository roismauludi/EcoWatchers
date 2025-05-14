import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TukarPointScreen = () => {
  const [poinAktif, setPoinAktif] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Menambahkan state untuk userId

  const vouchers = [
    { id: "1", nominal: 10000, pointRequired: 10000 },
    { id: "2", nominal: 20000, pointRequired: 20000 },
    { id: "3", nominal: 50000, pointRequired: 50000 },
    { id: "4", nominal: 100000, pointRequired: 100000 },
  ];

  useEffect(() => {
    const fetchPoinData = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
      if (email) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          setPoinAktif(data.point || 0);
          setUserId(userDoc.id); // Mendapatkan userId dan menyimpannya dalam state
        }
      }
    };

    fetchPoinData();
  }, []);

  const handleExchange = async (voucher: { id: string; nominal: number; pointRequired: number }) => {
    if (poinAktif >= voucher.pointRequired) {
      try {
        if (userEmail && userId) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, "users", userDoc.id);
            const userData = userDoc.data();
  
            const updatedPoint = poinAktif - voucher.pointRequired;
            const updatedTotalPointKeluar = (userData.totalpointkeluar || 0) + voucher.pointRequired;
  
            // Update Firestore data untuk user
            await updateDoc(userDocRef, {
              point: updatedPoint,
              totalpointkeluar: updatedTotalPointKeluar,
            });
  
            // Simpan transaksi ke koleksi transactions dengan status 'Diajukan'
            const transactionsRef = collection(db, "transactions");
            await addDoc(transactionsRef, {
              email: userEmail,
              userId: userId, // Mengirimkan userId dalam transaksi
              nama: userData.nama,
              jenisBank: userData.jenisBank,
              noRekening: userData.noRekening,
              namaRekening: userData.namaRekening,
              nominal: voucher.nominal,
              pointUsed: voucher.pointRequired,
              timestamp: new Date().toISOString(),
              status: "Diajukan", // Menambahkan status "Diajukan" pada transaksi
            });
  
            setPoinAktif(updatedPoint);
  
            Alert.alert(
              "Pengajuan Penukaran Berhasil",
              `Anda telah menukar ${voucher.pointRequired} poin untuk voucher Rp${voucher.nominal.toLocaleString()}.`
            );
          }
        }
      } catch (error) {
        Alert.alert("Kesalahan", "Terjadi kesalahan saat menukar poin.");
        console.error(error);
      }
    } else {
      Alert.alert("Poin Tidak Cukup", "Anda tidak memiliki cukup poin untuk voucher ini.");
    }
  };  

  return (
    <LinearGradient colors={["#27AE60", "#2ECC71"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tukar Poin</Text>
        <Text style={styles.poinText}>Poin Aktif: {poinAktif} Poin</Text>
      </View>

      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rewardItem}>
            <Text style={styles.rewardName}>Voucher Rp{item.nominal.toLocaleString()}</Text>
            <Text style={styles.rewardPoint}>{item.pointRequired} Poin</Text>
            <TouchableOpacity
              style={styles.exchangeButton}
              onPress={() => handleExchange(item)}
            >
              <Text style={styles.exchangeButtonText}>Tukar</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  poinText: {
    fontSize: 18,
    color: "white",
    marginTop: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  rewardItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rewardPoint: {
    fontSize: 14,
    color: "#27AE60",
  },
  exchangeButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  exchangeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default TukarPointScreen;
