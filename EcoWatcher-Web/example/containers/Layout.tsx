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
import Header from "../components/Header";

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
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <Main>{children}</Main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
