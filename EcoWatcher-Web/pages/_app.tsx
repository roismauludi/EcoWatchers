import "../styles/globals.css";

import React, { FC } from "react";
import { Windmill } from "@windmill/react-ui";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider } from "../context/NotificationContext";
import { Analytics } from "@vercel/analytics/react";

function AppContent({ Component, pageProps }: AppProps) {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect;

  return (
    <Windmill usePreferences={true}>
      <Component {...pageProps} />
      <Analytics />
    </Windmill>
  );
}

function MyApp(props: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent {...props} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
