"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Button from "@/components/ui/button";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Images", href: "/upload-images" },
  { name: "Annotate", href: "/annotate" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const bgGradient = "bg-gradient-to-b from-blue-600 to-slate-600";

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 z-50 ${bgGradient} text-white`}
    >
      {/* Logo + mobile toggle */}
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold">AnnotatE</span>
          <span className="inline-block bg-white text-indigo-600 text-xs font-bold uppercase px-2 py-1 rounded-full">
            Pro
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="md:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex flex-col flex-grow px-6 space-y-4">
        {NAV_LINKS.map(({ name, href }) => (
          <Link key={name} href={href} className="hover:underline">
            {name}
          </Link>
        ))}
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden px-6 pb-4 space-y-2">
          {NAV_LINKS.map(({ name, href }) => (
            <Link key={name} href={href} className="block hover:underline">
              {name}
            </Link>
          ))}
          <Link href="/upgrade" className="block font-semibold">
            Upgrade
          </Link>
        </nav>
      )}
    </aside>
  );
}
