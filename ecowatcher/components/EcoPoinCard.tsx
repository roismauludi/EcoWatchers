import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/types"; // Pastikan path ini sesuai

// Menentukan tipe untuk navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'TukarPoint'>;

const EcoPoinCard = () => {
  const navigation = useNavigation<NavigationProp>(); // Menambahkan tipe di sini
  const [poinAktif, setPoinAktif] = useState<number>(0);
  const [totalPoinMasuk, setTotalPoinMasuk] = useState<number>(0);
  const [totalPoinKeluar, setTotalPoinKeluar] = useState<number>(0);

  useEffect(() => {
    const fetchPoinData = async () => {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (userEmail) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();
            setPoinAktif(data.point || 0);
            setTotalPoinMasuk(data.totalpointmasuk || 0);
            setTotalPoinKeluar(data.totalpointkeluar || 0);
          }
        });

        return () => unsubscribe();
      }
    };

    fetchPoinData();
  }, []);

  return (
    <LinearGradient colors={["#2ECC71", "#27AE60"]} style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <FontAwesome5 name="coins" size={24} color="white" />
          <Text style={styles.cardTitle}>EcoPoin</Text>
        </View>
        <Text style={styles.poinText}>Poin Aktif</Text>
        <Text style={styles.poinValue}>{poinAktif} Poin</Text>

        <TouchableOpacity
          style={styles.exchangeButton}
          onPress={() => navigation.navigate("TukarPoint")} // Navigasi ke halaman TukarPoint
        >
          <MaterialIcons
            name="swap-horiz"
            size={24}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.exchangeText}>Tukar Poin</Text>
        </TouchableOpacity>

        <View style={styles.poinDetails}>
          <View style={styles.poinItem}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={20}
              color="white"
            />
            <Text style={styles.poinLabel}>Total Poin Masuk</Text>
            <Text style={styles.poinValueSmall}>{totalPoinMasuk} Poin</Text>
          </View>

          <View style={styles.poinItem}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="white" />
            <Text style={styles.poinLabel}>Total Poin Keluar</Text>
            <Text style={styles.poinValueSmall}>{totalPoinKeluar} Poin</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: { backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  poinText: { color: "white", fontSize: 16, marginTop: 8 },
  poinValue: { color: "white", fontSize: 32, fontWeight: "bold" },
  exchangeButton: {
    marginTop: 12,
    backgroundColor: "#5EDB7E",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  exchangeText: { color: "white", fontWeight: "bold", fontSize: 16 },
  buttonIcon: { marginRight: 10 },
  poinDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  poinItem: { alignItems: "center" },
  poinLabel: { color: "white", fontSize: 14 },
  poinValueSmall: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default EcoPoinCard;
