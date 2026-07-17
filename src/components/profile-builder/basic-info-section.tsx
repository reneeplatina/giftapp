"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { useProfile } from "@/context/profile-context";
import {
  basicInfoSchema,
  type BasicInfoValues,
} from "@/lib/validation/profile";

export function BasicInfoSection() {
  const { profile, updateBasicInfo } = useProfile();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    values: profile.basicInfo,
  });

  function onSubmit(values: BasicInfoValues) {
    updateBasicInfo(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Display name"
        error={errors.displayName?.message}
        {...register("displayName")}
      />
      <TextField
        label="Profile link"
        hint="giftprofile.app/u/your-link"
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
    </form>
  );
}
