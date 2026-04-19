import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/kiosk/CartContext";

export const metadata: Metadata = {
  title: "Elektro 4 Kiosk",
  description: "Selvbetjeningskiosk – brus, energidrikk, snacks",
};

export const viewport: Viewport = {
  themeColor: "#e63946",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className="h-full">
      <body className="h-full bg-gray-50">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
