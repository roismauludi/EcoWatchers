import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config"; // Sesuaikan dengan path konfigurasi Firebase Anda
import { collection, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const trackRef = collection(db, "Track");
      const trackSnapshot = await getDocs(trackRef);
      const trackData = trackSnapshot.docs.map((doc) => ({
        pickupId: doc.id, // Mengambil ID dokumen
        ...doc.data(), // Mengambil data dokumen
      }));

      // Format data sesuai kebutuhan
      const formattedData = trackData.map((data) => ({
        newStatus: data.newStatus,
        pickupId: data.pickupId, // Pastikan pickupId ada di sini
        queueNumber: data.queueNumber,
        statuses: data.statuses, // Menampilkan statuses
        timestamp: data.timestamp.toDate().toISOString(), // Format timestamp
      }));

      res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
      console.error("Error fetching track data:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data",
      });
    }
  } else {
    res
      .status(405)
      .json({ success: false, message: "Metode tidak diizinkan, gunakan GET" });
  }
}
