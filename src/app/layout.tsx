import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeerRadar – Finn billigste øl",
  description: "Kart over barer og utesteder med billigst øl i nærheten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
