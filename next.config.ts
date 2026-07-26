import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
