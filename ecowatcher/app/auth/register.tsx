import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types";
import CONFIG from "../config";
import { Ionicons, AntDesign } from '@expo/vector-icons';
import analytics from '@react-native-firebase/analytics';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nama, setNama] = useState("");
  const [jenisBank, setJenisBank] = useState("");
  const [namaRekening, setNamaRekening] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasUpperCase: false,
  });
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    validatePasswordCriteria(password);
  }, [password]);

  const validatePasswordCriteria = (password: string) => {
    setValidations({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
    });
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    <AntDesign 
      name={isValid ? "checkcircle" : "closecircle"} 
      size={16} 
      color={isValid ? "#4CAF50" : "#FF5252"}
      style={{ marginRight: 8 }}
    />
  );

  // Validasi email sederhana
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };  

  const handleRegister = async () => {
    // Validasi input
    if (!email || !password || !confirmPassword || !nama || !jenisBank || !namaRekening || !noRekening) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Email tidak valid");
      return;
    }

    if (!validations.hasMinLength || !validations.hasUpperCase) {
      Alert.alert("Error", "Password harus minimal 8 karakter dan mengandung huruf kapital");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password tidak cocok");
      return;
    }

    setIsLoading(true); // Mulai loading

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          nama,
          jenisBank,
          namaRekening,
          noRekening,
        }),
      });

      setIsLoading(false); // Selesai loading

      if (response.ok) {
        Alert.alert("Registrasi berhasil!", "Silakan login untuk melanjutkan.", [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Login");
            },
          },
        ]);
        analytics().logEvent('register', { method: 'email' });
      } else {
        const errorMessage = await response.text();
        Alert.alert("Gagal mendaftarkan pengguna", errorMessage || "Terjadi kesalahan.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Gagal mendaftarkan pengguna:", error);
      Alert.alert("Gagal mendaftarkan pengguna", "Terjadi kesalahan saat menghubungi server.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daftar Akun</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Masukkan email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
        style={[styles.input, { color: '#222' }]}
      />
      <TextInput
        value={nama}
        onChangeText={setNama}
        placeholder="Masukkan nama"
        style={[styles.input, { color: '#222' }]}
        placeholderTextColor="#888"
      />
      <TextInput
        value={jenisBank}
        onChangeText={setJenisBank}
        placeholder="Masukkan jenis bank"
        style={[styles.input, { color: '#222' }]}
        placeholderTextColor="#888"
      />
      <TextInput
        value={namaRekening}
        onChangeText={setNamaRekening}
        placeholder="Masukkan nama rekening"
        style={[styles.input, { color: '#222' }]}
        placeholderTextColor="#888"
      />
      <TextInput
        value={noRekening}
        onChangeText={setNoRekening}
        placeholder="Masukkan nomor rekening"
        style={[styles.input, { color: '#222' }]}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <View style={{ position: 'relative', marginBottom: 12 }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Masukkan password (min. 8 karakter, 1 huruf kapital)"
          secureTextEntry={!showPassword}
          style={[styles.input, { color: '#222' }]}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={{ position: 'absolute', right: 16, top: 14 }}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Validation Indicators */}
      <View style={styles.validationContainer}>
        <View style={styles.validationItem}>
          <ValidationIcon isValid={validations.hasMinLength} />
          <Text style={[styles.validationText, validations.hasMinLength && styles.validText]}>
            Minimal 8 karakter
          </Text>
        </View>
        <View style={styles.validationItem}>
          <ValidationIcon isValid={validations.hasUpperCase} />
          <Text style={[styles.validationText, validations.hasUpperCase && styles.validText]}>
            Mengandung huruf kapital
          </Text>
        </View>
      </View>

      <View style={{ position: 'relative', marginBottom: 12 }}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Konfirmasi password"
          secureTextEntry={!showConfirm}
          style={[styles.input, { color: '#222' }]}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={{ position: 'absolute', right: 16, top: 14 }}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2ECC71" />
      ) : (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>Daftar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2ECC71",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  validationContainer: {
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  validationText: {
    fontSize: 14,
    color: '#666',
  },
  validText: {
    color: '#4CAF50',
  },
  registerButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
