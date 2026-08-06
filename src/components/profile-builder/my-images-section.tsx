"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ImagePlus, Loader2, X } from "lucide-react";
import {
  deleteProfileImageAction,
  setProfileImageVisibilityAction,
  uploadProfileImageAction,
} from "@/lib/profile-images/actions";
import type { ProfileImageView } from "@/lib/profile-images/dal";
import { cn } from "@/lib/utils";

export function MyImagesSection({
  initialImages,
}: {
  initialImages: ProfileImageView[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const result = await uploadProfileImageAction(file);
      if (!result.success || !result.item) {
        setError(result.error ?? "Couldn't upload that photo. Try again.");
        return;
      }
      setImages((prev) => [...prev, result.item!]);
    } catch {
      // A thrown (rather than returned) failure — e.g. a network drop or
      // a request rejected before our own code ran — must still clear
      // the pending state, or the button gets stuck on "Uploading…" forever.
      setError("Couldn't upload that photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleVisibility(image: ProfileImageView) {
    setError(null);
    setPendingId(image.id);
    const nextIsPublic = !image.isPublic;
    setImages((prev) =>
      prev.map((item) => (item.id === image.id ? { ...item, isPublic: nextIsPublic } : item)),
    );
    const result = await setProfileImageVisibilityAction(image.id, nextIsPublic);
    setPendingId(null);
    if (!result.success) {
      setImages((prev) =>
        prev.map((item) => (item.id === image.id ? { ...item, isPublic: image.isPublic } : item)),
      );
      setError(result.error ?? "Couldn't update that photo.");
    }
  }

  async function handleDelete(image: ProfileImageView) {
    setError(null);
    setPendingId(image.id);
    const previous = images;
    setImages((prev) => prev.filter((item) => item.id !== image.id));
    const result = await deleteProfileImageAction(image.id);
    setPendingId(null);
    if (!result.success) {
      setImages(previous);
      setError(result.error ?? "Couldn't remove that photo.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-600">
        Upload photos of gifts you&apos;d love — a screenshot, a picture you
        took, whatever gives people the clearest idea. Toggle each one public
        or private just like any other section.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
          >
            {image.imageUrl && (
              <Image
                src={image.imageUrl}
                alt={`Uploaded photo, ${image.isPublic ? "public" : "private"}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <button
                type="button"
                onClick={() => handleToggleVisibility(image)}
                disabled={pendingId === image.id}
                aria-label={image.isPublic ? "Make this photo private" : "Make this photo public"}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 hover:bg-white disabled:opacity-50"
              >
                {image.isPublic ? (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(image)}
                disabled={pendingId === image.id}
                aria-label="Delete this photo"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            {!image.isPublic && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                Private
              </span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50",
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Add photo"}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
