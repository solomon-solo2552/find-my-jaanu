"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

export function CTASection() {
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-pink-500 to-yellow-500 py-16 sm:py-20">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />

            <div className="relative max-w-3xl mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-6">
                    <Heart className="w-8 h-8 text-white fill-white" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Ready to find your JAANU?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                    Join thousands of people who found something real. Signing up takes
                    30 seconds.
                </p>

                {isAuthenticated ? (
                    <Link href="/discover">
                        <Button
                            size="lg"
                            className="bg-white text-pink-600 hover:bg-gray-100"
                        >
                            Keep Discovering
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="bg-white text-pink-600 hover:bg-gray-100 w-full sm:w-auto"
                            >
                                Sign Up Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="text-white border-2 border-white/50 hover:bg-white/10 w-full sm:w-auto"
                            >
                                Log In
                            </Button>
                        </Link>
                    </div>
                )}

                <p className="text-xs text-white/70 mt-6">
                    No credit card. No spam. Just connections.
                </p>
            </div>
        </section>
    );
}