"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSiteSettings, SiteSettings } from "../lib/settingsHelper";

type Design = {
  title: string;
  slug: string;
  category: string;
  image: string;
  featured?: boolean;
};

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

export default function HomePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  // Fetch designs and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "designs"), orderBy("position", "asc"));
        const snap = await getDocs(q);

        const data = snap.docs.map((d) => d.data() as Design);

        // Sort featured first
        const sorted = data.sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)
        );

        setDesigns(sorted);

        // Fetch settings
        const siteSettings = await getSiteSettings();
        setSettings(siteSettings);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ["All", ...new Set(designs.map((d) => d.category))];

  const filtered =
    filter === "All"
      ? designs
      : designs.filter((d) => d.category === filter);

  return (
    <main className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-7000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-3000"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Subtitle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-block px-4 py-2 rounded-full bg-white/10 text-blue-300 text-sm font-semibold mb-6 border border-white/20">
              ✨ Welcome to my portfolio
            </p>
          </motion.div>

          {/* Main heading */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 text-white leading-tight">
              {settings.tagline}
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <p className="text-lg sm:text-xl text-gray-300 mb-4 leading-relaxed max-w-2xl mx-auto">
              {settings.description}
            </p>
            <p className="text-sm text-gray-400">Based in {settings.location}</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex gap-4 justify-center flex-wrap mt-10">
            <button onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })} className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center gap-2">
              View My Work
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <Link href="/contact" className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-bold rounded-lg transition-all duration-300 backdrop-blur-sm">
              Get in Touch
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "100+", label: "Projects Completed" },
              { number: "50+", label: "Happy Clients" },
              { number: "5+", label: "Years Experience" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Expertise Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-16"
          >
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">About My Work</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                I specialize in creating beautiful, functional designs that not only look great but also drive results. Every project is approached with creativity, precision, and a focus on your unique needs.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From concept to completion, I work closely with clients to ensure their vision comes to life in the most impactful way possible.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎨", title: "Creative Design" },
                { icon: "📱", title: "UI/UX Design" },
                { icon: "✨", title: "Brand Identity" },
                { icon: "🚀", title: "Digital Solutions" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="work" className="max-w-6xl mx-auto px-6 py-20">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Featured Work</h2>
          <p className="text-lg text-gray-600">Explore some of my recent projects and see how I bring ideas to life</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  filter === cat
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-8 space-y-8 mb-16">

          {/* Skeleton */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              </div>
            ))}

          {/* Designs */}
          {!loading &&
            filtered.map((item) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push(`/project/${item.slug}`)}
                className="break-inside-avoid rounded-xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                {/* Featured badge */}
                {item.featured && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-4 py-2 rounded-full font-bold z-10 shadow-lg">
                    ⭐ Featured
                  </motion.span>
                )}

                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button className="w-full py-2 bg-white text-gray-900 font-semibold rounded-lg text-sm hover:bg-gray-100 transition">
                      View Project →
                    </button>
                  </div>
                </div>

                {/* Text */}
                <div className="p-5">
                  <h2 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h2>
                  <p className="text-sm text-gray-500 font-medium">{item.category}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center shadow-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Ready to work together?</h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">Let's collaborate to create something extraordinary. Reach out and let's discuss your project.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105">
              Start a Project
            </Link>
            <a href={`mailto:${settings.email}`} className="inline-block px-8 py-4 border-2 border-white text-white hover:bg-white/20 font-bold rounded-lg transition-all duration-300">
              Send Email
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 text-center text-gray-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Location</h3>
              <p>{settings.location}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
              <a href={`mailto:${settings.email}`} className="hover:text-blue-600 transition">{settings.email}</a><br />
              <a href={`tel:${settings.phone}`} className="hover:text-blue-600 transition">{settings.phone}</a>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Follow</h3>
              <div className="flex justify-center gap-4">
                {settings.socials.instagram && <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Instagram</a>}
                {settings.socials.linkedin && <a href={settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">LinkedIn</a>}
              </div>
            </div>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} {settings.name} · All rights reserved</p>
        </div>
      </footer>
    </main>
  );
}
