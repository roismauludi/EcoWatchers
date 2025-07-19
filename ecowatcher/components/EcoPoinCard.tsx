import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/types";// Pastikan path ini sesuai

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TukarPoint"
>;

const EcoPoinCard = () => {
  const navigation = useNavigation<NavigationProp>();
  const [poinAktif, setPoinAktif] = useState<number>(0);
  const [totalPoinMasuk, setTotalPoinMasuk] = useState<number>(0);
  const [totalPoinKeluar, setTotalPoinKeluar] = useState<number>(0);

  const formatNumber = (number: number) => {
    return number.toLocaleString('id-ID');
  };

  useEffect(() => {
    const fetchPoinData = async () => {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (userEmail) {
        console.log('DEBUG DB EcoPoinCard:', db);
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
    <LinearGradient
      colors={["#2ECC71", "#27AE60"]}
      style={styles.cardContainer}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <FontAwesome5 name="coins" size={24} color="white" />
          <Text style={styles.cardTitle}>EcoPoin</Text>
        </View>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.poinText}>Poin Aktif</Text>
            <Text style={styles.poinValue}>{formatNumber(poinAktif)}</Text>
          </View>

          <TouchableOpacity
            style={styles.exchangeButton}
            onPress={() => navigation.navigate("TukarPoint")}
          >
            <MaterialIcons
              name="swap-horiz"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.exchangeText}>Tukar Poin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.poinDetails}>
          <View style={styles.poinItem}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={20}
              color="white"
            />
            <Text style={styles.poinLabel}>Total Poin Masuk</Text>
            <Text style={styles.poinValueSmall}>{formatNumber(totalPoinMasuk)} Poin</Text>
          </View>

          <View style={styles.poinItem}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="white" />
            <Text style={styles.poinLabel}>Total Poin Keluar</Text>
            <Text style={styles.poinValueSmall}>{formatNumber(totalPoinKeluar)} Poin</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 15,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  poinText: {
    color: "white",
    fontSize: 16,
  },
  poinValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  exchangeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  exchangeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  poinDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F9F50",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  poinItem: {
    alignItems: "center",
    width: "48%",
  },
  poinLabel: {
    color: "white",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  poinValueSmall: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
});

export default EcoPoinCard;
