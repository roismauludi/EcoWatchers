import * as React from "react";
import { useState, useEffect } from "react";
import Layout from "example/containers/Layout";
import PageTitle from "example/components/Typography/PageTitle";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
  Button,
  Label,
  Input,
} from "@windmill/react-ui";
import { Modal } from "@windmill/react-ui";
import { useNotifications } from "../../context/NotificationContext";

// Interface untuk data pengguna
interface UserData {
  id: string;
  nama: string;
  level: string;
  email: string;
  foto?: string;
  jenisBank?: string;
  namaRekening?: string;
  noRekening?: string;
  point?: number;
  totalpointkeluar?: number;
  totalpointmasuk?: number;
  status?: string;
}

function ListUser() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const resultsPerPage = 10;
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/pengguna/getuser");
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        console.error("Gagal mengambil data pengguna.");
      }
    } catch (error) {
      console.error("Error saat mengambil data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    // Validasi form
    if (
      !formData.nama ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Semua field harus diisi");
      return;
    }

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    try {
      const response = await fetch("/api/pengguna/addkurir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form dan tutup modal
        setFormData({
          nama: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setIsModalOpen(false);
        // Refresh data pengguna
        fetchUsers();
      } else {
        setError(result.error || "Gagal menambahkan kurir");
      }
    } catch (error) {
      console.error("Error saat menambahkan kurir:", error);
      setError("Terjadi kesalahan saat menambahkan kurir");
    }
  };

  const handleVerifikasi = async (userId: string) => {
    setVerifying(userId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/pengguna/verifikasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Akun berhasil diverifikasi!");
        // Refresh data pengguna
        fetchUsers();

        // Jika verifikasi dilakukan dari modal, tutup modal setelah berhasil
        if (selectedUser && selectedUser.id === userId) {
          // Tutup modal setelah verifikasi berhasil
          setTimeout(() => {
            closeModal();
          }, 1000); // Delay 1 detik agar user bisa melihat pesan sukses
        }

        // Hapus pesan sukses setelah 3 detik
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

        // Memanggil refreshNotifications
        refreshNotifications();
      } else {
        setError(result.error || "Gagal memverifikasi akun");
      }
    } catch (error) {
      console.error("Error saat memverifikasi akun:", error);
      setError("Terjadi kesalahan saat memverifikasi akun");
    } finally {
      setVerifying(null);
    }
  };

  // Hitung total hasil dan data yang akan ditampilkan
  const totalResults = users.length;
  const displayedUsers = users.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  // Fungsi untuk mendapatkan warna badge berdasarkan level
  const getBadgeType = (level: string) => {
    if (!level) return "neutral";

    switch (level.toLowerCase()) {
      case "admin":
        return "danger";
      case "kurir":
        return "warning";
      case "penyumbang":
        return "success";
      default:
        return "neutral";
    }
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusBadgeType = (status: string) => {
    if (!status) return "neutral";

    switch (status.toLowerCase()) {
      case "aktif":
        return "success";
      case "non-aktif":
        return "danger";
      default:
        return "neutral";
    }
  };

  // Fungsi untuk menampilkan status berdasarkan level
  const getStatusDisplay = (user: UserData) => {
    if (user.level?.toLowerCase() === "penyumbang") {
      return user.status || "Tidak ada status";
    }
    return "Aktif"; // Default untuk level selain penyumbang
  };

  const openModal = (user: UserData | null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      nama: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setSuccessMessage("");
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <PageTitle>Daftar Pengguna</PageTitle>
        <Button
          onClick={() => openModal(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          + Tambah Kurir
        </Button>
      </div>

      {/* Notifikasi */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <style jsx global>{`
        tr.clickable {
          cursor: pointer;
        }
        tr.clickable:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .dark tr.clickable:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Pengguna</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell>
                  <div className="text-center">Loading...</div>
                </TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell>
                  <div className="text-center">Tidak ada data pengguna</div>
                </TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            ) : (
              displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="clickable"
                  onClick={() => openModal(user)}
                >
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Avatar
                        className="hidden mr-3 md:block"
                        src={"/assets/img/default.jpg"}
                        alt="User avatar"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {user.nama}
                        </p>
                        {/* <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p> */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge type={getBadgeType(user.level)}>{user.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge type={getStatusBadgeType(user.status || "")}>
                      {getStatusDisplay(user)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.level?.toLowerCase() === "penyumbang" &&
                      user.status?.toLowerCase() === "non-aktif" && (
                        <Button
                          layout="outline"
                          size="small"
                          disabled={verifying === user.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifikasi(user.id);
                          }}
                        >
                          {verifying === user.id
                            ? "Memverifikasi..."
                            : "Verifikasi"}
                        </Button>
                      )}
                  </TableCell>
                </tr>
              ))
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={setPage}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>

      {/* Modal Detail User */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl overflow-x-auto">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-300">
                Detail Pengguna
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Informasi Pribadi
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nama
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedUser.nama}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Level
                      </p>
                      <p className="font-medium">
                        <Badge type={getBadgeType(selectedUser.level)}>
                          {selectedUser.level}
                        </Badge>
                      </p>
                    </div>
                    {selectedUser.level?.toLowerCase() === "penyumbang" && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="font-medium">
                          <Badge
                            type={getStatusBadgeType(selectedUser.status || "")}
                          >
                            {selectedUser.status || "Tidak ada status"}
                          </Badge>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Informasi Bank
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bank
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedUser.jenisBank}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nama Rekening
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedUser.namaRekening}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nomor Rekening
                      </p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedUser.noRekening}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Informasi Point
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Point
                      </p>
                      <p className="font-medium text-lg text-gray-800 dark:text-gray-100">
                        {selectedUser.point?.toLocaleString("id-ID") || "0"}{" "}
                        Point
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Point Masuk
                      </p>
                      <p className="font-medium text-lg text-green-600 text-gray-800 dark:text-gray-100">
                        +
                        {selectedUser.totalpointmasuk?.toLocaleString(
                          "id-ID"
                        ) || "0"}{" "}
                        Point
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Point Keluar
                      </p>
                      <p className="font-medium text-lg text-red-600 text-gray-800 dark:text-gray-100">
                        -
                        {selectedUser.totalpointkeluar?.toLocaleString(
                          "id-ID"
                        ) || "0"}{" "}
                        Point
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {selectedUser.level?.toLowerCase() === "penyumbang" &&
                  selectedUser.status?.toLowerCase() === "non-aktif" && (
                    <Button
                      className="mr-2 bg-green-600 hover:bg-green-700 text-white"
                      disabled={verifying === selectedUser.id}
                      onClick={() => handleVerifikasi(selectedUser.id)}
                    >
                      {verifying === selectedUser.id
                        ? "Memverifikasi..."
                        : "Verifikasi Akun"}
                    </Button>
                  )}
                <Button layout="outline" onClick={closeModal}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ListUser;
