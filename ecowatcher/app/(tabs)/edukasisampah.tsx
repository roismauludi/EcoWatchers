import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EducationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edukasi Pengelolaan Sampah</Text>
      <Text style={styles.text}>
        1. Pisahkan sampah organik dan anorganik.{'\n'}
        2. Gunakan kembali barang-barang yang masih bisa didaur ulang.{'\n'}
        3. Kurangi penggunaan plastik sekali pakai.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
