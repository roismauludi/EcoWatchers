import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { id, status } = req.body;

  if (!id || !status) {
    return res
      .status(400)
      .json({ success: false, error: "Missing parameters" });
  }

  try {
    // Update status transaksi di Firestore berdasarkan ID
    const transactionDoc = doc(db, "transactions", id);
    await updateDoc(transactionDoc, { status });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
