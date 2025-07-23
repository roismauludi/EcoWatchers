import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Add this
import { RootStackParamList } from '../../utils/types'; // Import type RootStackParamList if applicable
import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';

// Define navigation type
type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>(); // Use correct navigation type

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'Dashboard' });
  }, []);

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