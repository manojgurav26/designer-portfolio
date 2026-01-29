import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export type SiteSettings = {
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settingsCollection = collection(db, "settings");
    const snapshot = await getDocs(settingsCollection);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as SiteSettings;
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
}
