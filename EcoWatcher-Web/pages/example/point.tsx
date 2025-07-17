import * as React from "react";
import { useState, useEffect } from "react";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Badge,
  Pagination,
  Button,
  Input,
  Label,
} from "@windmill/react-ui";
import { Modal } from "@windmill/react-ui";
import Layout from "example/containers/Layout";
import PageTitle from "example/components/Typography/PageTitle";
import { EditIcon } from "icons";

type TransactionData = {
  id: string;
  email: string;
  jenisBank: string;
  nama: string;
  namaRekening: string;
  noRekening: string;
  nominal: number;
  pointUsed: number;
  status: string;
  timestamp: string;
  userId: string;
};

const getBadgeType = (
  status: string
): "primary" | "success" | "danger" | "warning" | "neutral" | undefined => {
  switch (status) {
    case "Selesai":
      return "success";
    case "Diajukan":
      return "primary";
    default:
      return "neutral";
  }
};

function Point() {
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const resultsPerPage = 10;

  // Mengambil data dari API ketika komponen pertama kali dimuat
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transaksi/gettransaksi");
        const result = await response.json();
        if (result.success) {
          // Urutkan data berdasarkan timestamp dari yang terbaru
          const sortedData = result.data.sort(
            (a: TransactionData, b: TransactionData) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setTransactions(sortedData);
        } else {
          console.error("Failed to fetch transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  const updateTransactionStatus = async (
    transactionId: string,
    newStatus: string
  ) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin mengubah status penukaran point menjadi Selesai?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/transaksi/updatetransaksi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: transactionId,
          status: newStatus,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Update state lokal
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, status: newStatus }
              : transaction
          )
        );
        alert("Status penukaran point berhasil diubah menjadi Selesai");
      } else {
        console.error("Failed to update transaction status:", data.error);
        alert("Gagal mengubah status penukaran point");
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Terjadi kesalahan saat mengubah status penukaran point");
    }
  };

  const openModal = (transaction: TransactionData) => {
    setFormData(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    if (formData) {
      try {
        // Mengirimkan permintaan untuk mengupdate status transaksi
        const response = await fetch("/api/transaksi/updatetransaksi", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: formData.id,
            status: formData.status,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Update status transaksi di state jika berhasil
          setTransactions((prevData) =>
            prevData.map((item) => (item.id === formData.id ? formData : item))
          );
          console.log("Transaction status updated successfully");
        } else {
          console.error("Failed to update transaction status:", data.error);
        }
      } catch (error) {
        console.error("Error updating transaction status:", error);
      }
    }
    closeModal(); // Menutup modal setelah proses selesai
  };

  // Mendapatkan data untuk tampilan halaman saat ini
  const paginatedTransactions = transactions.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  // Fungsi untuk memformat tanggal ke format yang diinginkan
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const openDetailModal = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedTransaction(null);
    setIsDetailModalOpen(false);
  };

  return (
    <Layout>
      <PageTitle>ChangePoint</PageTitle>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Nama Pengguna</TableCell>
              <TableCell>Jenis Bank</TableCell>
              <TableCell>Nominal</TableCell>
              <TableCell>Point</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {transaction.nama}
                  </p>
                </TableCell>
                <TableCell>{transaction.jenisBank}</TableCell>
                <TableCell>
                  RP. {transaction.nominal.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  {transaction.pointUsed.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge type={getBadgeType(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      layout="link"
                      size="small"
                      onClick={() => openDetailModal(transaction)}
                    >
                      <span className="text-blue-600">Detail</span>
                    </Button>
                    {transaction.status === "Diajukan" && (
                      <Button
                        layout="link"
                        size="small"
                        onClick={() =>
                          updateTransactionStatus(transaction.id, "Selesai")
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Ubah Status Selesai
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={transactions.length}
            resultsPerPage={resultsPerPage}
            onChange={setPage}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>

      {/* Modal Detail */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl overflow-x-auto">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                  Detail Penukaran Point
                </h4>
              </div>
              <div className="mb-4">
                {selectedTransaction && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Informasi Pengguna
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Nama
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.nama}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Email
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Informasi Penukaran
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Point Ditukar
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.pointUsed.toLocaleString(
                              "id-ID"
                            )}{" "}
                            Point
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Nominal
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Rp{" "}
                            {selectedTransaction.nominal.toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Status
                          </p>
                          <Badge
                            type={getBadgeType(selectedTransaction.status)}
                          >
                            {selectedTransaction.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Tanggal Pengajuan
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedTransaction.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Informasi Rekening
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Bank
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.jenisBank}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Nama Rekening
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.namaRekening}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-200">
                            Nomor Rekening
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTransaction.noRekening}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
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

export default Point;
