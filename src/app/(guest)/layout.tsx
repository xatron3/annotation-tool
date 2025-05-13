// app/(guest)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome - My App",
  description: "Please sign in to continue",
};

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {children}
      <footer className="mt-auto py-4 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Your Company
      </footer>
    </div>
  );
}
