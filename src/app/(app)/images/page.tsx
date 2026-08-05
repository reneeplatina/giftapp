import { Container } from "@/components/container";
import { MyImagesSection } from "@/components/profile-builder/my-images-section";
import { requireAuthUser } from "@/lib/auth/dal";
import { getProfileImagesForEditing } from "@/lib/profile-images/dal";

export default async function ImagesPage() {
  await requireAuthUser("/images");
  const images = await getProfileImagesForEditing();

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          My images
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Upload photos of gifts you&apos;d love — a screenshot, a picture
          you took, whatever gives people the clearest idea.
        </p>
      </div>

      <MyImagesSection initialImages={images} />
    </Container>
  );
}
