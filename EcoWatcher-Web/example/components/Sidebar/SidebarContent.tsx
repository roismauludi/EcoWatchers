import Link from "next/link";
import routes, { routeIsActive } from "routes/sidebar";
import * as Icons from "icons";
import { IIcon } from "icons";
import SidebarSubmenu from "./SidebarSubmenu";
import { Button } from "@windmill/react-ui";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "../../../utils/firebase/config";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import Cookies from "js-cookie";
import { useNotifications } from "../../../context/NotificationContext";

function Icon({ icon, ...props }: IIcon) {
  // @ts-ignore
  const Icon = Icons[icon];
  return <Icon {...props} />;
}

interface ISidebarContent {
  linkClicked: () => void;
}

function SidebarContent({ linkClicked }: ISidebarContent) {
  const { pathname } = useRouter();
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { notifications } = useNotifications();

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
      Cookies.remove("token");
      window.location.href = "/example/login";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
      <div className="flex-1">
        <Link href="/#" passHref legacyBehavior>
          <div className="ml-6 py-6">
            <a className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {appName}
            </a>
          </div>
        </Link>
        <ul>
          {routes.map((route) =>
            route.routes ? (
              <SidebarSubmenu
                route={route}
                key={route.name}
                linkClicked={linkClicked}
              />
            ) : (
              <li className="relative px-6 py-3" key={route.name}>
                <Link href={route.path || "#"} scroll={false} legacyBehavior>
                  <a
                    className={`inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                      routeIsActive(pathname, route)
                        ? "dark:text-gray-100 text-gray-800"
                        : ""
                    }`}
                    onClick={linkClicked}
                  >
                    {routeIsActive(pathname, route) && (
                      <span
                        className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                        aria-hidden="true"
                      ></span>
                    )}

                    <Icon
                      className="w-5 h-5"
                      aria-hidden="true"
                      icon={route.icon || ""}
                    />
                    <span className="ml-4">{route.name}</span>

                    {/* Notification Badge */}
                    {route.notificationKey &&
                      notifications[
                        route.notificationKey as keyof typeof notifications
                      ] > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {
                            notifications[
                              route.notificationKey as keyof typeof notifications
                            ]
                          }
                        </span>
                      )}
                  </a>
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
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
          <Link href="/example/login" legacyBehavior>
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
  );
}

export default SidebarContent;
