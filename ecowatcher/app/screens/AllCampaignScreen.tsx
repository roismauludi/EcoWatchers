import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Entypo, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CONFIG from '../config';
import { RootStackParamList } from '../../utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';

const CampaignListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'AllCampaign' });
  }, []);

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/campaigns`);
        const data = await res.json();
        setCampaigns(data);
      } catch (e) {
        setCampaigns([]);
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c: any) => c.status === activeTab);

  const getImageSource = (item: any) => {
    console.log('item.image', item.image);
    if (item.image && typeof item.image === 'string') {
      if (item.image.startsWith('/uploads/')) {
        return { uri: `${CONFIG.API_URL}${item.image}` };
      } else if (item.image.match(/\.(jpg|jpeg|png|gif)$/i)) {
        // Jika hanya nama file, tambahkan path
        return { uri: `${CONFIG.API_URL}/uploads/photos/${item.image}` };
      }
    }
    return require('../../assets/images/default-sampah.jpg');
  };

  const renderCampaign = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CampaignDetail', { campaign: item })}
    >
      <Image
        source={getImageSource(item)}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.organizer}>{item.organizer}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <FontAwesome5 name="calendar-alt" size={12} color="#999" />
          <Text style={styles.metaText}> {item.date}</Text>
          <Entypo
            name="location-pin"
            size={14}
            color="#999"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        <TouchableOpacity
          disabled={item.status === 'ended'}
          style={[
            styles.button,
            item.status === 'ended' ? styles.disabledButton : styles.joinButton,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              item.status === 'ended'
                ? { color: '#bbb' }
                : { color: '#22B07D' },
            ]}
          >
            GABUNG
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campaign</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ongoing' && styles.activeTabText,
            ]}
          >
            Berlangsung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ended' && styles.activeTab]}
          onPress={() => setActiveTab('ended')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ended' && styles.activeTabText,
            ]}
          >
            Berakhir
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Campaign */}
      {loading ? (
        <ActivityIndicator size="large" color="#22B07D" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={filteredCampaigns}
          renderItem={renderCampaign}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2ECC71",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f2f2f2",
  },
  activeTab: {
    borderBottomColor: "#22B07D",
  },
  tabText: {
    fontSize: 14,
    color: "#aaa",
  },
  activeTabText: {
    color: "#22B07D",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  organizer: {
    fontSize: 12,
    color: "#22B07D",
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderRadius: 20,
  },
  joinButton: {
    backgroundColor: "#E0F7EF",
  },
  disabledButton: {
    backgroundColor: "#eee",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default CampaignListScreen;
