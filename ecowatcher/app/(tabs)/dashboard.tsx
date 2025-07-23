import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EcoPoinCard from "../../components/EcoPoinCard";
import ActionSection from "../../components/ActionSection";
import { Ionicons, FontAwesome5, Entypo } from "@expo/vector-icons";
import CONFIG from '../config';

const defaultPhoto = require("../../assets/images/default.jpg");

const imageMap: { [key: string]: any } = {
  "default.jpg": defaultPhoto,
};

const { width } = Dimensions.get("window");

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

interface UserData {
  nama: string;
  foto: string;
}

function Dashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [userData, setUserData] = useState<UserData>({
    nama: "Pengguna",
    foto: defaultPhoto,
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const data = Array.isArray(snapshot.docs)
        ? snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(Boolean)
        : [];
      setCampaigns(data);
      setLoadingCampaign(false);
    });
    return () => unsub();
  }, []);

  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter((c: any) => c && c.status === activeTab) : [];

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert("Error", "Sesi pengguna tidak ditemukan");
        navigation.replace("Login");
        return;
      }

      const usersRef = collection(db, "users");
      console.log('DEBUG DB Dashboard:', db);
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data() as UserData;

        const userPhoto = imageMap[data.foto] || defaultPhoto;

        setUserData({
          nama: data.nama || "Pengguna",
          foto: userPhoto,
        });
      } else {
        Alert.alert("Error", "Data pengguna tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Gagal mengambil data pengguna");
    }
  };

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
      onPress={() => navigation.navigate("CampaignDetail", { campaign: item })}
      disabled={item.status === "ended"}
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
          disabled={item.status === "ended"}
          style={[
            styles.button,
            item.status === "ended" ? styles.disabledButton : styles.joinButton,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              item.status === "ended"
                ? { color: "#bbb" }
                : { color: "#22B07D" },
            ]}
          >
            GABUNG
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={
              typeof userData.foto === "number"
                ? userData.foto
                : { uri: userData.foto }
            }
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Selamat Datang</Text>
            <Text style={styles.username}>{userData.nama}</Text>
          </View>
        </View>
      </View>

      <EcoPoinCard />
      <View style={styles.actions}>
        <ActionSection />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Campaign
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => setActiveTab("ongoing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ongoing" && styles.activeTabText,
              ]}
            >
              Berlangsung
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ended" && styles.activeTab]}
            onPress={() => setActiveTab("ended")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ended" && styles.activeTabText,
              ]}
            >
              Berakhir
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 10 }}>
          {loadingCampaign ? (
            <Text style={{ textAlign: 'center', color: '#888', marginVertical: 16 }}>Memuat campaign...</Text>
          ) : Array.isArray(filteredCampaigns) && filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((item) => (
              <View key={item.id}>{renderCampaign({ item })}</View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginVertical: 16 }}>Tidak ada campaign</Text>
          )}
        </View>

        <View style={styles.footerSpacing}>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate("AllCampaign")}
          >
            <Text style={styles.seeAllText}>Lihat Semua</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2ECC71",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 12,
  },
  userInfo: {
    flexShrink: 1,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  username: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  actions: {
    marginTop: 1,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#f2f2f2",
  },
  activeTab: {
    borderBottomColor: "#22B07D",
    backgroundColor: "#e6f4ea",
  },
  tabText: {
    fontSize: 14,
    color: "#888",
  },
  activeTabText: {
    color: "#22B07D",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
    padding: 10,
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
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  seeAllText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
  },
  footerSpacing: {
    marginTop: 10,
    paddingBottom: 100,
  },
});

export default Dashboard;
