// app/(tabs)/catalog.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  PixelRatio,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import CONFIG from "../config";
import { useSelectedItems } from "../../context/SelectedItemsContext";
import { RootStackParamList } from "../../utils/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CatalogItem } from "../../utils/CatalogItem";
import { LinearGradient } from "expo-linear-gradient";
import analytics from '@react-native-firebase/analytics';

const imageAssets: { [key: string]: any } = {
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
const CatalogScreen = () => {
  const { selectedItems, setSelectedItems } = useSelectedItems();
  const [catalogData, setCatalogData] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchText, setSearchText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const onSelectItem = (route.params as any)?.onSelectItem;

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'Catalog' });
  }, []);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/catalog`);
        const data: CatalogItem[] = await response.json();
        const withQuantity = data.map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
        }));
        setCatalogData(withQuantity);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  const filteredData = catalogData.filter((item) => {
    const matchCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToPenyetoran = (item: CatalogItem) => {
    if (onSelectItem) {
      onSelectItem(item);
      navigation.goBack();
      return;
    }
    // fallback ke tong jika tidak ada callback
    const mapping: Record<string, string> = {
      Elektronik: "Non-organik-elektronik",
      Kaca: "Non-organik-kaca",
      Kertas: "Non-organik-kertas",
      Logam: "Non-organik-logam",
      Minyak: "Non-organik-minyak",
      Plastik: "Non-organik-plastik",
    };
    const type = mapping[item.category as string] || "Non-organik-lainnya";
    const isExist = selectedItems.some((i) => i.id === item.id);
    if (isExist) {
      alert("Item sudah ada di Tong!");
      return;
    }
    setSelectedItems([
      ...selectedItems,
      { ...item, type, category: item.category ?? "Tidak Diketahui" },
    ]);
    navigation.navigate('Tong');
  };

  const getImageSource = (path: string) => imageAssets[path] || { uri: path };

  const CATEGORIES = [
    "Semua",
    "Elektronik",
    "Kaca",
    "Kertas",
    "Logam",
    "Minyak",
    "Plastik",
  ];

  const { width } = Dimensions.get("window");
  const CARD_WIDTH = (width - 32 - 16) / 2; // padding container 16 + marginHorizontal kartu 8*2

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4CAF50", "#43e97b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Katalog Sampah</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari sampah?"
            placeholderTextColor="#B7B7B7"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
        </View>
      </LinearGradient>
      <View style={styles.typeLabelContainer}>
        <Text style={styles.typeLabelTitle}>Jenis Sampah</Text>
        <Text style={styles.typeLabelDesc}>Pilih sampahmu dan setorkan!</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterScrollContent}
        style={styles.filterScroll}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.filterButton,
              selectedCategory === cat && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.9}
              allowFontScaling={true}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        style={{ alignSelf: 'flex-start' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.cardImageWrapper}>
              <Image source={getImageSource(item.image)} style={styles.image} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.categoryCard}>{item.category}</Text>
            <Text style={styles.pointsCard}>
              {item.points} Poin / {item.unit}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToPenyetoran(item)}
            >
              <Text style={styles.addButtonText}>Tambah ke Tong</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30, color: "#888" }}>
            Tidak ada data untuk kategori ini.
          </Text>
        }
        ListFooterComponent={<View style={{ height: 160 }} />}
      />
      {selectedItem && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <Image
              source={getImageSource(selectedItem.image)}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
            <Text>{selectedItem.category}</Text>
            <Text>
              {selectedItem.points} Poin / {selectedItem.unit}
            </Text>
            <Text style={styles.modalDescription}>
              {selectedItem.description}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 16) / 2; // padding container 16 + marginHorizontal kartu 8*2

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f5f5" },
  headerGradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 30,
    paddingTop: 50,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#333",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginBottom: 5,
  },
  typeLabelContainer: {
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 20,
  },
  typeLabelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  typeLabelDesc: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  filterScroll: {
    marginTop: 2,
    paddingHorizontal: 0, // biar lebih rapat
    marginBottom: 10, // beri jarak lebih besar ke card agar responsif
    minHeight: 50,
  },
  filterScrollContent: {
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: "center",
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap", // agar responsif jika banyak kategori
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    minHeight: 30,
    elevation: 0,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: Math.max(13, Math.round(width * 0.038)),
    color: "#4CAF50",
    fontWeight: "700",
    textAlign: "center",
    alignSelf: "center",
    maxWidth: 90,
    minWidth: 40,
    paddingHorizontal: 2,
  },
  filterTextActive: {
    color: "#fff",
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 160, // perbesar padding bawah agar item terakhir tidak tertutup
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    width: CARD_WIDTH,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    alignItems: "center",
  },
  cardImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 2,
  },
  categoryCard: {
    fontSize: 12,
    color: "#6c6c6c",
    textAlign: "center",
    marginBottom: 2,
  },
  pointsCard: {
    fontSize: 13,
    color: "#1db954",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  addButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  modal: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 24,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default CatalogScreen;
