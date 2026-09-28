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

const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "NB", label: "Non-binary" },
  { value: "P", label: "Prefer not to say" },
];

// ---------- Schemas ----------
const step1Schema = z.object({
  display_name: z.string().min(2, "At least 2 characters").max(50),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gender: z.enum(["M", "F", "NB", "P"]),
  interested_in: z.enum(["M", "F", "NB", "P"]),
});

const step2Schema = z.object({
  bio: z.string().max(500).optional().default(""),
  city: z.string().max(100).optional().default(""),
  country: z.string().max(100).optional().default(""),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingFlow />
    </RequireAuth>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ---------- On mount: load interests + check existing profile ----------
  useEffect(() => {
    (async () => {
      try {
        const [interestList, existing] = await Promise.all([
          profilesApi.listInterests(),
          profilesApi.getMyProfile(),
        ]);
        setInterests(interestList);
        if (existing) {
          setProfile(existing);
          setSelectedInterestIds(existing.interests.map((i) => i.id));
          setPhotos(existing.photos);
          // Profile exists → user probably wants to edit, not onboard
          router.replace("/profile");
        }
      } catch (err) {
        setServerError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const step1Form = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: { gender: "M", interested_in: "F" },
  });

  const step2Form = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { bio: "", city: "", country: "" },
  });

  // ---------- Step handlers ----------
  const handleStep1Submit = async (data: Step1) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const created = await profilesApi.createMyProfile(data);
      setProfile(created);
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat()[0]
        : "Failed to create profile.";
      setServerError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = async (data: Step2) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const updated = await profilesApi.updateMyProfile(data);
      setProfile(updated);
      setStep(3);
    } catch {
      setServerError("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep3Submit = async () => {
    if (selectedInterestIds.length < 3) {
      setServerError("Pick at least 3 interests.");
      return;
    }
    setServerError(null);
    setSubmitting(true);
    try {
      const updated = await profilesApi.updateMyProfile({
        interest_ids: selectedInterestIds,
      });
      setProfile(updated);
      setStep(4);
    } catch {
      setServerError("Failed to save interests.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (photos.length === 0) {
      setServerError("Add at least one photo to continue.");
      return;
    }
    router.push("/discover");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <main className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex-1 h-1.5 rounded-full ${
                n <= step ? "bg-pink-600" : "bg-pink-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-pink-600 mb-1">
            {step === 1 && "Let's get started"}
            {step === 2 && "Tell us about you"}
            {step === 3 && "What are you into?"}
            {step === 4 && "Add your photos"}
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            {step === 1 && "Basic info helps us find you better matches."}
            {step === 2 && "A short bio makes a big difference."}
            {step === 3 && "Pick at least 3 interests."}
            {step === 4 && "Profiles with photos get 10x more matches."}
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
              <Input
                label="Display name"
                placeholder="e.g., Sam"
                error={step1Form.formState.errors.display_name?.message}
                {...step1Form.register("display_name")}
              />
              <Input
                label="Date of birth"
                type="date"
                error={step1Form.formState.errors.date_of_birth?.message}
                {...step1Form.register("date_of_birth")}
              />
              <Select
                label="I am"
                options={GENDER_OPTIONS}
                error={step1Form.formState.errors.gender?.message}
                {...step1Form.register("gender")}
              />
              <Select
                label="Interested in"
                options={GENDER_OPTIONS}
                error={step1Form.formState.errors.interested_in?.message}
                {...step1Form.register("interested_in")}
              />
              <Button type="submit" loading={submitting} className="w-full">
                Continue
              </Button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
              <Textarea
                label="Bio"
                rows={4}
                placeholder="Tell us something interesting about you…"
                error={step2Form.formState.errors.bio?.message}
                {...step2Form.register("bio")}
              />
              <Input
                label="City"
                placeholder="Mumbai"
                {...step2Form.register("city")}
              />
              <Input
                label="Country"
                placeholder="India"
                {...step2Form.register("country")}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" loading={submitting} className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <InterestPicker
                interests={interests}
                selectedIds={selectedInterestIds}
                onChange={setSelectedInterestIds}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleStep3Submit}
                  loading={submitting}
                  className="flex-1"
                  disabled={selectedInterestIds.length < 3}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <PhotoUploader photos={photos} onChange={setPhotos} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1"
                  disabled={photos.length === 0}
                >
                  Finish
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}