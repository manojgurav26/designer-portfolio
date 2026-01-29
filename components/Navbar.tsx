"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSiteSettings, SiteSettings } from "../lib/settingsHelper";

const DEFAULT_SETTINGS: SiteSettings = {
  name: "Designer Name",
  tagline: "Freelance Graphic Designer",
  description: "I design clean, modern brands and digital experiences.",
  email: "designer@email.com",
  phone: "+91 9876543210",
  location: "City, Country",
  logo: "/logo.jpg",
  domain: "https://yourdomain.com",
  socials: {
    instagram: "",
    behance: "",
    linkedin: "",
    twitter: "",
  },
};

export default function Navbar() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading settings:", error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Left: Logo + Name */}
        <Link href="/" className="flex items-center gap-3 group">
          {settings.logo && (
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={settings.logo}
                alt={settings.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              {settings.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">Designer</span>
          </div>
        </Link>

        {/* Right: Navigation */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
            Home
          </Link>
          <Link href="/contact" className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full">
            Contact
          </Link>
          <Link href="/admin" className="relative px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
