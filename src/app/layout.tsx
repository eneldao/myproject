import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Import custom fonts
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Define custom fonts
const geist = localFont({
  src: "../public/fonts/Geist.woff2",
  variable: "--font-geist",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trans-Easy - Professional Translation Services",
  description:
    "Professional translation, voice-over, dubbing, and transcription services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geist.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
