// app/screens/TongSampahScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Penyetoran: undefined;
  // ... tambahkan screen lain jika ada
};

const TongSampahScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Tong Sampah
      </Text>
      {/* Your content here, e.g., list of items */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Total Sampah</Text>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>2 Jenis Sampah</Text>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#3B82F6",
          borderRadius: 50,
          padding: 16,
          marginTop: 24,
        }}
        onPress={() => navigation.navigate("Penyetoran")}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Setorkan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TongSampahScreen;