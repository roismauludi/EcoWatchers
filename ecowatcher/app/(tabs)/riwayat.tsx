import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const transactions = [
  {
    id: "1",
    type: "Masuk",
    icon: "truck", // Ikon pick up
    title: "Pick Up",
    date: "22 Oktober 2024 : 15:30 WIB",
    points: "+4400 Poin",
    color: "#2ECC71", // Hijau untuk poin masuk
  },
  {
    id: "2",
    type: "Masuk",
    icon: "map-marker-alt", // Ikon drop point
    title: "Drop Point",
    date: "22 Oktober 2024 : 10:24 WIB",
    points: "+3000 Poin",
    color: "#2ECC71",
  },
  {
    id: "3",
    type: "Masuk",
    icon: "map-marker-alt",
    title: "Drop Point",
    date: "20 Oktober 2024 : 13:30 WIB",
    points: "+1400 Poin",
    color: "#2ECC71",
  },
  {
    id: "4",
    type: "Keluar",
    icon: "sync-alt", // Ikon tukar poin
    title: "Tukar Poin",
    date: "20 Oktober 2024 : 08:00 WIB",
    points: "-10100 Poin",
    color: "#E74C3C", // Merah untuk poin keluar
  },
  {
    id: "5",
    type: "Keluar",
    icon: "sync-alt",
    title: "Tukar Poin",
    date: "19 Oktober 2024 : 17:05 WIB",
    points: "-10100 Poin",
    color: "#E74C3C",
  },
  {
    id: "6",
    type: "Masuk",
    icon: "truck",
    title: "Pick Up",
    date: "07 Oktober 2024 : 16:24 WIB",
    points: "+1500 Poin",
    color: "#2ECC71",
  },
];

const RiwayatScreen = () => {
  return (
    <LinearGradient colors={["#2ECC71", "#27AE60"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>Cari Transaksi</Text>
        <View style={styles.datePicker}>
          <Ionicons name="calendar-outline" size={20} color="#2ECC71" />
          <Text style={styles.dateText}>Pilih Jadwal</Text>
          <Text style={styles.selectedDate}>Bulan Ini</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#2ECC71" />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.transactionTitleRow}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={[styles.transactionPoints, { color: item.color }]}>
                  {item.points}
                </Text>
              </View>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    paddingVertical: 15,
    backgroundColor: "#2ECC71",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  searchContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
    marginBottom: 10,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
    color: "#2ECC71",
  },
  selectedDate: {
    fontSize: 16,
    color: "#888",
  },
  searchButton: {
    marginTop: 20,
    backgroundColor: "#2ECC71",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#f2f2f2",
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  transactionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  transactionPoints: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
  },
});

export default RiwayatScreen;
