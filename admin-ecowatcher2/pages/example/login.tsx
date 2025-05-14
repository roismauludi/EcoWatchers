import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../utils/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase/config";
import Cookies from "js-cookie";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Silakan isi email dan password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cek role admin di Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data()?.level !== "admin") {
        await auth.signOut();
        setError("Anda tidak memiliki akses admin");
        return;
      }

      // Dapatkan token dan simpan di cookie
      const token = await user.getIdToken();
      Cookies.set("token", token, { expires: 7 }); // Token akan expired dalam 7 hari

      setShowSuccess(true);
      // Tunggu animasi selesai sebelum redirect
      setTimeout(() => {
        router.push("/example");
      }, 1500);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("Email tidak terdaftar");
      } else if (error.code === "auth/wrong-password") {
        setError("Password salah");
      } else {
        setError(error.message || "Terjadi kesalahan saat login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div
        className={`flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800 transition-all duration-500 ${
          showSuccess ? "scale-105 opacity-90" : ""
        }`}
      >
        <div className="flex flex-col overflow-y-auto md:flex-row">
          <div className="h-32 md:h-auto md:w-1/2">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full"
              src="/assets/img/sampah-daur-ulang.PNG"
              alt="Office"
            />
          </div>
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            <div className="w-full">
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                Login
              </h1>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              )}
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-200 animate-fade-in">
                  Login berhasil! Mengalihkan...
                </div>
              )}
              <form onSubmit={handleLogin}>
                <label className="block text-sm">
                  <span className="text-gray-700 dark:text-gray-400">
                    Email
                  </span>
                  <input
                    className="block w-full mt-1 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 form-input"
                    placeholder="admin@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="block mt-4 text-sm">
                  <span className="text-gray-700 dark:text-gray-400">
                    Password
                  </span>
                  <input
                    className="block w-full mt-1 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 form-input"
                    placeholder="***************"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className={`block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    "Log in"
                  )}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
