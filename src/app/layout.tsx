import type { Metadata } from "next";
<<<<<<< HEAD
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
=======
import { Inter } from "next/font/google";
>>>>>>> new-safe-branch
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

<<<<<<< HEAD
// GeistSans and GeistMono are already configured with variables
=======
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
>>>>>>> new-safe-branch

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
<<<<<<< HEAD
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
=======
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
>>>>>>> new-safe-branch
      </body>
    </html>
  );
}
