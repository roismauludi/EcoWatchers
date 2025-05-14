import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SelectedItemsProvider } from "../(tabs)/context/SelectedItemsContext";

import LoginScreen from "../auth/login";
import RegisterScreen from "../auth/register";
import DashboardScreen from "./dashboard"; // Your Dashboard Screen
import TongScreen from "./TongSampah"; // Other screens
import RiwayatScreen from "../screens/RiwayatScreen";
import EducationScreen from "./edukasisampah";
import CatalogScreen from "../screens/CatalogScreen"; // Import CatalogScreen
import DropPointScreen from "../screens/DropPointScreen";
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab navigation
function BottomTabs() {
  const userId = "userId-example"; // Ganti dengan logika untuk mendapatkan userId dari konteks/akses lainnya

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" options={{ headerShown: false }} component={DashboardScreen} />
      <Tab.Screen name="Tong" options={{ headerShown: false }} component={TongScreen} />
      <Tab.Screen
        name="Riwayat"
        component={RiwayatScreen}
        initialParams={{ userId }}  // Kirim userId sebagai parameter
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


// Stack navigation
export default function MainTabs() {
  console.log("Rendering MainTabs Stack Navigator");

  return (
    <SelectedItemsProvider>
      <Stack.Navigator
        initialRouteName="Login"
        screenListeners={{
          state: (e) => {
            console.log("Stack State Changed:", e.data.state);
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
          listeners={{
            focus: () => console.log("Navigated to Login"),
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Register" }}
          listeners={{
            focus: () => console.log("Navigated to Register"),
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
          listeners={{
            focus: () => console.log("Navigated to MainTabs"),
          }}
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
          listeners={{
            focus: () => console.log("Navigated to Detail"),
          }}
        />
        <Stack.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{ title: "Katalog Sampah" }}
          listeners={{
            focus: () => console.log("Navigated to Catalog"),
          }}
        />
        <Stack.Screen
          name="Tong"
          component={TongScreen}
          options={{ title: "Tong Sampah" }}
          listeners={{
            focus: () => console.log("Navigated to Tong"),
          }}
        />
        <Stack.Screen
          name="Penyetoran"
          component={PenyetoranScreen}
          options={{ title: "Penyetoran" }}
          listeners={{
            focus: () => console.log("Navigated to Penyetoran"),
          }}
        />
        <Stack.Screen
          name="AddAddress"
          component={AddAddressScreen}
          options={{ title: "Tambah Alamat" }}
          listeners={{
            focus: () => console.log("Navigated to AddAddress"),
          }}
        />
        <Stack.Screen
          name="PickUp"
          component={PickupScreen}
          options={{ title: "Pick Up" }}
          listeners={{
            focus: () => console.log("Navigated to PickUp"),
          }}
        />
        <Stack.Screen
          name="Rincian"
          component={RincianScreen}
          options={{ title: "Rincian" }}
          listeners={{
            focus: () => console.log("Navigated to Rincian"),
          }}
        />
        <Stack.Screen
          name="Dijemput"
          component={DijemputScreen}
          options={{ title: "Dijemput" }}
          listeners={{
            focus: () => console.log("Navigated to Dijemput"),
          }}
        />
        <Stack.Screen
          name="Track"
          component={TrackScreen}
          options={{ title: "Track" }}
          listeners={{
            focus: () => console.log("Navigated to Track"),
          }}
        />
        <Stack.Screen
          name="Ditimbang"
          component={DitimbangScreen}
          options={{ title: "Ditimbang" }}
          listeners={{
            focus: () => console.log("Navigated to Ditimbang"),
          }}
        />
        <Stack.Screen
          name="Selesai"
          component={SelesaiScreen}
          options={{ title: "Selesai" }}
          listeners={{
            focus: () => console.log("Navigated to Selesai"),
          }}
        />
        <Stack.Screen
          name="Dibatalkan"
          component={DibatalkanScreen}
          options={{ title: "Dibatalkan" }}
          listeners={{
            focus: () => console.log("Navigated to Dibatalkan"),
          }}
        />
        <Stack.Screen
          name="TukarPoint"
          component={TukarPointScreen}
          options={{ title: "TukarPoint" }}
          listeners={{
            focus: () => console.log("Navigated to TukarPoint"),
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={require('../screens/EditProfileScreen').default}
          options={{ title: "Edit Profil" }}
        />
        <Stack.Screen
          name="Security"
          component={require('../screens/SecurityScreen').default}
          options={{ title: "Pengaturan Keamanan" }}
        />
      </Stack.Navigator>
    </SelectedItemsProvider>
  );
}
