import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Log metode request
  console.log(`Received ${req.method} request`);

  if (req.method !== "POST") {
    console.log("Method not allowed");
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });
    }

    console.log(`Verifying user with ID: ${userId}`);

    // Update status user menjadi "Aktif"
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status: "Aktif",
    });

    console.log(`User ${userId} has been verified successfully`);

    // Mengirim response sukses
    res.status(200).json({
      success: true,
      message: "Akun berhasil diverifikasi",
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
