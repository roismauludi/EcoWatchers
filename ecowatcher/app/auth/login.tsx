import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../firebaseConfig"; // Pastikan Firebase Authentication diatur dengan benar
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore
import { db } from "../../firebaseConfig"; // Firestore instance Anda
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

// Tipe navigasi
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Silakan isi email dan password");
      return;
    }

    setIsLoading(true);
    try {
      // Login dengan Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Login sukses. User ID:", user.uid); // Log user ID setelah login sukses
      
      // Ambil userId dan simpan di AsyncStorage
      const userId = user.uid;
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userId", userId); // Simpan userId ke AsyncStorage

      // Ambil data level pengguna dari Firestore
      const userDocRef = doc(db, "users", userId); // Asumsikan data pengguna ada di koleksi "users"
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Data pengguna ditemukan:", userData); // Log seluruh data pengguna

        const userLevel = userData.level;
        console.log("User Level:", userLevel); // Log level pengguna
        
        // Simpan level pengguna ke AsyncStorage
        await AsyncStorage.setItem("userLevel", userLevel);

        // Navigasi berdasarkan level pengguna
        if (userLevel === "kurir") {
          console.log("Navigasi ke: KurirDashboard");
          navigation.replace("KurirDashboard"); // Arahkan ke dashboard kurir
        } else {
          console.log("Navigasi ke: MainTabs");
          navigation.replace("MainTabs"); // Arahkan ke tab pengguna biasa
        }
      } else {
        console.error("Data pengguna tidak ditemukan di Firestore.");
        Alert.alert("Error", "Data pengguna tidak ditemukan di Firestore.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login Error:", error.message); // Log error message
        Alert.alert("Error", "Gagal login: " + error.message);
      } else {
        console.error("Login Error:", error);
        Alert.alert("Error", "Terjadi kesalahan saat login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoWatcher</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={{ position: 'relative', marginBottom: 15 }}>
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={{ position: 'absolute', right: 16, top: 14 }}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Masuk</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
        disabled={isLoading}
      >
        <Text style={styles.registerButtonText}>
          Belum punya akun? Daftar disini
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 20,
  },
  registerButtonText: {
    color: "#2ECC71",
    textAlign: "center",
    fontSize: 16,
  },
});

export default LoginScreen;
