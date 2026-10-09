"use client";

import { UserPlus, Compass, Heart } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
    {
        icon: UserPlus,
        title: "Create your profile",
        description:
            "Add a few photos, pick your interests, and write a bio that sounds like you.",
    },
    {
        icon: Compass,
        title: "Discover people",
        description:
            "Swipe through profiles, or let Daily Picks choose for you. Like someone? Just tap.",
    },
    {
        icon: Heart,
        title: "Match and chat",
        description:
            "When you both like each other, it's a match. Start a conversation and see where it goes.",
    },
];

export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="py-16 sm:py-24 bg-white"
        >
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        How it works
                    </h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Three steps. That&apos;s it.
                    </p>
                </div>

                <div className="relative grid md:grid-cols-3 gap-8">
                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200" />

                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.4 }}
                                className="text-center relative"
                            >
                                <div className="relative z-10 w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-5 shadow-lg">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute top-2 right-1/2 -translate-x-1/2 -translate-y-1 w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 font-bold flex items-center justify-center text-sm border-2 border-white shadow z-20">
                                    {i + 1}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}