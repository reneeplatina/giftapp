"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { useProfile } from "@/context/profile-context";
import { getSiteUrl } from "@/lib/site-url";
import {
  basicInfoSchema,
  type BasicInfoValues,
} from "@/lib/validation/profile";

export function BasicInfoSection() {
  const { profile, updateBasicInfo, uploadAvatar } = useProfile();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    values: profile.basicInfo,
  });

  async function onSubmit(values: BasicInfoValues) {
    setSaveError(null);
    const result = await updateBasicInfo({ ...profile.basicInfo, ...values });
    if (!result.success) {
      setSaveError(result.error ?? "Couldn't save. Try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    const result = await uploadAvatar(file);
    setAvatarUploading(false);
    if (!result.success) {
      setAvatarError(result.error ?? "Couldn't upload photo. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-4">
        <Avatar
          name={profile.basicInfo.displayName || "Your profile"}
          src={profile.basicInfo.avatarUrl ?? undefined}
          className="h-16 w-16 text-lg"
        />
        <div className="flex flex-col gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUploading ? "Uploading…" : "Change photo"}
          </Button>
          {avatarError && (
            <p className="text-xs text-red-600" role="alert">
              {avatarError}
            </p>
          )}
        </div>
      </div>
      <TextField
        label="Display name"
        error={errors.displayName?.message}
        {...register("displayName")}
      />
      <TextField
        label="Profile link"
        hint={`${getSiteUrl().replace(/^https?:\/\//, "")}/u/your-link`}
        error={errors.slug?.message}
        {...register("slug")}
      />
      <TextAreaField
        label="Introduction"
        hint="Shown at the top of your public profile."
        error={errors.introduction?.message}
        {...register("introduction")}
      />
      <TextAreaField
        label="My gift style"
        hint="A short line describing your taste."
        error={errors.giftStyleSummary?.message}
        {...register("giftStyleSummary")}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={!isDirty}>
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
      {saveError && (
        <p className="text-sm text-red-600" role="alert">
          {saveError}
        </p>
      )}
    </form>
  );
}
