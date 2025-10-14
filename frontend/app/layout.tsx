import type { Metadata } from "next";
import "./globals.css";
import { ACTIVE_THEME } from "@/config/theme";
import { DatabaseProvider } from "@/components/DatabaseProvider";
import { AuthProvider } from "@/contexts/AuthContext";

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
    <html lang="en" data-theme={ACTIVE_THEME} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <DatabaseProvider>
            {children}
          </DatabaseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
