import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const EcoPointSection = () => {
  return (
    <View style={styles.ecoPointSection}>
      <Text style={styles.ecoPointTitle}>EcoPoin</Text>
      <Text style={styles.ecoPointValue}>Poin Aktif</Text>
      <Text style={styles.ecoPointNumber}>16500 Poin</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Tukar Poin</Text>
      </TouchableOpacity>
      <View style={styles.pointInfo}>
        <Text>Total Poin Masuk: 26800 Poin</Text>
        <Text>Total Poin Keluar: 10100 Poin</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ecoPointSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  ecoPointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ecoPointValue: {
    fontSize: 16,
    marginTop: 10,
  },
  ecoPointNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  pointInfo: {
    marginTop: 10,
  },
});

export default EcoPointSection;
