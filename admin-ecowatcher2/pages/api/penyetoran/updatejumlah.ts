// pages/api/penyetoran/updatejumlah.js
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config"; // Sesuaikan dengan path konfigurasi Firebase Anda
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { pickupId, itemId, newQuantity } = req.body; // Ambil pickupId, itemId, dan newQuantity dari body

    // Cek apakah pickupId, itemId, dan newQuantity ada
    if (!pickupId || !itemId || newQuantity === undefined) {
      return res
        .status(400)
        .json({ message: "pickupId, itemId, dan newQuantity harus diberikan" });
    }

    try {
      const pickupRef = doc(db, "Penyetoran", pickupId); // Pastikan pickupId tidak undefined
      const docSnapshot = await getDoc(pickupRef);
      if (!docSnapshot.exists()) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      const data = docSnapshot.data();
      const updatedItems = data.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item
      );

      // Update items di koleksi Penyetoran
      await updateDoc(pickupRef, { items: updatedItems });

      res.status(200).json({
        success: true,
        message: `Quantity berhasil diubah menjadi ${newQuantity}`,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan saat memperbarui quantity" });
    }
  } else {
    res.status(405).json({ message: "Metode tidak diizinkan, gunakan PUT" });
  }
}
