import * as React from "react";
import { useState, useEffect } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Input } from "@windmill/react-ui";
import CTA from "example/components/CTA";
import InfoCard from "example/components/Cards/InfoCard";
import PageTitle from "example/components/Typography/PageTitle";
import RoundIcon from "example/components/RoundIcon";
import Layout from "example/containers/Layout";
import {
  ChatIcon,
  CartIcon,
  MoneyIcon,
  PeopleIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
} from "icons";

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
} from "@windmill/react-ui";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface IBarang {
  Type: string;
  Nama_barang: string;
  Point: number;
  Deskripsi: string;
  Image: string;
  Id_barang: string;
}

interface IKatalog {
  id: string;
  [key: string]: IBarang[] | string;
}

function Catalog() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IKatalog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<IBarang | null>(null);
  const [detailsData, setDetailsData] = useState<IBarang | null>(null);
  const [newItem, setNewItem] = useState<
    Partial<IBarang> & { kategori: string }
  >({
    Type: "",
    Nama_barang: "",
    Point: 0,
    Deskripsi: "",
    Image: "default-sampah.png",
    Id_barang: "",
    kategori: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const resultsPerPage = 10;

  useEffect(() => {
    fetchKatalogData();
  }, []);

  const fetchKatalogData = async () => {
    try {
      const response = await fetch("/api/katalog/getcatalog");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setSelectedCategory(""); // Set default ke tab Semua
      } else {
        console.error("Gagal mengambil data katalog:", result.message);
      }
    } catch (error) {
      console.error("Error fetching katalog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item: IBarang) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const openDetailsModal = (item: IBarang) => {
    setDetailsData(item);
    setIsDetailsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsData(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const saveChanges = async () => {
    if (formData) {
      try {
        // Temukan kategori dari data
        const category = data.find((cat) =>
          (cat[cat.id] as IBarang[]).some(
            (item) => item.Id_barang === formData.Id_barang
          )
        );

        if (!category) {
          alert("Kategori tidak ditemukan");
          return;
        }

        const response = await fetch("/api/katalog/edititem", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kategori: category.id,
            ...formData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          await fetchKatalogData(); // Refresh data setelah update
          closeModal();
          alert("Item berhasil diupdate");
        } else {
          alert(result.message || "Gagal mengupdate item");
        }
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Terjadi kesalahan saat mengupdate item");
      }
    }
  };

  const getCurrentCategoryData = () => {
    if (selectedCategory === "") {
      // Jika "Semua" dipilih, gabungkan semua data dari setiap kategori
      return data.reduce((acc: IBarang[], category) => {
        return [...acc, ...(category[category.id] as IBarang[])];
      }, []);
    }
    const category = data.find((item) => item.id === selectedCategory);
    return category ? (category[selectedCategory] as IBarang[]) : [];
  };

  const currentCategoryData = getCurrentCategoryData();
  const totalResults = currentCategoryData.length;
  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentPageData = currentCategoryData.slice(startIndex, endIndex);

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/katalog/additem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const result = await response.json();

      if (result.success) {
        setIsAddModalOpen(false);
        await fetchKatalogData(); // Refresh data setelah menambah
      } else {
        alert(result.message || "Gagal menambahkan item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Terjadi kesalahan saat menambahkan item");
    }
  };

  const generateItemId = (category: string) => {
    const categoryPrefix: { [key: string]: string } = {
      Elektronik: "E",
      Kaca: "K",
      Kertas: "KE",
      Logam: "L",
      Minyak: "M",
      Plastik: "P",
    };

    const prefix = categoryPrefix[category] || "";
    const categoryData = data.find((cat) => cat.id === category);
    if (!categoryData) return "";

    const items = categoryData[category] as IBarang[];
    const lastItem = items[items.length - 1];

    if (!lastItem) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastItem.Id_barang.replace(prefix, ""));
    const newNumber = lastNumber + 1;
    return `${prefix}${newNumber.toString().padStart(4, "0")}`;
  };

  const handleCategoryChange = (category: string) => {
    const newId = generateItemId(category);
    setNewItem({
      ...newItem,
      kategori: category,
      Id_barang: newId,
      Type: `Non-Organik ${category}`,
    });
  };

  return (
    <Layout>
      <PageTitle>Katalog</PageTitle>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="border-b border-gray-200 flex-grow">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                  className={`${
                    selectedCategory === ""
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Semua
                </button>
                {data.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={`${
                      selectedCategory === category.id
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    {category.id}
                  </button>
                ))}
              </nav>
            </div>
            <Button className="ml-4" onClick={() => setIsAddModalOpen(true)}>
              Tambah Item
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>Tipe</TableCell>
                  <TableCell>Point</TableCell>
                  <TableCell>Aksi</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentPageData.map((item) => (
                  <TableRow key={item.Id_barang}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Avatar
                          className="hidden mr-3 md:block"
                          src={`/assets/img/${
                            item.Image === "default-sampah.png"
                              ? "default-sampah.png"
                              : `${
                                  selectedCategory === ""
                                    ? data
                                        .find((cat) =>
                                          (cat[cat.id] as IBarang[]).some(
                                            (barang) =>
                                              barang.Id_barang ===
                                              item.Id_barang
                                          )
                                        )
                                        ?.id.toLowerCase()
                                    : selectedCategory.toLowerCase()
                                }/${item.Image}`
                          }`}
                          alt={item.Nama_barang}
                        />
                        <div>
                          <p className="font-semibold">{item.Nama_barang}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.Deskripsi}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge type="primary">{item.Type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.Point.toLocaleString("id-ID")} Point
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Button
                          layout="link"
                          size="small"
                          aria-label="Edit"
                          onClick={() => openModal(item)}
                        >
                          <EditIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <Button
                          layout="link"
                          size="small"
                          aria-label="Details"
                          onClick={() => openDetailsModal(item)}
                        >
                          <SearchIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="mt-4">
            <Pagination
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={setPage}
              label="Table navigation"
            />
          </div>
        </>
      )}

      {/* Modal Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Barang
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {formData && (
                <div className="grid gap-4 mb-4">
                  <Label>
                    <span className="text-gray-700 dark:text-gray-300">
                      Nama Barang
                    </span>
                    <input
                      name="Nama_barang"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      value={formData.Nama_barang}
                      onChange={handleInputChange}
                    />
                  </Label>
                  <Label>
                    <span className="text-gray-700 dark:text-gray-300">
                      Deskripsi
                    </span>
                    <textarea
                      name="Deskripsi"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      value={formData.Deskripsi}
                      onChange={handleInputChange}
                    />
                  </Label>
                  <Label>
                    <span className="text-gray-700 dark:text-gray-300">
                      Point
                    </span>
                    <input
                      name="Point"
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      value={formData.Point.toString()}
                      onChange={handleInputChange}
                    />
                  </Label>
                  <Label>
                    <span className="text-gray-700 dark:text-gray-300">
                      Tipe
                    </span>
                    <div className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300">
                      {formData.Type}
                    </div>
                  </Label>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <Button layout="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button onClick={saveChanges}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detail Barang
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {detailsData && (
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {detailsData.Nama_barang}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {detailsData.Deskripsi}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Point
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {detailsData.Point.toLocaleString("id-ID")} Point
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipe
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {detailsData.Type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ID Barang
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {detailsData.Id_barang}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button onClick={closeDetailsModal}>Tutup</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Tambah Item Baru
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid gap-4 mb-4">
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">
                    Kategori
                  </span>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    value={newItem.kategori}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Pilih Kategori</option>
                    {data.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.id}
                      </option>
                    ))}
                  </select>
                </Label>
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">
                    Nama Barang
                  </span>
                  <Input
                    className=""
                    css=""
                    value={newItem.Nama_barang}
                    onChange={(e) =>
                      setNewItem({ ...newItem, Nama_barang: e.target.value })
                    }
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  />
                </Label>
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">
                    Deskripsi
                  </span>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    value={newItem.Deskripsi}
                    onChange={(e) =>
                      setNewItem({ ...newItem, Deskripsi: e.target.value })
                    }
                  />
                </Label>
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">
                    Point
                  </span>
                  <Input
                    className=""
                    css=""
                    type="number"
                    value={newItem.Point?.toString() || "0"}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        Point: parseInt(e.target.value) || 0,
                      })
                    }
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  />
                </Label>
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">Tipe</span>
                  <Input
                    className=""
                    css=""
                    value={newItem.Type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, Type: e.target.value })
                    }
                    crossOrigin={undefined}
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  />
                </Label>
                <Label>
                  <span className="text-gray-700 dark:text-gray-300">
                    ID Barang
                  </span>
                  <div className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300">
                    {newItem.Id_barang}
                  </div>
                </Label>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  layout="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleAddItem}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Catalog;
