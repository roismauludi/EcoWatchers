import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");

interface XPProgressProps {
  currentXP: number; // XP saat ini
  maxXP: number; // XP maksimum untuk mencapai level berikutnya
}

const XPProgress: React.FC<XPProgressProps> = ({ currentXP, maxXP }) => {
  const progress = (currentXP / maxXP) * 100; // Menghitung persentase progress

  return (
    <View style={styles.container}>
      <View style={styles.xpTextContainer}>
        {/* Icon Bintang */}
        <FontAwesome5 name="star" size={20} color="#FFD700" />
      </View>

      {/* Teks XP*/}
      <Text style={styles.xpText}>
        {currentXP} XP / {maxXP} XP
      </Text>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.statusText}>
        Tinggal {maxXP - currentXP} XP lagi menuju level berikutnya!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8DC",
    padding: 20,
    borderRadius: 10,
    marginVertical: 15,
    width: width * 0.9,
    alignSelf: "center",
  },
  xpText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    color: "#555",
  },
});

export default XPProgress;
