import * as React from "react";
import { useState, useEffect } from "react";
import { FaTrashAlt, FaPlug } from "react-icons/fa";

import CTA from "example/components/CTA";
import InfoCard from "example/components/Cards/InfoCard";
import PageTitle from "example/components/Typography/PageTitle";
import RoundIcon from "example/components/RoundIcon";
import Layout from "example/containers/Layout";
import response, { ITableData } from "utils/demo/tableData";
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon, TrashIcon } from "icons";

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
} from "@windmill/react-ui";

// Interface untuk data penyetoran
interface Penyetoran {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    nama: string;
    level: string;
  };
  address: {
    label_Alamat: string;
    Kecamatan: string;
    "kota-kabupaten": string;
    Kode_pos: string;
  };
  alasanPembatalan?: string;
  tanggalPembatalan?: string;
  cancelReason?: string; // Alasan pembatalan dari kurir
  totalSampah?: number; // Menambahkan field total sampah
}

// Interface untuk data pengguna
interface User {
  id: string;
  nama: string;
  level: string;
}

// Fungsi untuk menentukan jenis badge
const getBadgeType = (status: string) => {
  switch (status) {
    case "Selesai":
      return "success";
    case "Dibatalkan":
      return "danger";
    case "Ditimbang":
      return "warning";
    case "Dijemput":
      return "primary";
    case "Diproses":
      return "neutral";
    default:
      return "neutral";
  }
};

// Tambahkan tipe props pada komponen
interface TotalSampahCardProps {
  umum: number;
  elektronik: number;
  unit: number;
}

