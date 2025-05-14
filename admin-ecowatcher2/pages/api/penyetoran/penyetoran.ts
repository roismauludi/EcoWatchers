import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Tipe untuk Penyetoran
type Penyetoran = {
  id: string;
  userId: string; // Pastikan ada field userId untuk relasi ke pengguna
  [key: string]: any; // Data tambahan untuk penyetoran
};

// Tipe untuk Pengguna
type User = {
  id: string;
  nama: string;
  role: string;
  foto: string[]; // Jika ada foto
  [key: string]: any; // Data tambahan untuk pengguna
};

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  data?: (Penyetoran & { user?: User })[]; // Menambahkan data pengguna ke setiap item penyetoran
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

    // Ambil data dari koleksi Penyetoran
    const penyetoranCollection = collection(db, "Penyetoran");
    const penyetoranSnapshot = await getDocs(penyetoranCollection);
    // console.log(`Found ${penyetoranSnapshot.docs.length} documents`);

    // Ambil data dari koleksi Pengguna
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // console.log(`Found ${usersData.length} users`);

    // Ubah snapshot Penyetoran menjadi array objek
    const penyetoranData = penyetoranSnapshot.docs.map((doc) => {
      const penyetoran = {
        id: doc.id,
        ...doc.data(),
      };

      // Cari pengguna berdasarkan userId
      const user = usersData.find((user) => user.id === penyetoran.userId);

      return {
        ...penyetoran,
        user, // Menambahkan data pengguna ke dalam penyetoran
      };
    });

    // console.log("Fetched and combined data:", penyetoranData);

    res.status(200).json({ success: true, data: penyetoranData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
