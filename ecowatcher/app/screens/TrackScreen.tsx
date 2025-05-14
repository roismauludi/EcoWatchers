import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import CONFIG from './../config';
import moment from 'moment';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type PickupDetails = {
  queueNumber: string;
  newStatus: string;
  timestamp: string | number | Date;
  statuses: { status: string; timestamp: string | number | Date }[];
};

export default function TrackScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Track'>>();
  const { pickupId } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [pickupDetails, setPickupDetails] = React.useState<PickupDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPickupDetails = async () => {
      try {
        const response = await fetch(`${CONFIG.API_URL}/api/track-pickup/${pickupId}`);
        if (!response.ok) {
          throw new Error('Data tidak ditemukan');
        }
        const data = await response.json();
        
        // Convert timestamps
        if (data.timestamp) {
          data.timestamp = moment(data.timestamp).toDate();
        }
        
        // Convert and sort statuses by timestamp in descending order (newest first)
        if (data.statuses) {
          data.statuses = data.statuses
            .map((status: any) => ({
              ...status,
              timestamp: moment(status.timestamp).toDate()
            }))
            .sort((a: any, b: any) => 
              moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()
            );
        }
        
        setPickupDetails(data);
      } catch (error: any) {
        console.error(error);
        setError(error.message || 'Terjadi kesalahan dalam mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPickupDetails();
  }, [pickupId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#25C05D" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeline}>
        {pickupDetails?.statuses.map((status, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timeInfo}>
              <Text style={styles.date}>
                {moment(status.timestamp).format('DD MMM')}
              </Text>
              <Text style={styles.time}>
                {moment(status.timestamp).format('HH:mm')}
              </Text>
            </View>
            <View style={[
              styles.timelineDot,
              index === 0 && styles.activeDot
            ]} />
            <View style={styles.timelineContent}>
              <Text style={[
                styles.statusText,
                index === 0 && styles.activeStatus
              ]}>
                {status.status}
              </Text>
            </View>
            {index !== pickupDetails.statuses.length - 1 && (
              <View style={styles.timelineLine} />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timeInfo: {
    width: 50,
    marginRight: 15,
  },
  date: {
    fontSize: 12,
    color: '#666666',
  },
  time: {
    fontSize: 12,
    color: '#666666',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
    marginTop: 5,
    marginRight: 15,
    zIndex: 2,
  },
  activeDot: {
    backgroundColor: '#2196F3', // Blue dot for most recent status
  },
  timelineLine: {
    position: 'absolute',
    left: 64,
    top: 15,
    width: 2,
    height: '100%',
    backgroundColor: '#EEEEEE',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  activeStatus: {
    color: '#000000', // Darker text for most recent status
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});