function TotalSampahCard({ umum, elektronik, unit }: TotalSampahCardProps) {
  return (
    <div className="flex flex-col items-start w-full min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-600 text-lg">🗑️</span>
        <div>
          <span className="text-base font-semibold">{umum} kg</span>
          <div className="text-gray-600 text-xs">Sampah Umum</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-lg">🔌</span>
        <div>
          <span className="text-base font-semibold">{elektronik}</span>
          <div className="text-gray-600 text-xs">
            Elektronik <span className="block text-[10px]">({unit} unit)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fungsi mapping tipe ke nama folder
function mapTypeToFolder(type: string) {
  if (!type) return "";
  const parts = type.toLowerCase().split("-");
  return parts[parts.length - 1];
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("semua");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Penyetoran[]>([]);
  const resultsPerPage = 10;
  const [selectedPenyetoran, setSelectedPenyetoran] =
    useState<Penyetoran | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPenyetoranDetail, setSelectedPenyetoranDetail] =
    useState<Penyetoran | null>(null);

  // Fetch data dari API saat komponen pertama kali di-mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/penyetoran/penyetoran");
        const result = await response.json();

        if (result.success) {
          console.log("Data penyetoran:", result.data);
          const penyetoranSelesai = result.data.filter(
            (item: any) => item.status === "Selesai"
          );
          console.log("Penyetoran selesai:", penyetoranSelesai);
          setData(result.data);
        } else {
          console.error("Gagal mengambil data.");
        }
      } catch (error) {
        console.error("Error saat mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/pengguna/getuser");
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        console.error("Gagal mengambil data.");
      }
    } catch (error) {
      console.error("Error saat mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    fetchUsers();
  }

  const handleDelete = async (pickupId: string) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus data penyetoran ini?")
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/penyetoran/delete?pickupId=${pickupId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.id !== pickupId));
        alert("Data penyetoran berhasil dihapus");
      } else {
        alert("Gagal menghapus data penyetoran");
      }
    } catch (error) {
      console.error("Error saat menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data penyetoran");
    }
  };

  const handleCancel = async (pickupId: string) => {
    try {
      const response = await fetch(
        `/api/penyetoran/cancel?pickupId=${pickupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Dibatalkan" }),
        }
      );

      if (response.ok) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === pickupId ? { ...item, status: "Dibatalkan" } : item
          )
        );
        alert("Penyetoran berhasil dibatalkan");
      } else {
        alert("Gagal membatalkan penyetoran");
      }
    } catch (error) {
      console.error("Error saat membatalkan penyetoran:", error);
      alert("Terjadi kesalahan saat membatalkan penyetoran");
    }
  };

  // Filter data berdasarkan tab aktif
  const statusOrder = [
    "Pending",
    "Dijemput",
    "Ditimbang",
    "Selesai",
    "Dibatalkan",
  ];

  const filteredData = data
    .filter((item) => {
      if (activeTab === "semua") {
        return true;
      }
      return item.status === activeTab;
    })
    .sort((a, b) => {
      const orderA = statusOrder.indexOf(a.status);
      const orderB = statusOrder.indexOf(b.status);
      return orderA - orderB;
    });

  // Reset data ketika tab berubah
  useEffect(() => {
    setPage(1);
    // Reset data ke state awal
    const fetchData = async () => {
      try {
        const response = await fetch("/api/penyetoran/penyetoran");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          console.error("Gagal mengambil data.");
        }
      } catch (error) {
        console.error("Error saat mengambil data:", error);
      }
    };

    fetchData();
  }, [activeTab]);

  const totalResults = filteredData.length;

  // Data yang akan ditampilkan di tabel
  const displayedData = filteredData.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  const totalPengguna = users.length;
  const totalPenyetoran = data.length;
  const menungguVerifikasi = data.filter(
    (item) => item.status === "Pending"
  ).length;
  const selesai = data.filter((item) => item.status === "Selesai").length;

  // Perhitungan total sampah non-elektronik (kg) dan elektronik (quantity)
  const totalSampahNonElektronik = data
    .filter((item) => item.status === "Selesai")
    .reduce((total, penyetoran) => {
      if (Array.isArray((penyetoran as any).items)) {
        return (
          total +
          (penyetoran as any).items.reduce(
            (subTotal: number, item: any) =>
              item.type !== "Non-organik-elektronik"
                ? subTotal + (item.quantity || 0)
                : subTotal,
            0
          )
        );
      }
      return total;
    }, 0);

  const totalSampahElektronik = data
    .filter((item) => item.status === "Selesai")
    .reduce((total, penyetoran) => {
      if (Array.isArray((penyetoran as any).items)) {
        return (
          total +
          (penyetoran as any).items.reduce(
            (subTotal: number, item: any) =>
              item.type === "Non-organik-elektronik"
                ? subTotal + (item.quantity || 0)
                : subTotal,
            0
          )
        );
      }
      return total;
    }, 0);

  // Gabungkan hasil ke dalam satu string
  let totalSampahString = "";
  if (totalSampahNonElektronik > 0) {
    totalSampahString += `${totalSampahNonElektronik.toLocaleString(
      "id-ID"
    )} kg`;
  }
  if (totalSampahElektronik > 0) {
    if (totalSampahString) totalSampahString += " + ";
    totalSampahString += `${totalSampahElektronik.toLocaleString(
      "id-ID"
    )} elektronik`;
  }
  if (!totalSampahString) {
    totalSampahString = "0";
  }

  const jumlahUnitElektronik = data
    .filter((item) => item.status === "Selesai")
    .reduce((total, penyetoran) => {
      if (Array.isArray((penyetoran as any).items)) {
        return (
          total +
          (penyetoran as any).items.reduce(
            (subTotal: number, item: any) =>
              item.type === "Non-organik-elektronik"
                ? subTotal + (item.quantity || 0)
                : subTotal,
            0
          )
        );
      }
      return total;
    }, 0);

  const openDetailModal = (penyetoran: Penyetoran) => {
    setSelectedPenyetoranDetail(penyetoran);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedPenyetoranDetail(null);
    setIsDetailModalOpen(false);
  };

  return (
    <Layout>
      <PageTitle>Dashboard</PageTitle>
      <CTA />

      <div className="grid gap-6 mb-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <InfoCard title="" value="">
            <div className="flex flex-col items-center text-center w-full">
              <div className="flex flex-row items-center gap-2 mb-2">
                <RoundIcon
                  icon={PeopleIcon}
                  iconColorClass="text-orange-500 dark:text-orange-100"
                  bgColorClass="bg-orange-100 dark:bg-orange-500"
                  className=""
                />
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  Total Pengguna
                </div>
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                {totalPengguna}
              </div>
            </div>
          </InfoCard>
        )}

        <InfoCard title="" value="">
          <div className="flex flex-col items-center text-center w-full">
            <div className="flex flex-row items-center gap-2 mb-2">
              <RoundIcon
                icon={MoneyIcon}
                iconColorClass="text-green-500 dark:text-green-100"
                bgColorClass="bg-green-100 dark:bg-green-500"
                className=""
              />
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                Jumlah Penyetoran
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
              {totalPenyetoran}
            </div>
          </div>
        </InfoCard>

        <InfoCard title="" value="">
          <div className="flex flex-col items-center text-center w-full">
            <div className="flex flex-row items-center gap-2 mb-2">
              <RoundIcon
                icon={CartIcon}
                iconColorClass="text-blue-500 dark:text-blue-100"
                bgColorClass="bg-blue-100 dark:bg-blue-500"
                className=""
              />
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                Menunggu Verifikasi Penyetoran
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
              {menungguVerifikasi}
            </div>
          </div>
        </InfoCard>
      </div>
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-2">
        <InfoCard title="" value="">
          <div className="flex flex-col items-center text-center w-full">
            <div className="flex flex-row items-center gap-2 mb-2">
              <RoundIcon
                icon={ChatIcon}
                iconColorClass="text-teal-500 dark:text-teal-100"
                bgColorClass="bg-teal-100 dark:bg-teal-500"
                className=""
              />
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                Penyetoran Selesai
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
              {selesai}
            </div>
          </div>
        </InfoCard>
        <InfoCard title="" value="">
          <div className="flex flex-col items-center text-center w-full">
            <div className="flex flex-row items-center gap-2 mb-2">
              <RoundIcon
                icon={TrashIcon}
                iconColorClass="text-purple-500 dark:text-purple-100"
                bgColorClass="bg-purple-100 dark:bg-purple-500"
                className=""
              />
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                Total Sampah Terkumpul
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 mb-1 justify-center">
              <span className="text-gray-600 dark:text-gray-100 text-lg align-middle">
                🗑️
              </span>
              <span className="text-base font-semibold align-middle text-gray-800 dark:text-gray-100">
                {totalSampahNonElektronik} kg
              </span>
              <span className="text-gray-600 text-xs align-middle dark:text-gray-300">
                Sampah Umum
              </span>
            </div>
            <div className="flex flex-row items-center gap-2 justify-center">
              <span className="text-gray-600 dark:text-gray-100 text-lg align-middle">
                🔌
              </span>
              <span className="text-base font-semibold align-middle text-gray-800 dark:text-gray-100">
                {totalSampahElektronik}
              </span>
              <span className="text-gray-600 text-xs align-middle dark:text-gray-300">
                Elektronik
              </span>
              <span className="text-gray-500 text-[10px] ml-1 align-middle dark:text-gray-300">
                ({jumlahUnitElektronik} unit)
              </span>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* Tab dan tabel */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Filter status Tab */}
        {[
          "semua",
          "Pending",
          "Dijemput",
          "Ditimbang",
          "Selesai",
          "Dibatalkan",
        ].map((status) => (
          <Button
            key={status}
            size="small"
            layout={activeTab === status ? "primary" : "outline"}
            onClick={() => {
              setActiveTab(status);
              setPage(1);
            }}
            className={`${
              activeTab === status
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Nama Pengguna</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tanggal Penyetoran</TableCell>
                <TableCell>Action</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {displayedData.map((item) => {
                const user = item.user;
                return (
                  <TableRow
                    key={`${item.id}-${user.id}`}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => openDetailModal(item)}
                  >
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Avatar
                          className="hidden mr-3 md:block"
                          src="/assets/img/default.jpg"
                          alt="User avatar"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {user.nama}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {user.level}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        {item.address
                          ? `${item.address.label_Alamat}, ${item.address.Kecamatan}, ${item.address["kota-kabupaten"]}, ${item.address.Kode_pos}`
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge type={getBadgeType(item.status)}>
                          {item.status}
                        </Badge>
                        {item.status === "Pending" && item.cancelReason && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPenyetoran(item);
                              setIsCancelModalOpen(true);
                            }}
                            className="ml-2 text-yellow-500 hover:text-yellow-700"
                            title="Lihat permintaan pembatalan dari kurir"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                        {item.status === "Dibatalkan" &&
                          item.alasanPembatalan && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPenyetoran(item);
                                setIsCancelModalOpen(true);
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                              title="Lihat alasan pembatalan"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button
                          layout="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(item.id);
                          }}
                          disabled={item.status !== "Pending"}
                          className={
                            item.status !== "Pending"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600"
                          }
                        >
                          Batalkan
                        </Button>
                        <Button
                          layout="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <TrashIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
      </div>

      {/* Modal Pembatalan */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {selectedPenyetoran?.status === "Pending"
                ? "Permintaan Pembatalan dari Kurir"
                : "Alasan Pembatalan"}
            </h2>

            {selectedPenyetoran?.status === "Pending" ? (
              <>
                <p className="mb-2 text-gray-900 dark:text-white">
                  Alasan kurir ingin membatalkan:
                </p>
                <p className="p-2 bg-yellow-100 rounded">
                  {selectedPenyetoran?.cancelReason}
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    layout="outline"
                    onClick={() => setIsCancelModalOpen(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    layout="primary"
                    onClick={() => {
                      if (selectedPenyetoran) {
                        handleCancel(selectedPenyetoran.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Setujui Pembatalan
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-gray-900 dark:text-white">
                  Alasan pembatalan:
                </p>
                <p className="p-2 bg-gray-100 rounded">
                  {selectedPenyetoran?.alasanPembatalan}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Dibatalkan pada:{" "}
                  {selectedPenyetoran?.tanggalPembatalan
                    ? new Date(
                        selectedPenyetoran.tanggalPembatalan
                      ).toLocaleString("id-ID")
                    : "-"}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    layout="outline"
                    onClick={() => setIsCancelModalOpen(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Penyetoran */}
      {isDetailModalOpen && selectedPenyetoranDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Detail Penyetoran
              </h2>
              <div className="space-y-6">
                {/* Informasi Pengguna */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">
                    Informasi Pengguna
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Nama
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedPenyetoranDetail.user.nama}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi Alamat */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">
                    Informasi Alamat
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Label Alamat
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedPenyetoranDetail.address.label_Alamat}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-200">
                          Kecamatan
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPenyetoranDetail.address.Kecamatan}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-200">
                          Kota/Kabupaten
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPenyetoranDetail.address["kota-kabupaten"]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-200">
                          Kode Pos
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPenyetoranDetail.address.Kode_pos}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informasi Penyetoran */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">
                    Informasi Penyetoran
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Status
                      </p>
                      <Badge
                        type={getBadgeType(selectedPenyetoranDetail.status)}
                      >
                        {selectedPenyetoranDetail.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Tanggal Penyetoran
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedPenyetoranDetail.createdAt
                          ? new Date(
                              selectedPenyetoranDetail.createdAt
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi Sampah */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">
                    Informasi Sampah
                  </h5>
                  <div className="space-y-4">
                    {Array.isArray((selectedPenyetoranDetail as any).items) ? (
                      (selectedPenyetoranDetail as any).items.map(
                        (item: any, index: number) => {
                          const folder = mapTypeToFolder(item.type);
                          const imagePath =
                            item.image === "default-sampah.png"
                              ? "/assets/img/default-sampah.png"
                              : `/assets/img/${folder}/${item.image}`;
                          return (
                            <div
                              key={index}
                              className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex items-start gap-4">
                                <Avatar
                                  className="hidden mr-3 md:block"
                                  src={imagePath}
                                  alt={item.name}
                                />
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-200">
                                      Nama Item
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-200">
                                      Jumlah
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.quantity}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-200">
                                      Tipe
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.type}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-200">
                                      Poin
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.points}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-200">
                                      Deskripsi
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <p className="text-gray-500">Tidak ada data sampah.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button layout="outline" onClick={closeDetailModal}>
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

export default Dashboard;
