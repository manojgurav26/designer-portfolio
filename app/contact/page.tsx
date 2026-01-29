"use client";

import { useEffect, useState } from "react";
import EnquiryForm from "../../components/EnquiryForm";
import { getSiteSettings, SiteSettings } from "../../lib/settingsHelper";

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

export default function ContactPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-2">
        Contact {settings.name}
      </h1>

      <p className="text-gray-600 mb-6">
        Have a project in mind? Fill the form below or reach out directly.
      </p>

      <div className="mb-8 space-y-1 text-gray-700">
        <p>📧 {settings.email}</p>
        <p>📞 {settings.phone}</p>
        <p>📍 {settings.location}</p>
      </div>

      <EnquiryForm source="contact" />

      {/* Social links */}
      <div className="mt-10 text-sm text-gray-500 space-x-4">
        {settings.socials.instagram && (
          <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        )}
        {settings.socials.behance && (
          <a href={settings.socials.behance} target="_blank" rel="noopener noreferrer">Behance</a>
        )}
        {settings.socials.linkedin && (
          <a href={settings.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        )}
      </div>

    </main>
  );
}
