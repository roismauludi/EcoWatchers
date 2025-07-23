import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5, Entypo } from "@expo/vector-icons";
import CONFIG from '../config';
import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';

const CampaignDetailScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { campaign } = route.params;

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'CampaignDetail' });
  }, []);

  // Ganti fungsi handleOpenLink agar tidak pakai canOpenURL
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Gagal membuka link", "URL tidak didukung.");
    });
  };

  const WHATSAPP_LINK = 'https://whatsapp.com/channel/0029VbBQBGS0Vyc9DV9IzL0k';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Yuk ikuti campaign: ${campaign.title} di ${campaign.location} pada ${campaign.date}. Info lebih lanjut: ${WHATSAPP_LINK}`,
      });
    } catch (error: any) {
      Alert.alert("Gagal membagikan", error.message);
    }
  };

  const openInGoogleMaps = () => {
    if (campaign.location) {
      // encode nama lokasi agar URL valid
      const locationQuery = encodeURIComponent(campaign.location);
      const url = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
      Linking.openURL(url);
    } else if (campaign.latitude && campaign.longitude) {
      // fallback ke koordinat jika nama lokasi tidak ada
      const url = `https://www.google.com/maps/search/?api=1&query=${campaign.latitude},${campaign.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Lokasi tidak tersedia');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campaign</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Hero Image */}
        <Image source={{ uri: `${CONFIG.API_URL}${campaign.image}` }} style={styles.headerImage} />

        {/* Card Ringkasan */}
        <View style={styles.card}>
          <Text style={styles.title}>{campaign.title}</Text>
          <View style={styles.metaRow}>
            <FontAwesome5 name="calendar" size={12} color="#888" />
            <Text style={styles.metaText}> {campaign.date}</Text>
            <Entypo
              name="location-pin"
              size={14}
              color="#888"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.metaText}>{campaign.location}</Text>
          </View>
        </View>

        {/* Informasi Campaign */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Campaign</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <FontAwesome5 name="calendar-day" size={14} color="#e74c3c" />
              <Text style={styles.infoText}> {campaign.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#e67e22" />
              <Text style={styles.infoText}> {campaign.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Entypo name="location-pin" size={14} color="#3498db" />
              <Text style={styles.infoText}> {campaign.location}</Text>
            </View>
            <TouchableOpacity
              onPress={campaign.status === 'ended' ? undefined : openInGoogleMaps}
              style={{ marginTop: 12, opacity: campaign.status === 'ended' ? 0.5 : 1 }}
              disabled={campaign.status === 'ended'}
            >
              <Text style={[styles.infoText, { color: campaign.status === 'ended' ? '#aaa' : '#4285F4' }]}>Buka di Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={campaign.status === 'ended' ? undefined : () => handleOpenLink(WHATSAPP_LINK)}
              style={{ marginTop: 8, opacity: campaign.status === 'ended' ? 0.5 : 1 }}
              disabled={campaign.status === 'ended'}
            >
              <Text style={[styles.infoText, { color: campaign.status === 'ended' ? '#bbb' : '#2ecc71' }]}>Bergabung dengan kami di: {WHATSAPP_LINK}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deskripsi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Campaign</Text>
          <View style={styles.infoBox}>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Aksi */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.shareButton, campaign.status === 'ended' && { backgroundColor: '#ccc' }]}
          onPress={handleShare}
          disabled={campaign.status === 'ended'}
        >
          <Text style={[styles.shareText, campaign.status === 'ended' && { color: '#888' }]}>Bagikan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.joinButton, campaign.status === 'ended' && { backgroundColor: '#eee' }]}
          onPress={() => handleOpenLink(WHATSAPP_LINK)}
          disabled={campaign.status === 'ended'}
        >
          <Text style={[styles.joinText, campaign.status === 'ended' && { color: '#bbb' }]}>Gabung</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#2ECC71",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 180,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#777",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    color: "#444",
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#333",
  },
  description: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
  bottomButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 30,
    alignItems: "center",
  },
  joinButton: {
    flex: 1,
    backgroundColor: "#27ae60",
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 30,
    alignItems: "center",
  },
  shareText: {
    color: "#888",
    fontWeight: "bold",
  },
  joinText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CampaignDetailScreen;
