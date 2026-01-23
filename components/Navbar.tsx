"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "../lib/siteConfig";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: Logo + Name */}
        <Link href="/" className="flex items-center gap-3">
          {siteConfig.logo && (
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={40}
              height={40}
              className="object-contain"
            />
          )}
          <span className="font-bold text-lg">
            {siteConfig.name}
          </span>
        </Link>

        {/* Right: Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
