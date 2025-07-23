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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/types";

type ActionSectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

const { width } = Dimensions.get("window");

const ActionSection = () => {
  const navigation = useNavigation<ActionSectionNavigationProp>();

  return (
    <View style={styles.actions}>
      {[
        { icon: "book-outline", label: "Katalog", route: "Catalog" },
        { icon: "car-outline", label: "Pick Up", route: "PickUp" },
        { icon: "information-outline", label: "Channels", route: "Channels" },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={() => navigation.navigate(item.route)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={26} color="#4CAF50" />
          </View>
          <Text style={styles.actionText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  iconContainer: {
    backgroundColor: "#E0F2E9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  actionText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default ActionSection;
