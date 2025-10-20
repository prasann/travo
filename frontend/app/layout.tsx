import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_THEME } from "@/config/theme";
import { DatabaseProvider } from "@/components/DatabaseProvider";
import { SyncProvider } from "@/components/SyncProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RefineProvider } from "@/lib/refine/RefineProvider";

export const metadata: Metadata = {
  title: "Travo - Trip Planner",
  description: "Simple and elegant trip planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
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
