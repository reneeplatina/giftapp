"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useProfile } from "@/context/profile-context";
import { sizesSchema, type SizesValues } from "@/lib/validation/profile";

export function SizesSection() {
  const { profile, updateSizes } = useProfile();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SizesValues>({
    resolver: zodResolver(sizesSchema),
    values: profile.sizes,
  });

  async function onSubmit(values: SizesValues) {
    setSaveError(null);
    const result = await updateSizes(values);
    if (!result.success) {
      setSaveError(result.error ?? "Couldn't save. Try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Shirt" {...register("shirt")} />
        <TextField label="Pants" {...register("pants")} />
        <TextField label="Shoe" {...register("shoe")} />
        <TextField label="Dress" {...register("dress")} />
        <TextField label="Ring size" {...register("ringSize")} />
      </div>
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
