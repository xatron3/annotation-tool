"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import Button from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Images", href: "/upload-images" },
  { name: "Annotate", href: "/annotate" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bgGradient = "bg-gradient-to-b from-blue-600 to-slate-600";

  const pathname = usePathname();

  // whenever the URL path changes, close the menu
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

      {/* Profile menu in footer */}
      <div className="mt-auto px-6 py-4">
        {session ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center w-full focus:outline-none"
            >
              <img
                src={session.user?.image || "/default-avatar.png"}
                alt="User avatar"
                className="w-9 h-9 rounded-full border-2 border-white"
              />
              <div className="ml-3 text-left flex-1">
                <p className="text-sm font-medium">{session.user?.name}</p>
              </div>
              <ChevronDown size={20} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-white text-gray-800 rounded-lg shadow-lg py-2">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/profile/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button onClick={() => signIn()}>Sign In</Button>
        )}
      </div>
    </aside>
  );
}
