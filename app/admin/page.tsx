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
} from "firebase/firestore";
import { db, auth, storage } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import Link from "next/link";

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

  // Protect admin
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) window.location.href = "/login";
    });
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

    const enqSnap = await getDocs(collection(db, "enquiries"));
    setEnquiryCount(enqSnap.size);
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

  // Logout
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/enquiries">Enquiries ({enquiryCount})</Link>
        </nav>

        <button onClick={logout} className="mt-10 bg-red-600 px-4 py-2 rounded w-full">
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
    </div>
  );
}
