import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config"; // Sesuaikan dengan path konfigurasi Firebase Anda
import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pickupId } = req.query;

  if (req.method === "PUT") {
    try {
      const { newStatus } = req.body;
      console.log("Received newStatus:", newStatus); // Log newStatus
      console.log("Received pickupId:", pickupId); // Log pickupId

      if (!newStatus) {
        return res.status(400).json({ message: "Status baru harus diberikan" });
      }

      const pickupRef = doc(db, "Penyetoran", pickupId as string);
      const docSnapshot = await getDoc(pickupRef);
      if (!docSnapshot.exists()) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      const currentStatus = docSnapshot.data()?.status;
      console.log("Current status:", currentStatus); // Log currentStatus

      const validStatuses: Record<string, string[]> = {
        Pending: ["Dijemput"],
        Dijemput: ["Ditimbang"],
        Ditimbang: ["Selesai"],
      };

      if (!validStatuses[currentStatus]?.includes(newStatus)) {
        return res.status(400).json({
          message: `Transisi status tidak valid dari ${currentStatus} ke ${newStatus}`,
        });
      }

      // Update status di koleksi Penyetoran
      await updateDoc(pickupRef, { status: newStatus });

      // Jika status berubah dari Pending ke Dijemput, tambahkan data ke koleksi Track
      if (currentStatus === "Pending" && newStatus === "Dijemput") {
        const trackData = {
          pickupId: pickupId, // ID dokumen dari koleksi Penyetoran
          queueNumber: docSnapshot.data()?.queueNumber, // Ambil nomor antrian
          newStatus: newStatus,
          statuses: [],
          timestamp: new Date(), // Waktu perubahan status
        };

        // Tambahkan data ke koleksi Track
        const trackRef = collection(db, "Track");
        await addDoc(trackRef, trackData);
      }

      res.status(200).json({ message: `Status berhasil diubah menjadi ${newStatus}` });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Terjadi kesalahan saat memperbarui status" });
    }
  } else {
    res.status(405).json({ message: "Metode tidak diizinkan, gunakan PUT" });
  }
}