import Link from "next/link";
import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="text-center max-w-md">
        <Heart className="w-20 h-20 text-pink-300 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-pink-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          This page doesn&apos;t exist
        </h2>
        <p className="text-gray-600 mb-6">
          Maybe they got cold feet and left. Or maybe you took a wrong turn.
        </p>
        <Link href="/">
          <Button size="lg">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  );
}