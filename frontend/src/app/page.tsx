"use client";

import { useAuthStore } from "@/store/auth";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/layout/Footer";


export default function Home() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}