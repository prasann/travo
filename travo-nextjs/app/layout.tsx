import type { Metadata } from "next";
import "./globals.css";

const theme = process.env.NEXT_PUBLIC_THEME || 'default'

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
    <html lang="en" data-theme={theme}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
