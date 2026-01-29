"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Image from "next/image";
import EnquiryForm from "../../../components/EnquiryForm";
import { getSiteSettings, SiteSettings } from "../../../lib/settingsHelper";

type Project = {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
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

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "designs"),
          where("slug", "==", slug)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setProject(snap.docs[0].data() as Project);
        }

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
  }, [slug]);

  if (loading) return <div className="p-10 text-center">Loading project...</div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">

      {/* Project header */}
      <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        by {settings.name} · {project.category}
      </p>

      {/* Image */}
      <Image
        src={project.image}
        alt={project.title}
        width={1100}
        height={800}
        className="rounded-xl mb-8"
      />

      {/* Description */}
      <p className="text-gray-700 mb-10 leading-relaxed">
        {project.description}
      </p>

      {/* Enquiry form */}
      <EnquiryForm project={project.title} source="project" />

      {/* Footer branding */}
      <div className="mt-12 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} {settings.name} · {settings.location}
      </div>

    </main>
  );
}
