import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Tipe untuk Transaksi
type Transaction = {
  id: string;
  email: string;
  jenisBank: string;
  nama: string;
  namaRekening: string;
  noRekening: string;
  nominal: number;
  pointUsed: number;
  status: string;
  timestamp: string;
  userId: string;
  [key: string]: any; // Data tambahan jika diperlukan
};

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  data?: Transaction[]; // Menyimpan array data transaksi
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
    console.log("Fetching data from Firestore...");

    // Ambil data dari koleksi 'transactions'
    const transactionsCollection = collection(db, "transactions");
    const transactionsSnapshot = await getDocs(transactionsCollection);
    const transactionsData = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${transactionsData.length} transactions`);

    // Mengirim data transaksi dalam respon
    res.status(200).json({ success: true, data: transactionsData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
