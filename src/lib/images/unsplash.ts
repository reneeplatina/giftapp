import "server-only";

const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

export interface UnsplashPhoto {
  url: string;
  attributionName: string;
  attributionUrl: string;
  downloadLocation: string;
}

interface UnsplashSearchResponse {
  results: {
    urls: { regular: string };
    user: { name: string; links: { html: string } };
    links: { download_location: string };
  }[];
}

/**
 * Finds a representative photo for a wishlist item name via Unsplash's
 * search API. Returns null (never throws) if no key is configured, the
 * request fails, or nothing matches — auto-photo is a nice-to-have, not
 * something that should block saving a wishlist item.
 */
export async function searchUnsplashPhoto(
  query: string,
): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || !query.trim()) return null;

  try {
    const url = new URL(UNSPLASH_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "squarish");
    url.searchParams.set("content_filter", "high");

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as UnsplashSearchResponse;
    const first = data.results?.[0];
    if (!first) return null;

    return {
      url: first.urls.regular,
      attributionName: first.user.name,
      attributionUrl: first.user.links.html,
      downloadLocation: first.links.download_location,
    };
  } catch {
    return null;
  }
}

/**
 * Unsplash's API guidelines require pinging this endpoint whenever a photo
 * is put to use (not just previewed in search results), for their own
 * usage analytics. Fire-and-forget — a failure here shouldn't affect the
 * wishlist item that already saved successfully.
 */
export async function trackUnsplashDownload(downloadLocation: string): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return;

  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
  } catch {
    // Best-effort only.
  }
}
