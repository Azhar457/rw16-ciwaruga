"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Desa" },
  { href: "/infografis", label: "Infografis" },
  { href: "/berita", label: "Berita" },
  { href: "/loker", label: "Lowongan" },
  { href: "/umkm", label: "UMKM" },
  { href: "/warga/verify", label: "Cek Data" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className={`${poppins.className} bg-gradient-to-r from-emerald-600 to-emerald-300 shadow-lg sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-12 h-12"
            />
            <span className="text-xl font-bold text-white">RW16 Ciwaruga</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-white border-2 border-white"
                    : "text-white hover:text-emerald-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="bg-transparent border-2 border-white  text-white px-4 py-2 rounded-lg hover:bg-white ml-2 hover:text-emerald-500"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#2A9D8F] focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-transparant">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-bold no-underline transition-colors ${
                    pathname === item.href
                      ? "text-white border-2 border-white"
                      : "text-white hover:text-emerald-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                className=" text-center block px-3 py-2 bg-transparent border-2 border-white  text-white px-4 py-2 rounded-lg hover:bg-white ml-2 hover:text-emerald-500 rounded-lg mt-2"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

