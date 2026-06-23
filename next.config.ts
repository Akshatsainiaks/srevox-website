import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    VITE_EMAILJS_SERVICE_ID: process.env.VITE_EMAILJS_SERVICE_ID || "",
    VITE_EMAILJS_TEMPLATE_ID: process.env.VITE_EMAILJS_TEMPLATE_ID || "",
    VITE_EMAILJS_PUBLIC_KEY: process.env.VITE_EMAILJS_PUBLIC_KEY || "",
  },
};

export default nextConfig;
