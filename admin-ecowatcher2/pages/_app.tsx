import "../styles/globals.css";
import "tailwindcss/tailwind.css";

import React, { FC } from "react";
import { Windmill } from "@roketid/windmill-react-ui";
import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

function MyApp({ Component, pageProps }: AppProps) {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect;

  const { user } = useAuth();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Windmill usePreferences={true}>
          <Component {...pageProps} />
        </Windmill>
        <div>{user ? `Logged in as ${user.email}` : ""}</div>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default MyApp;
