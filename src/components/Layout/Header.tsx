"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Button from "@/components/ui/button";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Annotate", href: "/annotate" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const bgGradient = "bg-gradient-to-r from-blue-600 to-slate-600";

  return (
    <header className={`sticky top-0 z-50 shadow-lg mb-4 ${bgGradient}`}>
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-white">AnnotatE</span>
          <span className="inline-block bg-white text-indigo-600 text-xs font-bold uppercase px-2 py-1 rounded-full">
            Pro
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8">
          {NAV_LINKS.map(({ name, href }) => (
            <Link key={name} href={href} className="text-white hover:underline">
              {name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button className="hidden md:inline-flex">Upgrade</Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden text-white"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className={`${bgGradient} md:hidden`}>
          <ul className="flex flex-col space-y-2 py-4 px-6">
            {NAV_LINKS.map(({ name, href }) => (
              <li key={name}>
                <Link href={href} className="block text-white hover:underline">
                  {name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/upgrade" className="block text-white font-semibold">
                Upgrade
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
