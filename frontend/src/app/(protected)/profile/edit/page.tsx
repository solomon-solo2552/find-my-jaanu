"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { InterestPicker } from "@/components/profile/InterestPicker";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { profilesApi, Profile, Interest, Photo } from "@/lib/profiles";
import { notify, errorMessage } from "@/lib/toast";

const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "NB", label: "Non-binary" },
  { value: "P", label: "Prefer not to say" },
];

const editSchema = z.object({
  display_name: z.string().min(2).max(50),
  bio: z.string().max(500).optional().default(""),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["M", "F", "NB", "P"]),
  interested_in: z.enum(["M", "F", "NB", "P"]),
  city: z.string().max(100).optional().default(""),
  country: z.string().max(100).optional().default(""),
  is_visible: z.boolean().default(true),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditProfilePage() {
  return (
    <RequireAuth>
      <EditProfile />
    </RequireAuth>
  );
}

function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    (async () => {
      try {
        const [interestList, profile] = await Promise.all([
          profilesApi.listInterests(),
          profilesApi.getMyProfile(),
        ]);
        setInterests(interestList);
        if (!profile) {
          router.replace("/onboarding");
          return;
        }
        form.reset({
          display_name: profile.display_name,
          bio: profile.bio,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          interested_in: profile.interested_in,
          city: profile.city,
          country: profile.country,
          is_visible: profile.is_visible,
        });
        setSelectedInterestIds(profile.interests.map((i) => i.id));
        setPhotos(profile.photos);
      } catch {
        setServerError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: EditForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await profilesApi.updateMyProfile({
        ...data,
        interest_ids: selectedInterestIds,
      });
      notify.success("Profile updated!");
      router.push("/profile");
    } catch (err: any) {
      notify.error(errorMessage(err, "Failed to save."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-pink-600 mb-6">Edit Profile</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Photos section */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Photos</h2>
            <PhotoUploader photos={photos} onChange={setPhotos} />
          </div>

          <hr className="border-gray-100" />

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Display name"
              error={form.formState.errors.display_name?.message}
              {...form.register("display_name")}
            />
            <Textarea
              label="Bio"
              rows={4}
              error={form.formState.errors.bio?.message}
              {...form.register("bio")}
            />
            <Input
              label="Date of birth"
              type="date"
              error={form.formState.errors.date_of_birth?.message}
              {...form.register("date_of_birth")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select label="I am" options={GENDER_OPTIONS} {...form.register("gender")} />
              <Select
                label="Interested in"
                options={GENDER_OPTIONS}
                {...form.register("interested_in")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" {...form.register("city")} />
              <Input label="Country" {...form.register("country")} />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...form.register("is_visible")} />
              Show my profile in discovery
            </label>

            <hr className="border-gray-100" />

            <InterestPicker
              interests={interests}
              selectedIds={selectedInterestIds}
              onChange={setSelectedInterestIds}
            />

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}