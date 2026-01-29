"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  project?: string;
  source: string;
  createdAt: any;
  seen?: boolean;
};

export default function Enquiries() {
  const [data, setData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setData(snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Enquiry, "id">),
        })));
        setCurrentPage(1); // Reset to first page when data loads
      } catch (err: any) {
        console.error("Error fetching enquiries:", err);
        if (err?.code === "permission-denied" || /permission/gi.test(err?.message || "")) {
          setError("Permission denied: your account does not have access to read enquiries. Check Firestore rules or ensure you're signed in as an admin.");
        } else {
          setError("Error fetching enquiries. See console for details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Toggle seen status
  const toggleSeen = async (id: string, currentSeen: boolean) => {
    try {
      await updateDoc(doc(db, "enquiries", id), {
        seen: !currentSeen,
      });

      // Update local state
      setData(data.map((item) =>
        item.id === id ? { ...item, seen: !currentSeen } : item
      ));
    } catch (error) {
      console.error("Error updating enquiry:", error);
      const err: any = error;
      if (err?.code === "permission-denied" || /permission/gi.test(err?.message || "")) {
        setError("Permission denied: you cannot update enquiry status. Check Firestore rules or sign in with an admin account.");
      } else {
        setError("Error updating enquiry. See console for details.");
      }
    }
  };

  const unseenCount = data.filter((e) => !e.seen).length;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link href="/admin" className="text-blue-600 hover:underline font-semibold mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Enquiries</h1>
            <p className="text-gray-600">Total: {data.length} enquiries received</p>
          </div>
          {unseenCount > 0 && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
              🔴 {unseenCount} Unseen
            </div>
          )}
        </div>
      </div>

      {/* Error banner for permission issues or other fetch/update errors */}
      {error && (
        <div className="mb-6 p-4 rounded bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <strong className="font-semibold">{error}</strong>
          <div className="mt-2 text-sm">
            If you expect to have access, ensure you're signed in as an admin, or update your Firestore rules to allow the required reads/updates from the admin client.
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No enquiries yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedData.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 ${
                e.seen
                  ? "bg-white border-l-gray-400"
                  : "bg-blue-50 border-l-red-500 ring-1 ring-red-200"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-xl font-bold ${e.seen ? "text-gray-900" : "text-red-900 font-bold"}`}>
                      {e.name}
                    </h2>
                    {!e.seen && (
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Unseen"></span>
                    )}
                  </div>
                  <div className="flex gap-4 flex-wrap mt-2 text-sm">
                    <a href={`mailto:${e.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      📧 {e.email}
                    </a>
                    <a href={`tel:${e.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      📱 {e.phone}
                    </a>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {e.project && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      Project: {e.project}
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    {e.createdAt?.toDate?.().toLocaleDateString?.() || new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-100 p-4 rounded mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{e.message}</p>
              </div>

              {/* Footer with source and action button */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  Source: <span className="capitalize font-semibold">{e.source}</span>
                </span>
                <button
                  onClick={() => toggleSeen(e.id, e.seen || false)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    e.seen
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  }`}
                >
                  {e.seen ? "✓ Mark as Unseen" : "◯ Mark as Seen"}
                </button>
              </div>
            </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors font-semibold"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors font-semibold"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
