import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal as RNModal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import analytics from '@react-native-firebase/analytics';

const { width } = Dimensions.get("window");

const TukarPointScreen = () => {
  const [poinAktif, setPoinAktif] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const vouchers = [
    { id: "1", nominal: 10000, pointRequired: 10100 },
    { id: "2", nominal: 20000, pointRequired: 20100 },
    { id: "3", nominal: 50000, pointRequired: 50100 },
    { id: "4", nominal: 100000, pointRequired: 101000 },
  ];

  useEffect(() => {
    analytics().logEvent('screen_view', { screen_name: 'TukarPoint' });
  }, []);

  useEffect(() => {
    const fetchPoinData = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
      if (email) {
        console.log('DEBUG DB TukarPointScreen:', db);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          setPoinAktif(data.point || 0);
          setUserId(userDoc.id);
          setUserData(data);
        }
      }
    };
    fetchPoinData();
  }, []);

  const handleLanjutkan = () => {
    setShowConfirm(true);
  };

  const handleExchange = async () => {
    if (!selectedVoucher) return;
    const voucher = vouchers.find((v) => v.id === selectedVoucher);
    if (!voucher) return;
    if (poinAktif >= voucher.pointRequired) {
      setIsLoading(true);
      try {
        if (userEmail && userId) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, "users", userDoc.id);
            const userData = userDoc.data();
            const updatedPoint = poinAktif - voucher.pointRequired;
            const updatedTotalPointKeluar =
              (userData.totalpointkeluar || 0) + voucher.pointRequired;
            await updateDoc(userDocRef, {
              point: updatedPoint,
              totalpointkeluar: updatedTotalPointKeluar,
            });
            const transactionsRef = collection(db, "transactions");
            await addDoc(transactionsRef, {
              email: userEmail,
              userId: userId,
              nama: userData.nama,
              jenisBank: userData.jenisBank,
              noRekening: userData.noRekening,
              namaRekening: userData.namaRekening,
              nominal: voucher.nominal,
              pointUsed: voucher.pointRequired,
              timestamp: new Date().toISOString(),
              status: "Diajukan",
            });
            setPoinAktif(updatedPoint);
            setSelectedVoucher(null);
            // Alert.alert(
            //   "Pengajuan Penukaran Berhasil",
            //   `Anda telah menukar ${
            //     voucher.pointRequired
            //   } poin untuk voucher Rp${voucher.nominal.toLocaleString()}.`
            // );
          }
        }
      } catch (error) {
        Alert.alert("Kesalahan", "Terjadi kesalahan saat menukar poin.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert(
        "Poin Tidak Cukup",
        "Anda tidak memiliki cukup poin untuk voucher ini."
      );
    }
    setShowConfirm(false);
    setShowSuccess(true);
  };

  const renderVoucher = ({ item }: { item: (typeof vouchers)[0] }) => {
    const isSelected = selectedVoucher === item.id;
    const isDisabled = poinAktif < item.pointRequired;
    return (
      <TouchableOpacity
        style={[
          styles.voucherCard,
          isSelected && styles.voucherCardSelected,
          isDisabled && styles.voucherCardDisabled,
        ]}
        onPress={() => !isDisabled && setSelectedVoucher(item.id)}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <Text
          style={[styles.voucherNominal, isSelected && { color: "#27AE60" }]}
        >
          Voucher{"\n"}Rp {item.nominal.toLocaleString()}
        </Text>
        <Text style={[styles.voucherPoint, isSelected && { color: "#27AE60" }]}>
          {item.pointRequired} Poin
        </Text>
      </TouchableOpacity>
    );
  };

  const selectedVoucherObj = vouchers.find((v) => v.id === selectedVoucher);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header dan info poin dalam card hijau dengan icon back */}
      <View style={styles.greenCardWrapper}>
        <LinearGradient
          colors={["#27AE60", "#27AE60"]}
          style={styles.greenCard}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tukar Poin</Text>
          </View>
          <Text style={styles.labelPoin}>Total poin saat ini</Text>
          <View style={styles.poinRow}>
            <Text style={styles.poinValue}>
              {poinAktif.toLocaleString()} Poin
            </Text>
          </View>
        </LinearGradient>
      </View>
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        <Text style={styles.pilihNominal}>Pilih Nominal</Text>
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id}
          renderItem={renderVoucher}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {/* Tombol lanjutkan di bawah */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.lanjutButton,
            (!selectedVoucher ||
              poinAktif < (selectedVoucherObj?.pointRequired || 0)) &&
              styles.lanjutButtonDisabled,
          ]}
          onPress={handleLanjutkan}
          disabled={
            !selectedVoucher ||
            poinAktif < (selectedVoucherObj?.pointRequired || 0) ||
            isLoading
          }
        >
          <Text
            style={[
              styles.lanjutButtonText,
              (!selectedVoucher ||
                poinAktif < (selectedVoucherObj?.pointRequired || 0)) && {
                color: "#BDBDBD",
              },
            ]}
          >
            Lanjutkan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Konfirmasi */}
      <RNModal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Informasi Pelanggan</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Jenis Bank</Text>
              <Text style={styles.confirmValue}>
                {userData?.jenisBank || "-"}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>No Rekening</Text>
              <Text style={styles.confirmValue}>
                {userData?.noRekening || "-"}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Nominal Penarikan</Text>
              <Text style={styles.confirmValue}>
                Rp. {selectedVoucherObj?.nominal?.toLocaleString() || "-"}
              </Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.confirmTitle}>Detail Pembayaran</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Harga Voucher</Text>
              <Text style={styles.confirmValue}>
                {selectedVoucherObj?.pointRequired?.toLocaleString() || "-"}{" "}
                Poin
              </Text>
            </View>
            <View style={styles.confirmRowTotal}>
              <Text style={styles.confirmTotalLabel}>Total Pembayaran</Text>
              <Text style={styles.confirmTotalValue}>
                {selectedVoucherObj?.pointRequired?.toLocaleString() || "-"}{" "}
                Poin
              </Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleExchange}
              disabled={isLoading}
            >
              <Text style={styles.confirmButtonText}>Konfirmasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* Modal Sukses */}
      <RNModal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Image
              source={require("../../assets/images/success-piggy.png")}
              style={styles.successImage}
              resizeMode="contain"
            />
            <Text style={styles.successTitle}>Selamat</Text>
            <Text style={styles.successSubtitle}>
              Penukaran poin anda sedang diproses
            </Text>
            <Text style={styles.successDesc}>
              Silahkan periksa saldo secara berkala
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.successButtonText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
  greenCardWrapper: {
    backgroundColor: "#27AE60",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  greenCard: {
    backgroundColor: "#2ECC71",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  labelPoin: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  poinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  poinValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  pilihNominal: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    color: "#222",
  },
  voucherCard: {
    width: CARD_WIDTH,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: "#F7F7F7",
  },
  voucherCardSelected: {
    borderColor: "#27AE60",
    backgroundColor: "#E9F9F1",
    shadowColor: "#27AE60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  voucherCardDisabled: {
    opacity: 0.5,
  },
  voucherNominal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  voucherPoint: {
    fontSize: 13,
    color: "#BDBDBD",
  },
  bottomBar: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#F0F0F0",
  },
  lanjutButton: {
    backgroundColor: "#27AE60",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  lanjutButtonDisabled: {
    backgroundColor: "#F0F0F0",
  },
  lanjutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  confirmLabel: {
    color: "#888",
    fontSize: 15,
  },
  confirmValue: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  confirmRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 18,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    paddingTop: 10,
  },
  confirmTotalLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  confirmTotalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  confirmButton: {
    backgroundColor: "#27AE60",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
  },
  successModal: {
    backgroundColor: "#F8F9FB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    padding: 32,
    paddingBottom: 40,
  },
  successImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 14,
    color: "#888",
    marginBottom: 32,
    textAlign: "center",
  },
  successButton: {
    backgroundColor: "#27AE60",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TukarPointScreen;
