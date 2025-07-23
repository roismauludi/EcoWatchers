import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { kategori, Id_barang, Nama_barang, Deskripsi, Point, Type, Image } =
      req.body;

    // Validasi data yang diperlukan
    if (!kategori || !Id_barang || !Nama_barang || !Point || !Type) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap",
      });
    }

    // Referensi ke dokumen katalog
    const katalogRef = doc(db, "katalog", kategori);

    // Dapatkan data katalog yang ada
    const katalogDoc = await getDoc(katalogRef);

    if (!katalogDoc.exists()) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    const katalogData = katalogDoc.data();
    const items = katalogData[kategori] || [];

    // Cari dan update item yang sesuai
    const updatedItems = items.map((item: any) => {
      if (item.Id_barang === Id_barang) {
        return {
          ...item,
          Nama_barang,
          Deskripsi: Deskripsi || item.Deskripsi,
          Point: Number(Point),
          Image: Image || item.Image,
        };
      }
      return item;
    });

    // Update dokumen dengan array yang sudah diupdate
    await updateDoc(katalogRef, {
      [kategori]: updatedItems,
    });

    return res.status(200).json({
      success: true,
      message: "Item berhasil diupdate",
      data: {
        Id_barang,
        Nama_barang,
        Deskripsi,
        Point: Number(Point),
        Type,
        Image,
      },
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate item",
    });
  }
}
