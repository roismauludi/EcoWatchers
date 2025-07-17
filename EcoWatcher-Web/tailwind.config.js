const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./containers/**/*.{js,ts,jsx,tsx}",
    "./example/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}",
    "./example/components/**/*.{js,ts,jsx,tsx}",
    "./example/containers/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // ChartLegend dynamic colors
    "bg-blue-500",
    "bg-teal-600",
    "bg-purple-600",
    // RoundIcon dynamic colors (from cards/index/dashboard)
    "text-orange-500",
    "dark:text-orange-100",
    "bg-orange-100",
    "dark:bg-orange-500",
    "text-green-500",
    "dark:text-green-100",
    "bg-green-100",
    "dark:bg-green-500",
    "text-blue-500",
    "dark:text-blue-100",
    "bg-blue-100",
    "dark:bg-blue-500",
    "text-teal-500",
    "dark:text-teal-100",
    "bg-teal-100",
    "dark:bg-teal-500",
    "text-purple-500",
    "dark:text-purple-100",
    "bg-purple-100",
    "dark:bg-purple-500",
    // Semua class dark: yang ditemukan di project
    "dark:text-gray-100",
    "dark:text-gray-200",
    "dark:text-gray-300",
    "dark:text-gray-400",
    "dark:text-white",
    "dark:bg-gray-700",
    "dark:bg-gray-800",
    "dark:bg-gray-900",
    "dark:bg-red-900",
    "dark:bg-green-900",
    "dark:border-gray-600",
    "dark:border-gray-700",
    "dark:focus:shadow-outline-gray",
    "dark:hover:bg-gray-700",
    "dark:hover:text-gray-200",
  ],
  theme: {
    extend: {
      colors: {
        purple: colors.purple,
        // lightBlue: colors.lightBlue, // jika error lightBlue
        // coolGray: colors.coolGray,   // jika error coolGray
      },
    },
  },
  plugins: [],
};
