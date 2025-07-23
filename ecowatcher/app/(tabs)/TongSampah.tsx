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
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
import { useSelectedItems } from "../../context/SelectedItemsContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types";
import { CatalogItem } from "../../utils/CatalogItem";
import { getAuth } from "firebase/auth";
import CONFIG from "../config";

const imageMapping: { [key: string]: any } = {
  "default-sampah.jpg": require("../../assets/images/default-sampah.jpg"),
  "monitor-lcd.jpg": require("../../assets/images/elektronik/monitor-lcd.jpg"),
  "monitor-tabung.jpg": require("../../assets/images/elektronik/monitor-tabung.jpg"),
  "botol_kaca.png": require("../../assets/images/kaca/botol_kaca.png"),
  "pecahan_kaca.jpg": require("../../assets/images/kaca/pecahan_kaca.jpg"),
  "buku.jpg": require("../../assets/images/kertas/buku.jpg"),
  "duplex.jpg": require("../../assets/images/kertas/duplex.jpg"),
  "kardus.png": require("../../assets/images/kertas/kardus.png"),
  "kertas_nota.jpg": require("../../assets/images/kertas/kertas_nota.jpg"),
  "aluminium.png": require("../../assets/images/logam/aluminium.png"),
  "besi-padu.png": require("../../assets/images/logam/besi-padu.png"),
  "kuningan.png": require("../../assets/images/logam/kuningan.png"),
  "kaleng.png": require("../../assets/images/logam/kaleng.png"),
  "minyak_jelantah.jpg": require("../../assets/images/minyak/minyak_jelantah.jpg"),
  "botol-atom.png": require("../../assets/images/plastik/botol-atom.png"),
  "botol_plastik.png": require("../../assets/images/plastik/botol_plastik.png"),
  "ember_plastik.png": require("../../assets/images/plastik/ember_plastik.png"),
  "gelas_plastik.jpg": require("../../assets/images/plastik/gelas_plastik.jpg"),
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
  const [selectAll, setSelectAll] = useState(false);

  const handleDelete = () => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => !markedItems.includes(item.id))
    );
    setMarkedItems([]);
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

  // Fungsi untuk toggle semua item
  const handleSelectAll = () => {
    if (selectedItems.length === 0) return;
    if (selectAll) {
      setMarkedItems([]);
    } else {
      setMarkedItems(selectedItems.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll jika markedItems berubah
  React.useEffect(() => {
    setSelectAll(
      selectedItems.length > 0 && markedItems.length === selectedItems.length
    );
  }, [markedItems, selectedItems]);

  const renderItem = ({ item }: { item: CatalogItem }) => {
    // Tentukan satuan point
    const isElektronik = (item.type || item.category || '').toLowerCase().includes('elektronik');
    const pointUnit = isElektronik ? 'Poin / Unit' : 'Poin / Kg';
    return (
      <View style={styles.itemContainer}>
        <Checkbox
          value={markedItems.includes(item.id)}
          onValueChange={() => handleToggleItem(item)}
          style={{ marginRight: 10 }}
        />
        <Image source={getImageSource(item.image)} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text
              style={{
                marginLeft: 8,
                color: "#35C759",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              x{item.quantity || 1}
            </Text>
          </View>
          <Text style={styles.itemType}>{item.type || item.category}</Text>
          <Text style={{ color: "#35C759", fontWeight: "bold", fontSize: 14 }}>
            {item.points} {pointUnit}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => handleShowDetails(item)}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Quantity di pojok kanan bawah */}
        <View style={styles.quantityFloatingContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (item.quantity || 1) <= 1 && styles.quantityButtonDisabled
            ]}
            onPress={() => handleQuantityChange(item.id, -1)}
            disabled={(item.quantity || 1) <= 1}
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
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSolid}>
        <Text style={styles.title}>Tong Sampah</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox
            value={selectAll}
            onValueChange={handleSelectAll}
            disabled={selectedItems.length === 0}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: selectedItems.length === 0 ? "#BDBDBD" : "#333",
              fontSize: 14,
            }}
          >
            Pilih Semua
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          disabled={markedItems.length === 0}
        >
          <Text
            style={{
              color: markedItems.length === 0 ? "#BDBDBD" : "#E53935",
              fontSize: 14,
            }}
          >
            Hapus
          </Text>
        </TouchableOpacity>
      </View>

      {selectedItems.length > 0 ? (
        <FlatList
          data={selectedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 220 }} // padding bawah lebih besar agar item tidak terpotong
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      ) : (
        <Text style={styles.emptyCartText}>Tidak ada item di tong sampah.</Text>
      )}

      <SafeAreaView edges={['bottom']}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: markedItems.length === 0 ? "#BDBDBD" : "#35C759",
              },
            ]}
            onPress={() => {
              const itemsToSubmit = selectedItems.filter((item) =>
                markedItems.includes(item.id)
              );
              if (itemsToSubmit.length === 0) return;
              navigation.navigate("Penyetoran", { items: itemsToSubmit });
            }}
            disabled={markedItems.length === 0}
          >
            <Text style={styles.submitButtonText}>Setorkan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
    paddingTop: 110, // agar konten tidak tertutup header
  },
  header: {
    // dihapus, diganti headerGradient
  },
  headerSolid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#35C759",
  },
  title: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    flexShrink: 1,
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
    color: "#FF5722", // You can change the color as per your design preference
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  quantityButton: {
    backgroundColor: "#35C759",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    minWidth: 32,
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
  emptyCartText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  quantityFloatingContainer: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
