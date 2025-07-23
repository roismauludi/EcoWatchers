import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface LocationTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  showAddress?: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  onLocationUpdate, 
  showAddress = false 
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin lokasi ditolak');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(currentLocation);
      
      if (onLocationUpdate) {
        onLocationUpdate({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      }

      if (showAddress) {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (geocode.length > 0) {
          const addressParts = [
            geocode[0].street,
            geocode[0].district,
            geocode[0].city,
            geocode[0].region,
          ].filter(Boolean);
          
          setAddress(addressParts.join(', '));
        }
      }
    } catch (error) {
      setErrorMsg('Gagal mendapatkan lokasi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : (
        <TouchableOpacity onPress={getLocation} style={styles.button}>
          <Ionicons name="location" size={24} color="#4CAF50" />
          <Text style={styles.buttonText}>Dapatkan Lokasi</Text>
        </TouchableOpacity>
      )}
      
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : location ? (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Long: {location.coords.longitude.toFixed(6)}
          </Text>
          {showAddress && address && (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  locationInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LocationTracker; 