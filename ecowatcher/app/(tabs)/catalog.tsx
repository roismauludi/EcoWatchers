import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // Tetap sama meskipun di Expo
import { useSelectedItems } from "../../context/SelectedItemsContext";

type CatalogScreenProps = NativeStackScreenProps<any, "Catalog">; // Definisikan tipe props

const dummyCatalog = [
  {
    id: "1",
    name: "Botol Kaca",
    category: "Non-Organik Kaca",
    points: 1500,
    image: "botol_kaca.png",
    description: "Botol kaca bekas minuman",
  },
  {
    id: "2",
    name: "Ember Plastik",
    category: "Non-Organik Plastik",
    points: 1400,
    image: "ember_plastik.png",
    description: "Ember plastik bekas",
  },
];

const CatalogScreen: React.FC<CatalogScreenProps> = ({ navigation }) => {
  const { selectedItems, setSelectedItems } = useSelectedItems();

  const handleAddToTong = (itemBaru: any) => {
    const existing = selectedItems.find((i) => i.id === itemBaru.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === itemBaru.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...itemBaru, quantity: 1 }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Katalog Sampah */}
      <Text style={styles.title}>Katalog Sampah</Text>
      <Text style={styles.description}>
        Anda dapat memeriksa beberapa daftar dan jenis sampah yang dapat
        disetorkan pada katalog ini
      </Text>

      {/* Daftar Item Katalog */}
      {dummyCatalog.map((item) => (
        <View
          key={item.id}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginVertical: 8,
            width: "100%",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{item.name}</Text>
          <Text style={{ color: "#666", marginBottom: 4 }}>
            {item.category}
          </Text>
          <Text
            style={{ color: "#35C759", fontWeight: "bold", marginBottom: 8 }}
          >
            {item.points} Poin / Kg
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#35C759",
              borderRadius: 8,
              padding: 10,
              alignItems: "center",
            }}
            onPress={() => handleAddToTong(item)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Tambah ke Tong
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
  },
  backText: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default CatalogScreen;
