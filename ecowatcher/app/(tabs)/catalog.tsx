import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Tetap sama meskipun di Expo

type CatalogScreenProps = NativeStackScreenProps<any, 'Catalog'>; // Definisikan tipe props

const CatalogScreen: React.FC<CatalogScreenProps> = ({ navigation }) => {
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
        Anda dapat memeriksa beberapa daftar dan jenis sampah yang dapat disetorkan pada katalog ini
      </Text>

      {/* Image */}
      <Image
        style={styles.image}
        source={{ uri: 'https://via.placeholder.com/150' }} // Ganti dengan URL gambar yang sesuai
      />

      {/* Mulai Button */}
      <TouchableOpacity style={styles.button} onPress={() => alert('Mulai Katalog')}>
        <Text style={styles.buttonText}>Mulai</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
  },
  backText: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CatalogScreen;
