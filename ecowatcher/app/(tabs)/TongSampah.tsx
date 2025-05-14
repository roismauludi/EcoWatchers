import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useSelectedItems } from "../(tabs)/context/SelectedItemsContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { CatalogItem } from "../CatalogItem";
import { getAuth } from "firebase/auth";
import CONFIG from "./../config";

const imageMapping: { [key: string]: any } = {
  "monitor-lcd.jpg": require("../../assets/images/elektronik/monitor-lcd.jpg"),
  "monitor-tabung.jpg": require("../../assets/images/elektronik/monitor-tabung.jpg"),
  "botol_kaca.png": require("../../assets/images/kaca/botol_kaca.png"),
  "pecahan_kaca.png": require("../../assets/images/kaca/pecahan_kaca.png"),
  "buku.jpg": require("../../assets/images/kertas/buku.jpg"),
  "duplex.png": require("../../assets/images/kertas/duplex.png"),
  "kardus.png": require("../../assets/images/kertas/kardus.png"),
  "kertas_nota.png": require("../../assets/images/kertas/kertas_nota.png"),
  "aluminium.png": require("../../assets/images/logam/aluminium.png"),
  "besi-padu.png": require("../../assets/images/logam/besi-padu.png"),
  "kuningan.png": require("../../assets/images/logam/kuningan.png"),
  "kaleng.png": require("../../assets/images/logam/kaleng.png"),
  "minyak_jelantah.png": require("../../assets/images/minyak/minyak_jelantah.png"),
  "botol-atom.png": require("../../assets/images/plastik/botol-atom.png"),
  "botol_plastik.png": require("../../assets/images/plastik/botol_plastik.png"),
  "ember_plastik.png": require("../../assets/images/plastik/ember_plastik.png"),
  "gelas_plastik.png": require("../../assets/images/plastik/gelas_plastik.png"),
};

const getImageSource = (imageName: string) => {
  return imageMapping[imageName] || imageMapping["default.png"];
};

export default function TongScreen() {
  const { selectedItems, setSelectedItems } = useSelectedItems();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [markedItems, setMarkedItems] = useState<string[]>([]);

  const handleDelete = () => {
    setSelectedItems([]);
  };

  const handleToggleItem = (item: CatalogItem) => {
    if (markedItems.includes(item.id)) {
      setMarkedItems(markedItems.filter((id) => id !== item.id));
    } else {
      setMarkedItems([...markedItems, item.id]);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      )
    );
  };

  const handleShowDetails = (item: CatalogItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Anda belum login");
      return;
    }

    const userId = user.uid;
    const itemsToSubmit = selectedItems.filter((item) =>
      markedItems.includes(item.id)
    );

    try {
      for (const item of itemsToSubmit) {
        await fetch(`${CONFIG.API_URL}/api/add-to-tong`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            itemId: item.id,
            name: item.name,
            description: item.description,
            image: item.image,
            type: item.type || item.category,
            points: item.points,
            quantity: item.quantity || 1,
          }),
        });
      }

      alert("Data berhasil disimpan");
      navigation.navigate("Penyetoran", { items: itemsToSubmit });
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    return (
      <View style={styles.itemContainer}>
        <Checkbox
          value={markedItems.includes(item.id)}
          onValueChange={() => handleToggleItem(item)}
        />
        <Image source={getImageSource(item.image)} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemType}>{item.type || item.category}</Text>
          <Text style={styles.itemPoints}>Points: {item.points}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleShowDetails(item)}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>Detail</Text>
            </TouchableOpacity>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity || 1}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tong Sampah</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteText}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Tidak ada item di tong sampah.</Text>}
      />
      {selectedItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Setorkan</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedItem && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedItem.name}</Text>
              <Text style={styles.modalDescription}>
                {selectedItem.description}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "#35C759",
    paddingVertical: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  deleteText: {
    fontSize: 16,
    color: "#E53935",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemType: {
    fontSize: 14,
    color: "#666",
  },
  itemPoints: {
    fontSize: 14,
    color: "#FF5722",  // You can change the color as per your design preference
    fontWeight: "bold",
  },  
  detailButton: {
    backgroundColor: "#35C759",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  detailButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: "#35C759",
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    minWidth: 30, // Untuk menjaga agar angka tetap rata
  },
  submitButton: {
    backgroundColor: "#35C759",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#35C759", // Hijau
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF", // Warna teks putih
    fontWeight: "bold",
    textAlign: "center",
  },
});
