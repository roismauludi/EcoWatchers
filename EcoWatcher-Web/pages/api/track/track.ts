import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config"; // Sesuaikan dengan path konfigurasi Firebase Anda
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const { pickupId, newStatus } = req.body;

    // Validasi input
    if (!pickupId || !newStatus) {
      return res
        .status(400)
        .json({ success: false, message: "pickupId dan newStatus diperlukan" });
    }

    try {
      // Mencari dokumen berdasarkan pickupId
      const trackRef = collection(db, "Track");
      const q = query(trackRef, where("pickupId", "==", pickupId)); // Ganti dengan field yang sesuai
      const trackSnapshot = await getDocs(q);

      if (trackSnapshot.empty) {
        return res
          .status(404)
          .json({ success: false, message: "Dokumen tidak ditemukan" });
      }

      // Ambil dokumen pertama yang ditemukan
      const docRef = doc(db, "Track", trackSnapshot.docs[0].id);

      // Buat objek status baru dengan timestamp
      const statusWithTimestamp = {
        status: newStatus,
        timestamp: new Date(), // Menyimpan waktu saat status ditambahkan
      };

      // Memperbarui dokumen dengan menambahkan status baru ke array statuses
      await updateDoc(docRef, {
        statuses: arrayUnion(statusWithTimestamp), // Menambahkan status baru ke array
      });

      res
        .status(200)
        .json({ success: true, message: "Status berhasil diperbarui" });
    } catch (error) {
      console.error("Error updating track status:", error);
      res
        .status(500)
        .json({ success: false, message: "Gagal memperbarui status" });
    }
  } else {
    res
      .status(405)
      .json({ success: false, message: "Metode tidak diizinkan, gunakan PUT" });
  }
}
