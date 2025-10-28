import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Quicksand, Comfortaa } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// ✨ Fuentes para el logo
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Dubsar AI",
  description: "Chatbot inteligente creado por Marko Teixido",
  icons: {
    icon: [
      { url: '/dubsar-icon.png', type: 'image/png', sizes: '512x512' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} ${comfortaa.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}