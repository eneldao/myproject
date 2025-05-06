import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";

// GeistSans and GeistMono are already configured with variables

export const metadata: Metadata = {
  title: "Trans-Easy - Professional Translation Services",
  description: "Connect with professional translators for your business needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProjectProvider>{children}</ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
