import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
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

    // Buat item baru
    const newItem = {
      Id_barang,
      Nama_barang,
      Deskripsi: Deskripsi || "",
      Point: Number(Point),
      Type,
      Image: Image || "default-sampah.png",
    };

    // Update dokumen dengan menambahkan item baru ke array
    await updateDoc(katalogRef, {
      [kategori]: arrayUnion(newItem),
    });

    return res.status(200).json({
      success: true,
      message: "Item berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan item",
    });
  }
}
