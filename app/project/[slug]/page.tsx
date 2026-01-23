"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Image from "next/image";
import EnquiryForm from "../../../components/EnquiryForm";
import { siteConfig } from "../../../lib/siteConfig";

type Project = {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
};

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      const q = query(
        collection(db, "designs"),
        where("slug", "==", slug)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setProject(snap.docs[0].data() as Project);
      }

      setLoading(false);
    };

    fetchProject();
  }, [slug]);

  if (loading) return <div className="p-10 text-center">Loading project...</div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">

      {/* Project header */}
      <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        by {siteConfig.name} · {project.category}
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
        © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.location}
      </div>

    </main>
  );
}
