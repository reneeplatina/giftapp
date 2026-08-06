"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Smile } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { EmojiAvatarPicker } from "@/components/profile-builder/emoji-avatar-picker";
import { useProfile } from "@/context/profile-context";
import { getSiteUrl } from "@/lib/site-url";
import { DAY_OPTIONS, MONTH_OPTIONS, combineBirthday, splitBirthday } from "@/lib/birthday";
import {
  basicInfoSchema,
  type BasicInfoValues,
} from "@/lib/validation/profile";

export function BasicInfoSection() {
  const { profile, theme, updateBasicInfo, uploadAvatar, setAvatarEmoji } = useProfile();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    values: { ...profile.basicInfo, ...splitBirthday(profile.basicInfo.birthday) },
  });

  async function onSubmit(values: BasicInfoValues) {
    setSaveError(null);
    const result = await updateBasicInfo({
      ...profile.basicInfo,
      displayName: values.displayName,
      slug: values.slug,
      introduction: values.introduction,
      giftStyleSummary: values.giftStyleSummary,
      birthday: combineBirthday(values.birthMonth, values.birthDay),
    });
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
    try {
      const result = await uploadAvatar(file);
      if (!result.success) {
        setAvatarError(result.error ?? "Couldn't upload photo. Try again.");
      }
    } catch {
      // A thrown (rather than returned) failure — e.g. a network drop or
      // a request rejected before our own code ran — must still clear
      // the pending state, or the button gets stuck on "Uploading…" forever.
      setAvatarError("Couldn't upload photo. Try again.");
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-4">
        <Avatar
          name={profile.basicInfo.displayName || "Your profile"}
          src={profile.basicInfo.avatarUrl ?? undefined}
          emoji={profile.basicInfo.avatarEmoji ?? undefined}
          emojiBg={profile.basicInfo.avatarEmojiBg ?? undefined}
          theme={theme}
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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUploading ? "Uploading…" : "Change photo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEmojiPickerOpen(true)}
            >
              <Smile className="h-4 w-4" aria-hidden="true" />
              Choose emoji
            </Button>
          </div>
          {avatarError && (
            <p className="text-xs text-red-600" role="alert">
              {avatarError}
            </p>
          )}
        </div>
      </div>
      <EmojiAvatarPicker
        open={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        initialColor={profile.basicInfo.avatarEmojiBg}
        onSelect={async (emoji, color) => {
          const result = await setAvatarEmoji(emoji, color);
          if (!result.success) {
            setAvatarError(result.error ?? "Couldn't set that avatar. Try again.");
          }
        }}
      />
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
      <div className="flex gap-3">
        <div className="flex-1">
          <SelectField
            label="Birth month"
            options={[{ value: "", label: "Month" }, ...MONTH_OPTIONS]}
            error={errors.birthMonth?.message}
            {...register("birthMonth")}
          />
        </div>
        <div className="flex-1">
          <SelectField
            label="Birth day"
            options={[{ value: "", label: "Day" }, ...DAY_OPTIONS]}
            error={errors.birthDay?.message}
            {...register("birthDay")}
          />
        </div>
      </div>
      {!errors.birthMonth && !errors.birthDay && (
        <p className="-mt-2 text-xs text-neutral-500">
          Shown on your public profile so people know when to send a gift —
          only the month and day, never the year.
        </p>
      )}
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
