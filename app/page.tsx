"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { siteConfig } from "../lib/siteConfig";

type Design = {
  title: string;
  slug: string;
  category: string;
  image: string;
  featured?: boolean;
};

export default function HomePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  // Fetch designs
  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "designs"), orderBy("position", "asc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => d.data() as Design);

      // Sort featured first
      const sorted = data.sort(
        (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)
      );

      setDesigns(sorted);
      setLoading(false);
    };

    fetchData();
  }, []);

  const categories = ["All", ...new Set(designs.map((d) => d.category))];

  const filtered =
    filter === "All"
      ? designs
      : designs.filter((d) => d.category === filter);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">

      

      {/* Hero */}
      <div className="text-center mb-12">
  <h1 className="text-4xl font-bold mb-2">
    {siteConfig.tagline}
  </h1>
  <p className="text-gray-500">
    {siteConfig.description}
  </p>
</div>


      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full border backdrop-blur transition
              ${
                filter === cat
                  ? "bg-black text-white"
                  : "bg-white/60 hover:bg-black hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">

        {/* Skeleton */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl overflow-hidden bg-white border"
            >
              <div className="h-64 bg-gray-200 animate-pulse" />
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
              className="break-inside-avoid rounded-2xl overflow-hidden bg-white/60 backdrop-blur border shadow hover:shadow-xl transition cursor-pointer relative group"
            >
              {/* Featured badge */}
              {item.featured && (
                <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-semibold z-10">
                  Featured
                </span>
              )}

              {/* Image */}
              <Image
                src={item.image}
                alt={item.title}
                width={600}
                height={400}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Text */}
              <div className="p-4">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.location}
      </footer>
    </main>
  );
}
