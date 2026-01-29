"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import SessionWarningModal from "../../components/SessionWarningModal";
import { startSessionTimeout, resetSessionTimeout } from "../../lib/sessionTimeout";

type Design = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  featured?: boolean;
  position?: number;
};

type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  logo: string;
  domain: string;
  socials: {
    instagram: string;
    behance: string;
    linkedin: string;
    twitter: string;
  };
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Admin() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [editing, setEditing] = useState<Design | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [enquiryCount, setEnquiryCount] = useState(0);

  // Session timeout state
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    location: "",
    logo: "/logo.jpg",
    domain: "",
    socials: {
      instagram: "",
      behance: "",
      linkedin: "",
      twitter: "",
    },
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Protect admin
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      // Check for admin custom claim
      const idTokenResult = await user.getIdTokenResult();
      if (!idTokenResult.claims?.admin) {
        console.warn("User does not have admin claim. Redirecting to login.");
        window.location.href = "/login";
      }
    });
  }, []);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDocs(collection(db, "settings"));
      if (!settingsDoc.empty) {
        const data = settingsDoc.docs[0].data() as SiteSettings;
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // Session timeout setup
  useEffect(() => {
    const handleSessionExpire = () => {
      logout();
    };

    const handleWarning = (timeLeft: number) => {
      setShowSessionWarning(true);
      setTimeRemaining(timeLeft);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    };

    startSessionTimeout(handleSessionExpire, handleWarning);
    fetchSettings();

    return () => {
      resetSessionTimeout();
    };
  }, []);

  // Fetch designs
  const fetchData = async () => {
    const q = query(collection(db, "designs"), orderBy("position", "asc"));
    const snap = await getDocs(q);

    const data = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Design, "id">),
    }));

    setDesigns(data);

    try {
      const enqSnap = await getDocs(collection(db, "enquiries"));
      setEnquiryCount(enqSnap.size);
    } catch (err: any) {
      console.error("Error fetching enquiries count:", err);
      if (err?.code === "permission-denied" || /permission/gi.test(err?.message || "")) {
        // If permissions prevent reading enquiries, show zero count but don't crash
        setEnquiryCount(0);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload
  const upload = async () => {
    if (!file || !title || !slug || !category || !description) {
      alert("Fill all fields");
      return;
    }

    const imageRef = ref(storage, `designs/${Date.now()}-${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);

    await addDoc(collection(db, "designs"), {
      title,
      slug,
      category,
      description,
      image: url,
      featured: false,
      position: Date.now(),
    });

    setTitle("");
    setSlug("");
    setCategory("");
    setDescription("");
    setFile(null);

    fetchData();
  };

  // Delete
  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteDoc(doc(db, "designs", id));
    fetchData();
  };

  // Save edit
  const saveEdit = async () => {
    if (!editing) return;

    await updateDoc(doc(db, "designs", editing.id), {
      title: editing.title,
      slug: editing.slug,
      category: editing.category,
      description: editing.description,
    });

    setEditing(null);
    fetchData();
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      setSettingsError(null);
      let logoUrl = settings.logo;

      // Upload new logo via API if selected
      if (logoFile) {
        try {
          const formData = new FormData();
          formData.append('logo', logoFile);
          formData.append('name', settings.name);

          const response = await fetch('/api/admin/upload-logo', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload logo');
          }

          const data = await response.json();
          logoUrl = data.logoUrl;
        } catch (err: any) {
          console.error("Error uploading logo:", err);
          setSettingsError(err.message || "Error uploading logo. See console for details.");
          setSavingSettings(false);
          return;
        }
      }

      // Update other settings in Firestore
      try {
        await setDoc(doc(db, "settings", "main"), {
          ...settings,
          logo: logoUrl,
        });
      } catch (err: any) {
        console.error("Error saving settings to Firestore:", err);
        setSettingsError(err?.message || "Error saving settings. See console for details.");
        setSavingSettings(false);
        return;
      }

      setSettings({ ...settings, logo: logoUrl });
      setLogoFile(null);
      alert("Settings updated successfully!");
      setShowSettings(false);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setSettingsError("Unexpected error saving settings. See console for details.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      resetSessionTimeout();
      setShowSessionWarning(false);
      await signOut(auth);
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  // Handle session extend
  const handleExtendSession = () => {
    setShowSessionWarning(false);
    setTimeRemaining(0);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Session Warning Modal */}
      <SessionWarningModal
        isVisible={showSessionWarning}
        timeRemaining={timeRemaining}
        onExtend={handleExtendSession}
        onLogout={logout}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/enquiries">Enquiries ({enquiryCount})</Link>
        </nav>

        <button onClick={() => setShowSettings(true)} className="mt-10 bg-blue-600 px-4 py-2 rounded w-full mb-3 hover:bg-blue-700">
          ⚙️ Settings
        </button>

        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded w-full hover:bg-red-700">
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Upload */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="font-bold mb-4">Add New Project</h2>

          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <br /><br />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(makeSlug(e.target.value));
            }}
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(makeSlug(e.target.value))}
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Project description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={upload} className="bg-black text-white px-4 py-2 rounded">
            Upload Project
          </button>
        </div>

        {/* Projects */}
        <div className="grid md:grid-cols-3 gap-6">
          {designs.map((d) => (
            <div key={d.id} className="bg-white p-4 rounded shadow">
              <Image src={d.image} alt={d.title} width={400} height={300} className="rounded mb-2" />
              <h3 className="font-bold">{d.title}</h3>
              <p className="text-sm text-gray-500">{d.slug}</p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing({ ...d })} className="bg-blue-600 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => remove(d.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-3">Edit Project</h2>

            <input
              className="border p-2 w-full mb-2"
              value={editing.title}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value,
                  slug: makeSlug(e.target.value),
                })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editing.slug}
              onChange={(e) =>
                setEditing({ ...editing, slug: makeSlug(e.target.value) })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editing.category}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
            />

            <textarea
              className="border p-2 w-full mb-3"
              rows={4}
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={saveEdit} className="bg-black text-white px-4 py-1 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded w-full max-w-2xl mx-4 shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sticky top-0 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Site Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-2xl hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-8">
              {/* Logo Upload */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-3">Logo</label>
                {settings.logo && (
                  <div className="mb-4">
                    <Image src={settings.logo} alt="Current Logo" width={120} height={120} className="rounded border border-gray-200" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="border border-gray-300 p-3 w-full rounded bg-gray-50"
                />
                {logoFile && <p className="text-sm text-green-600 mt-2">✓ New logo selected: {logoFile.name}</p>}
                {settingsError && (
                  <div className="mt-3 p-3 rounded bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                    <strong className="font-semibold">{settingsError}</strong>
                    <div>If this is unexpected, check Firebase Storage & Firestore rules and that you're signed in as an admin.</div>
                  </div>
                )}
              </div>

              {/* Designer Name */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2">Designer Name *</label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              {/* Tagline */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2">Tagline/Title *</label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g., Freelance Graphic Designer"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Tell about yourself..."
                />
              </div>

              {/* Contact Info Section */}
              <div className="bg-gray-50 p-4 rounded mb-5 border border-gray-200">
                <h3 className="font-semibold text-lg mb-4">Contact Information</h3>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Phone *</label>
                  <input
                    type="tel"
                    className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Location */}
                <div className="mb-0">
                  <label className="block text-sm font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Domain */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2">Website Domain</label>
                <input
                  type="url"
                  className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.domain}
                  onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                  placeholder="https://yourdomain.com"
                />
              </div>

              {/* Social Links Section */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-semibold text-lg mb-4">Social Media Links</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Instagram</label>
                  <input
                    type="url"
                    className="border border-gray-300 p-3 w-full rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socials.instagram}
                    onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, instagram: e.target.value } })}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">LinkedIn</label>
                  <input
                    type="url"
                    className="border border-gray-300 p-3 w-full rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socials.linkedin}
                    onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, linkedin: e.target.value } })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Behance</label>
                  <input
                    type="url"
                    className="border border-gray-300 p-3 w-full rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socials.behance}
                    onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, behance: e.target.value } })}
                    placeholder="https://behance.net/yourprofile"
                  />
                </div>

                <div className="mb-0">
                  <label className="block text-sm font-semibold mb-2">Twitter/X</label>
                  <input
                    type="url"
                    className="border border-gray-300 p-3 w-full rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.socials.twitter}
                    onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, twitter: e.target.value } })}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-6 flex justify-end gap-3 border-t sticky bottom-0">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-100 font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:opacity-90 disabled:opacity-50 font-semibold transition"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
