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
} from "@roketid/windmill-react-ui";
import { Modal } from "@windmill/react-ui";

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
  const resultsPerPage = 10;

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
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell>
                  <div className="text-center">Tidak ada data pengguna</div>
                </TableCell>
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
                    <Badge type="success">Aktif</Badge>
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
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-6">
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-300">
            {selectedUser ? "Detail Pengguna" : "Tambah Kurir Baru"}
          </h4>
          {selectedUser ? (
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
                      {selectedUser.point?.toLocaleString("id-ID") || "0"} Point
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Point Masuk
                    </p>
                    <p className="font-medium text-lg text-green-600 text-gray-800 dark:text-gray-100">
                      +
                      {selectedUser.totalpointmasuk?.toLocaleString("id-ID") ||
                        "0"}{" "}
                      Point
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Point Keluar
                    </p>
                    <p className="font-medium text-lg text-red-600 text-gray-800 dark:text-gray-100">
                      -
                      {selectedUser.totalpointkeluar?.toLocaleString("id-ID") ||
                        "0"}{" "}
                      Point
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-400">Nama</span>
                  <input
                    className="mt-1 block w-full text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                    placeholder="Masukkan nama kurir"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                  />
                </Label>
              </div>
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-400">
                    Email
                  </span>
                  <input
                    className="mt-1 block w-full text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                    placeholder="Masukkan email kurir"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Label>
              </div>
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-400">
                    Password
                  </span>
                  <input
                    className="mt-1 block w-full text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                    placeholder="Masukkan password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Label>
              </div>
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-400">
                    Konfirmasi Password
                  </span>
                  <input
                    className="mt-1 block w-full text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                    placeholder="Konfirmasi password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </Label>
              </div>
              <div className="flex justify-end mt-6">
                <Button layout="outline" onClick={closeModal} className="mr-2">
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}
          {selectedUser && (
            <div className="flex justify-end mt-6">
              <Button layout="outline" onClick={closeModal}>
                Tutup
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}

export default ListUser;
