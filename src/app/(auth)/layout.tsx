// app/(auth)/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Layout/Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 bg-gray-100 p-6">
          <div className="container mx-auto">{children}</div>
          <footer className="text-center text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} Your Company
          </footer>
        </main>
      </div>
    </SessionProvider>
  );
}
