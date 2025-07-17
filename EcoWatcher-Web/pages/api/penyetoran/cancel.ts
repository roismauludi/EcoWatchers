import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { pickupId } = req.query;

  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ message: "Metode tidak diizinkan, gunakan PUT" });
  }

  if (!pickupId) {
    return res.status(400).json({ message: "pickupId harus diberikan" });
  }

  try {
    const pickupRef = doc(db, "Penyetoran", pickupId as string);
    await updateDoc(pickupRef, { status: "Dibatalkan" });

    res
      .status(200)
      .json({ success: true, message: "Penyetoran berhasil dibatalkan" });
  } catch (error) {
    console.error("Error canceling pickup:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat membatalkan penyetoran" });
  }
}
