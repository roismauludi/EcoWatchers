import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SelectedItemsProvider } from "../../context/SelectedItemsContext";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, TabParamList } from "../../utils/types";
import { View, StatusBar } from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

// Import screens
import LoginScreen from "../auth/login";
import RegisterScreen from "../auth/register";
import DashboardScreen from "./dashboard";
import TongScreen from "./TongSampah";
import RiwayatScreen from "../screens/RiwayatScreen";
import ChannelsScreen from "../screens/ChannelsScreen";
import CatalogScreen from "../screens/CatalogScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddAddressScreen from "../screens/AddAddressScreen";
import PenyetoranScreen from "../screens/PenyetoranScreen";
import PickupScreen from "../screens/PickUpScreen";
import RincianScreen from "../screens/RincianScreen";
import DijemputScreen from "../screens/DijemputScreen";
import TrackScreen from "../screens/TrackScreen";
import DitimbangScreen from "../screens/DitimbangScreen";
import SelesaiScreen from "../screens/SelesaiScreen";
import DibatalkanScreen from "../screens/DibatalkanScreen";
import TukarPointScreen from "../screens/TukarPointScreen";
import KurirScreen from "../screens/KurirScreen";
import DetailKurirScreen from "../screens/DetailKurirScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SecurityScreen from "../screens/SecurityScreen";
import CampaignDetailScreen from "../screens/CampaignDetailScreen";
import AllCampaignsScreen from "../screens/AllCampaignScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import DaftarAlamatScreen from "../screens/DaftarAlamatScreen";


const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab navigation
function BottomTabs() {
  const userId = "userId-example";
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({
        route,
      }: {
        route: RouteProp<TabParamList, keyof TabParamList>;
      }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          if (route.name === "Home") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === "Tong") {
            return <Ionicons name={focused ? "trash" : "trash-outline"} size={size} color={color} />;
          } else if (route.name === "Riwayat") {
            return <FontAwesome5 name="history" size={size} color={color} solid={focused} />;
          } else if (route.name === "Profile") {
            return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: {
          position: "absolute",
          height: 60,
          paddingTop: 4,
          paddingBottom: insets.bottom,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 4,
        },
        headerShown: false,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Tong" component={TongScreen} options={{ tabBarLabel: 'Tong' }} />
      <Tab.Screen
        name="Riwayat"
        component={RiwayatScreen}
        initialParams={{ userId }}
        options={{ tabBarLabel: 'Riwayat' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Stack navigation
export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <SelectedItemsProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
          screenListeners={{
            state: (e: { data: { state: any } }) => {
              console.log("Stack State Changed:", e.data.state);
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="KurirDashboard"
            component={KurirScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailKurirScreen}
            options={{ title: "Detail" }}
          />
          <Stack.Screen
            name="Catalog"
            component={CatalogScreen}
            options={{ title: "Katalog Sampah" }}
          />
          <Stack.Screen
            name="Channels"
            component={ChannelsScreen}
            options={{ title: "Channels" }}
          />
          <Stack.Screen
            name="Tong"
            component={TongScreen}
            options={{ title: "Tong Sampah" }}
          />
          <Stack.Screen
            name="Penyetoran"
            component={PenyetoranScreen}
            options={{ title: "Penyetoran" }}
          />
          <Stack.Screen
            name="AddAddress"
            component={AddAddressScreen}
            options={{ title: "Tambah Alamat" }}
          />
          <Stack.Screen
            name="PickUp"
            component={PickupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Rincian"
            component={RincianScreen}
            options={{ title: "Rincian", headerShown: true }}
          />
          <Stack.Screen
            name="Dijemput"
            component={DijemputScreen}
            options={{ title: "Dijemput" }}
          />
          <Stack.Screen
            name="Track"
            component={TrackScreen}
            options={{ title: "Track", headerShown: true }}
          />
          <Stack.Screen
            name="Ditimbang"
            component={DitimbangScreen}
            options={{ title: "Ditimbang" }}
          />
          <Stack.Screen
            name="Selesai"
            component={SelesaiScreen}
            options={{ title: "Selesai" }}
          />
          <Stack.Screen
            name="Dibatalkan"
            component={DibatalkanScreen}
            options={{ title: "Dibatalkan" }}
          />
          <Stack.Screen
            name="TukarPoint"
            component={TukarPointScreen}
            options={{ title: "Tukar Point" }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: "Edit Profil" }}
          />
          <Stack.Screen
            name="Security"
            component={SecurityScreen}
            options={{ title: "Pengaturan Keamanan" }}
          />
          <Stack.Screen
            name="AllCampaign"
            component={AllCampaignsScreen}
            options={{ title: "Semua Kampanye" }}
          />
          <Stack.Screen
            name="CampaignDetail"
            component={CampaignDetailScreen}
            options={{ title: "Detail Campaign" }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ title: "Dashboard Admin" }}
          />
           <Stack.Screen
            name="DaftarAlamat"
            component={DaftarAlamatScreen}
            options={{ title: "Daftar Alamat" }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </SelectedItemsProvider>
  );
}
