"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

type Enquiry = {
  name: string;
  email: string;
  message: string;
};

export default function Enquiries() {
  const [data, setData] = useState<Enquiry[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "enquiries"));
      setData(snap.docs.map((d) => d.data() as Enquiry));
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="text-blue-600 underline">
        ← Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Enquiries</h1>

      <div className="space-y-4">
        {data.map((e, i) => (
          <div key={i} className="bg-white p-4 rounded shadow">
            <h2 className="font-bold">{e.name}</h2>
            <p className="text-sm text-gray-500">{e.email}</p>
            <p className="mt-2">{e.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
