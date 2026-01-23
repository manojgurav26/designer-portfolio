"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

type Props = {
  project?: string;
  source: "contact" | "project";
};

export default function EnquiryForm({ project, source }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Simple validators
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) =>
    /^[6-9]\d{9}$/.test(phone); // Indian mobile validation (10 digits)

  const submit = async () => {
    setError("");

    if (!name || !email || !phone || !message) {
      setError("All fields are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "enquiries"), {
        name,
        email,
        phone,
        message,
        project: project || null,
        source,
        createdAt: new Date(),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">
        {project ? `Enquire about "${project}"` : "Contact Us"}
      </h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          Thank you! Your enquiry has been sent.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <input
        className="w-full p-3 rounded border"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-3 rounded border"
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-3 rounded border"
        placeholder="Mobile number (10 digits)"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        maxLength={10}
      />

      <textarea
        className="w-full p-3 rounded border"
        rows={4}
        placeholder={
          project
            ? `Hi, I'm interested in something like "${project}"`
            : "Tell me about your project..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </button>
    </div>
  );
}
