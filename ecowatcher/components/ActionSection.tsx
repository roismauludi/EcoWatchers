import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/types"; // Ensure this import is correct

type ActionSectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

const { width } = Dimensions.get("window");

const ActionSection = () => {
  const navigation = useNavigation<ActionSectionNavigationProp>();

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Catalog")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={30} color="#4CAF50" />
        </View>
        <Text style={styles.actionText}>Katalog</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("DropPoint")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={30} color="#4CAF50" />
        </View>
        <Text style={styles.actionText}>Drop Point</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("PickUp")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="car-outline" size={30} color="#4CAF50" />
        </View>
        <Text style={styles.actionText}>Pick Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Education")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={30} color="#4CAF50" />
        </View>
        <Text style={styles.actionText}>Edukasi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    paddingVertical: 20,
    borderRadius: 10,
  },
  actionButton: {
    backgroundColor: "#EAF7EF",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    width: (width - 80) / 4, // 4 equal buttons based on screen width
  },
  iconContainer: {
    backgroundColor: "#E0F2E9", // light background for the icon
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  actionText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ActionSection;
