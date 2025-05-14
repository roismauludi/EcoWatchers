import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CariTransaksi = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Cari Transaksi</Text>

      {/* Date Picker */}
      <TouchableOpacity style={styles.datePicker}>
        <View style={styles.datePickerLeft}>
          <Ionicons name="calendar-outline" size={20} color="#2ECC71" />
          <Text style={styles.dateText}>Pilih Jadwal</Text>
        </View>
        <View style={styles.datePickerRight}>
          <Text style={styles.selectedDate}>Bulan Ini</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#888" />
        </View>
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Cari</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    margin: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
    marginBottom: 15,
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 20,
  },
  datePickerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  datePickerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#2ECC71",
  },
  selectedDate: {
    fontSize: 16,
    color: "#888",
    marginRight: 10,
  },
  searchButton: {
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
});

export default CariTransaksi;
