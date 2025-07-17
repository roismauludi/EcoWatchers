import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  count?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Log metode request
  console.log(`Received ${req.method} request`);

  if (req.method !== "GET") {
    console.log("Method not allowed");
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log("Fetching unverified point exchanges from Firestore...");

    // Ambil data dari koleksi transaksi point yang belum diverifikasi
    // Asumsikan ada field status dengan nilai "Diajukan"
    const transactionsCollection = collection(db, "transactions");
    const q = query(transactionsCollection, where("status", "==", "Diajukan"));
    const transactionsSnapshot = await getDocs(q);

    const unverifiedCount = transactionsSnapshot.size;

    console.log(`Found ${unverifiedCount} unverified point exchanges`);

    // Mengirim jumlah dalam respon
    res.status(200).json({ success: true, count: unverifiedCount });
  } catch (error) {
    console.error("Error fetching unverified point exchanges:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
