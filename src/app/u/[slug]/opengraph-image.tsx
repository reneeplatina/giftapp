import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/lib/profile/public-dal";

export const alt = "GIFT ME! — a Gift Profile share card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await getPublicProfileBySlug(slug);
  const displayName = loaded?.profile.basicInfo.displayName || "Someone";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f1e6",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            borderRadius: "9999px",
            backgroundColor: "#1c1917",
            marginBottom: 48,
          }}
        >
          {/* Present icon — plain vector shapes, not an emoji glyph, so it renders reliably */}
          <svg width={120} height={120} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="8" width="18" height="4" rx="1" fill="#f7f1e6" />
            <rect x="4" y="12" width="16" height="9" rx="1" fill="#f7f1e6" />
            <rect x="11" y="8" width="2" height="13" fill="#1c1917" />
            <path
              d="M7.5 8a2.5 2.5 0 0 1 0-5c2 0 4.5 2.5 4.5 5"
              stroke="#f7f1e6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 8a2.5 2.5 0 0 0 0-5c-2 0-4.5 2.5-4.5 5"
              stroke="#f7f1e6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#1c1917",
            letterSpacing: -2,
          }}
        >
          GIFT ME!
        </div>
        <div
          style={{
            fontSize: 42,
            color: "#57534e",
            marginTop: 20,
          }}
        >
          {`${displayName}'s Gift Profile`}
        </div>
      </div>
    ),
    { ...size },
  );
}
