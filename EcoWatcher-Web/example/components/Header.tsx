import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import SidebarContext from "../../context/SidebarContext";

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar: contextToggleSidebar } =
    React.useContext(SidebarContext);

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        <button
          className="p-2 rounded-md lg:hidden"
          onClick={contextToggleSidebar}
          aria-label="Buka sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-200 tracking-wide">
            EcoWatcher
          </span>
        </div>
        <ul className="flex items-center flex-shrink-0 space-x-6">
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={toggleTheme}
              aria-label="Toggle color mode"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
