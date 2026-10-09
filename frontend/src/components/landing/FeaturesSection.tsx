"use client";

import { Heart, MessageCircle, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
    {
        icon: Heart,
        title: "Smart Matching",
        description:
            "Our algorithm surfaces people who share your interests and values — not just your zip code.",
        color: "from-pink-500 to-pink-600",
    },
    {
        icon: MessageCircle,
        title: "Real-time Chat",
        description:
            "Break the ice with messages that arrive instantly. Emojis, links, and GIFs welcome.",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: Sparkles,
        title: "Daily Picks",
        description:
            "Five handpicked profiles every day, refreshed at midnight. Curated for you, not the crowd.",
        color: "from-yellow-500 to-amber-500",
    },
    {
        icon: Shield,
        title: "Safety First",
        description:
            "Report, block, and privacy controls built in. Your comfort is non-negotiable.",
        color: "from-blue-500 to-blue-600",
    },
];

export function FeaturesSection() {
    return (
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-pink-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        Why you&apos;ll love it here
                    </h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Built for real connections, not endless swiping.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4 }}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-gray-100"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md`}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}