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
import { auth } from "../../firebaseConfig"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore
import { db } from "../../firebaseConfig"; // Firestore instance Anda
import { RootStackParamList } from '../../utils/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import analytics from '@react-native-firebase/analytics';

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
        const userStatus = userData.status; // Ambil status user
        console.log("User Level:", userLevel); // Log level pengguna
        console.log("User Status:", userStatus); // Log status pengguna
        
        // Cek status akun untuk penyumbang
        if (userLevel === "penyumbang" && userStatus === "Non-Aktif") {
          console.log("Akun penyumbang belum diverifikasi");
          Alert.alert(
            "Akun Belum Diverifikasi", 
            "Harap menunggu verifikasi akun dari admin. Akun Anda akan diaktifkan setelah diverifikasi.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Sign out user karena tidak bisa login
                  auth.signOut();
                }
              }
            ]
          );
          return;
        }
        
        // Simpan level pengguna ke AsyncStorage
        await AsyncStorage.setItem("userLevel", userLevel);

        // Tracking analytics login
        analytics().logEvent('login', { method: 'email' });

        // Navigasi berdasarkan level pengguna
        if (userLevel === "admin") {
          console.log("Navigasi ke: AdminDashboard");
          navigation.replace("AdminDashboard"); // Arahkan ke dashboard admin
        } else if (userLevel === "kurir") {
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
      // Penanganan error login lebih ramah pengguna
      let message = "Terjadi kesalahan, silakan coba lagi.";
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as any).code;
        if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
          message = "Email atau password salah.";
        } else if (code === "auth/too-many-requests") {
          message = "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.";
        }
      }
      Alert.alert("Login Gagal", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Silakan masukkan email terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email Reset Password Terkirim",
        "Link untuk reset password telah dikirim ke email Anda. Silakan cek email dan ikuti instruksi yang diberikan.",
        [
          {
            text: "OK",
            onPress: () => {
              // Optional: Clear email field after sending reset email
              setEmail("");
            }
          }
        ]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Reset Password Error:", error.message);
        if (error.message.includes("user-not-found")) {
          Alert.alert("Error", "Email tidak terdaftar dalam sistem");
        } else if (error.message.includes("invalid-email")) {
          Alert.alert("Error", "Format email tidak valid");
        } else {
          Alert.alert("Error", "Gagal mengirim email reset password: " + error.message);
        }
      } else {
        console.error("Reset Password Error:", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengirim email reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>EcoWatcher</Text>

        <TextInput
          placeholderTextColor="#888"
          style={[styles.input, { color: '#222' }]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={{ position: 'relative', marginBottom: 15 }}>
          <TextInput
            placeholderTextColor="#888"
            style={[styles.input, { color: '#222', marginBottom: 0 }]}
    
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
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
        </TouchableOpacity>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#2ECC71",
    fontSize: 14,
    textDecorationLine: "underline",
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
