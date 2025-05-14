import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Add this
import { RootStackParamList } from '../types'; // Import type RootStackParamList if applicable

// Define navigation type
type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>(); // Use correct navigation type

  return (
    <ScrollView style={styles.container}>
      {/* Dashboard content */}

      {/* Add a button to navigate to Catalog */}
      <TouchableOpacity
        style={styles.catalogButton}
        onPress={() => navigation.navigate('Catalog')} // Ensure 'Catalog' is a valid name
      >
        <Text style={styles.catalogButtonText}>Buka Katalog Sampah</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  catalogButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  catalogButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;