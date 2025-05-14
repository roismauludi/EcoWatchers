import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth } from "../../utils/firebase/config";
import { signOut, onAuthStateChanged, User } from "firebase/auth";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push("/example/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 z-30 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 transition-transform duration-200 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="px-4 py-4">
            <ul className="mt-6">
              <li className="relative px-6 py-3">
                <Link href="/example">
                  <a
                    className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                      router.pathname === "/example"
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="ml-4">Dashboard</span>
                  </a>
                </Link>
              </li>
              <li className="relative px-6 py-3">
                <Link href="/example/point">
                  <a
                    className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                      router.pathname === "/example/point"
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="ml-4">Point</span>
                  </a>
                </Link>
              </li>
              <li className="relative px-6 py-3">
                <Link href="/example/penyetoran">
                  <a
                    className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                      router.pathname === "/example/penyetoran"
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="ml-4">Penyetoran</span>
                  </a>
                </Link>
              </li>
              <li className="relative px-6 py-3">
                <Link href="/example/settings">
                  <a
                    className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                      router.pathname === "/example/settings"
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="ml-4">Settings</span>
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="ml-4">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          ) : (
            <Link href="/example/login">
              <a className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="ml-4">Login</span>
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
