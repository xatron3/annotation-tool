"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Layout/Sidebar";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <main className="flex flex-col flex-1 bg-gray-100 p-6">
              {/* Content grows to fill available space */}
              <div className="flex-1 container mx-auto px-2 md:px-0">
                {children}
              </div>

              {/* Footer sticks to bottom when content is short */}
              <footer className="text-center text-gray-500">
                &copy; {new Date().getFullYear()} Your Company Name
              </footer>
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
