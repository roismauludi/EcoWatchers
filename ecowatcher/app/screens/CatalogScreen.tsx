import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CONFIG from '../config';
import { useSelectedItems } from '../(tabs)/context/SelectedItemsContext'; // Pastikan path benar
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { CatalogItem } from "../CatalogItem";

const imageAssets: { [key: string]: any } = {
  "default-sampah.png": require("../../assets/images/default-sampah.png"),
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

const CatalogScreen = () => {
  const { selectedItems, setSelectedItems } = useSelectedItems(); 
  const [catalogData, setCatalogData] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchText, setSearchText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [numColumns, setNumColumns] = useState(3);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/catalog`);
        if (!response.ok) {
          throw new Error('Error fetching catalog data');
        }
        const data: CatalogItem[] = await response.json();
    
        // Tambahkan properti `quantity` jika tidak ada
        const dataWithQuantity = data.map(item => ({
          ...item,
          quantity: item.quantity ?? 1, // Default ke 1 jika `quantity` tidak ada
        }));
    
        setCatalogData(dataWithQuantity);
      } catch (error) {
        console.error('Error fetching catalog data: ', error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchCatalogData();
  }, []);
  

  const filteredData = catalogData.filter((item) => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearchText = item.name.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearchText;
  });

  const handleItemPress = (item: CatalogItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setNumColumns(category === 'Semua' ? 3 : 2);
  };

  const handleAddToTong = (item: CatalogItem) => {
    // Pemetaan kategori ke tipe yang lebih spesifik
    const categoryMapping: { [key: string]: string } = {
      Elektronik: 'Non-organik-elektronik',
      Kaca: 'Non-organik-kaca',
      Kertas: 'Non-organik-kertas',
      Logam: 'Non-organik-logam',
      Minyak: 'Non-organik-minyak',
      Plastik: 'Non-organik-plastik',
    };
  
    // Tentukan tipe berdasarkan kategori item
    const itemType = categoryMapping[item.category] || 'Non-organik-lainnya'; 
  
    // Log data item yang akan ditambahkan
    console.log('Item yang ditambahkan:', { ...item, type: itemType });
  
    // Cek jika item sudah ada di Tong
    const isItemAlreadyInTong = selectedItems.some(selected => selected.id === item.id);
    
    if (!isItemAlreadyInTong) {
      // Tambahkan item dengan tipe yang telah diperbarui
      setSelectedItems(prevItems => [
        ...prevItems,
        { ...item, type: itemType } // Pastikan `type` ditambahkan dengan benar
      ]);
    } else {
      alert("Item sudah ada di Tong!");
    }
  
    // Navigasi ke halaman Tong setelah item ditambahkan
    navigation.navigate('Tong');
  };  

  const getImageSource = (imagePath: string) => {
    return imageAssets[imagePath] || { uri: imagePath }; 
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari item?"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>

      <View style={styles.categoryWrapper}>
        {['Semua', 'Elektronik', 'Kaca', 'Kertas', 'Logam', 'Minyak', 'Plastik'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterButton, selectedCategory === category && styles.filterButtonSelected]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text style={[styles.filterText, selectedCategory === category && styles.filterTextSelected]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        key={selectedCategory}
        data={filteredData}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.card}>
              <Image source={getImageSource(item.image)} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{item.category}</Text>
              <Text style={styles.itemPoints}>
                {item.points} Poin / {item.unit}
              </Text>
              <TouchableOpacity onPress={() => handleAddToTong(item)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Tambah ke Tong</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada item ditemukan</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {selectedItem && (
        <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalContainer}>
            <Image source={getImageSource(selectedItem.image)} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
            <Text style={styles.modalText}>{selectedItem.category}</Text>
            <Text style={styles.modalPoints}>
              {selectedItem.points} Poin / {selectedItem.unit}
            </Text>
            <Text style={styles.modalDescription}>{selectedItem.description}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
  },
  categoryWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  filterButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
  },
  filterTextSelected: {
    color: 'white',
  },
  card: {
    width: '30%',
    marginRight: '3%',
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemType: {
    fontSize: 12,
    color: 'gray',
  },
  itemPoints: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalImage: {
    width: 200,
    height: 200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: 'gray',
  },
  modalPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalDescription: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
  },
  listContainer: {
    paddingBottom: 30,
  },
});

export default CatalogScreen;
