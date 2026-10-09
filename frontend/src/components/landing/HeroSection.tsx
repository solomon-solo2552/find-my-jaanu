"use client";

import Link from "next/link";
import { Heart, Sparkles, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

export function HeroSection() {
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-yellow-50">
            {/* Decorative blobs */}
            <div className="absolute top-20 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute top-40 -right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

            <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Copy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-pink-200 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-700">
                            Daily curated picks — loved by 10,000+ users
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                        Find your{" "}
                        <span className="bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                            JAANU
                        </span>{" "}
                        <span className="inline-block">💘</span>
                    </h1>

                    <p className="text-lg text-gray-700 mb-8 max-w-lg">
                        Meet someone who loves chai, code, and everything in between.
                        Real conversations. Real connections. Zero games.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isAuthenticated ? (
                            <Link href="/discover">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Start Discovering
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/signup">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                        <Link href="#how-it-works">
                            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                                See How It Works
                            </Button>
                        </Link>
                    </div>

                    {/* Trust row */}
                    <div className="flex items-center gap-4 mt-8">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span>
                                <strong className="text-gray-900">4.9</strong> from 2,400+ reviews
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative hidden lg:block"
                >
                    <PhoneMockup />
                </motion.div>
            </div>
        </section>
    );
}

function PhoneMockup() {
    return (
        <div className="relative mx-auto w-full max-w-sm">
            {/* Phone frame */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border-8 border-gray-900 overflow-hidden aspect-[9/19]">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-full z-10" />

                {/* App content */}
                <div className="h-full bg-pink-50 pt-10 p-4 flex flex-col">
                    {/* Fake header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
                            <span className="font-bold text-pink-600 text-sm">Find My JAANU</span>
                        </div>
                    </div>

                    {/* Fake profile card */}
                    <div className="relative flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 to-pink-400 shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                            💕
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h3 className="font-bold text-lg">Priya, 27</h3>
                            <p className="text-xs text-white/80">📍 Mumbai · 3 shared interests</p>
                        </div>
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md border-2 border-white">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>

                    {/* Action row */}
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 text-2xl">
                            ✕
                        </div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg flex items-center justify-center text-white text-2xl">
                            ♥
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating cards */}
            <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    💬
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-900">New message</p>
                    <p className="text-[10px] text-gray-500">Priya: &ldquo;Hi! ☕&rdquo;</p>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
            >
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    💘
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-900">It&apos;s a match!</p>
                    <p className="text-[10px] text-gray-500">You + Arjun</p>
                </div>
            </motion.div>
        </div>
    );
}