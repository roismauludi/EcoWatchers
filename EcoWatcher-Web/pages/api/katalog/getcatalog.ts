import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const katalogRef = collection(db, "katalog");
    const snapshot = await getDocs(katalogRef);

    const katalogData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      data: katalogData,
    });
  } catch (error) {
    console.error("Error fetching katalog:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data katalog",
    });
  }
}
