import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_THEME } from "@/config/theme";
import { DatabaseProvider } from "@/components/DatabaseProvider";
import { SyncProvider } from "@/components/SyncProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RefineProvider } from "@/lib/refine/RefineProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Travo - Trip Planner",
  description: "Simple and elegant trip planning",
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d232a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <AuthProvider>
          <DatabaseProvider>
            <RefineProvider>
              <SyncProvider>
                {children}
              </SyncProvider>
            </RefineProvider>
          </DatabaseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
