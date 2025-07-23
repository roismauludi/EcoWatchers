import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { pickupId } = req.query;

  if (req.method !== "DELETE") {
    return res
      .status(405)
      .json({ message: "Metode tidak diizinkan, gunakan DELETE" });
  }

  if (!pickupId) {
    return res.status(400).json({ message: "pickupId harus diberikan" });
  }

  try {
    const pickupRef = doc(db, "Penyetoran", pickupId as string);
    await deleteDoc(pickupRef);

    res.status(200).json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus data" });
  }
}
