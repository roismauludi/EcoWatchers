// app/(tabs)/penyetoran.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PickUpScreen from "../screens/PickUpScreen";

type RootStackParamList = {
  MainTabs: undefined;
  PickUp: undefined;
};

export default function PickUp() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <PickUpScreen />
    </View>
  );
}