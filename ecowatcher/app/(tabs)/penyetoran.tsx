// app/(tabs)/penyetoran.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PenyetoranScreen from "../screens/PenyetoranScreen";

type RootStackParamList = {
  MainTabs: undefined;
  Penyetoran: undefined;
};

export default function Penyetoran() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <PenyetoranScreen />
    </View>
  );
}
