import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function CampaignCard({ item, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.metaRow}>
          <FontAwesome5 name="calendar" size={12} color="#999" />
          <Text style={styles.metaText}> {item.date}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinText}>GABUNG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 12,
  },
  name: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#888",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: "#C6F6D5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  joinText: {
    color: "#27AE60",
    fontWeight: "bold",
    fontSize: 12,
  },
});
