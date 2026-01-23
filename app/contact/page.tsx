import EnquiryForm from "../../components/EnquiryForm";
import { siteConfig } from "../../lib/siteConfig";

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-2">
        Contact {siteConfig.name}
      </h1>

      <p className="text-gray-600 mb-6">
        Have a project in mind? Fill the form below or reach out directly.
      </p>

      <div className="mb-8 space-y-1 text-gray-700">
        <p>📧 {siteConfig.email}</p>
        <p>📞 {siteConfig.phone}</p>
        <p>📍 {siteConfig.location}</p>
      </div>

      <EnquiryForm source="contact" />

      {/* Social links */}
      <div className="mt-10 text-sm text-gray-500 space-x-4">
        {siteConfig.socials.instagram && (
          <a href={siteConfig.socials.instagram} target="_blank">Instagram</a>
        )}
        {siteConfig.socials.behance && (
          <a href={siteConfig.socials.behance} target="_blank">Behance</a>
        )}
        {siteConfig.socials.linkedin && (
          <a href={siteConfig.socials.linkedin} target="_blank">LinkedIn</a>
        )}
      </div>

    </main>
  );
}
