import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";
import { auth } from "../../utils/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { SidebarProvider } from "../../context/SidebarContext";

interface ILayout {
  children: React.ReactNode;
}

function Layout({ children }: ILayout) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Jika user tidak login dan bukan di halaman login, redirect ke login
      if (!currentUser && router.pathname !== "/example/login") {
        router.push("/example/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Jika masih loading, tampilkan loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Jika di halaman login, tampilkan tanpa layout
  if (router.pathname === "/example/login") {
    return <>{children}</>;
  }

  // Jika user tidak login, tampilkan loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div
        className={`flex h-screen ${
          isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="z-10 py-4 bg-white dark:bg-gray-800 shadow-md">
            <div className="container flex items-center justify-between h-full px-6 mx-auto">
              <div className="w-10"></div>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-200 tracking-wide">
                EcoWatcher
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <SunIcon className="w-6 h-6 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <Main>{children}</Main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
