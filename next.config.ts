import type { NextConfig } from "next";

// Avatars and wishlist/profile photos are served from Supabase Storage
// signed URLs — allow-listing the project's own storage host (derived
// from the same env var the Supabase client already uses) lets
// next/image optimize and resize them instead of the browser
// downloading the original upload (up to 5MB) at whatever size it's
// displayed at.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/sign/**",
          },
        ]
      : [],
  },
  experimental: {
    // Server Actions default to a 1MB request body limit — well under
    // the 5MB avatar/wishlist-image/profile-image uploads this app
    // allows (see MAX_AVATAR_BYTES / MAX_IMAGE_BYTES). Any real phone
    // photo between 1-5MB was being rejected by this framework-level
    // limit before our own code ever ran, which the client UI had no
    // specific handling for (see the try/catch fixes alongside this).
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
