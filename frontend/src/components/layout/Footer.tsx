import Link from "next/link";
import { Heart, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcon";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                            <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
                            Find My JAANU
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            A modern social matching platform built with Next.js, Django, and
                            PostgreSQL.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            <a
                                href="https://github.com/solomon-solo2552/find-my-jaanu"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition"
                                aria-label="GitHub"
                            >
                                <GithubIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://solomon-solo2552.github.io"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition"
                                aria-label="Portfolio"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                            <a
                                href="https://linkedin.com/in/solomon-t-mathew-6b1ba9327"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition"
                                aria-label="LinkedIn"
                            >
                                <LinkedinIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Columns */}
                    <FooterColumn
                        title="Product"
                        links={[
                            { label: "Discover", href: "/discover" },
                            { label: "Daily Picks", href: "/daily" },
                            { label: "Matches", href: "/matches" },
                            { label: "Likes", href: "/likes" },
                        ]}
                    />
                    <FooterColumn
                        title="Company"
                        links={[
                            { label: "About", href: "#" },
                            { label: "Blog", href: "#" },
                            { label: "Careers", href: "#" },
                            { label: "Contact", href: "#" },
                        ]}
                    />
                    <FooterColumn
                        title="Legal"
                        links={[
                            { label: "Privacy", href: "#" },
                            { label: "Terms", href: "#" },
                            { label: "Cookies", href: "#" },
                            { label: "Guidelines", href: "#" },
                        ]}
                    />
                </div>

                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                    <p>© {new Date().getFullYear()} Find My JAANU. All rights reserved.</p>
                    <p className="flex items-center gap-1.5">
                        Made with
                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                        by
                        <a
                            href="https://github.com/solomon-solo2552"
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:text-pink-400 font-medium"
                        >
                            Solomon T Mathew
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) {
    return (
        <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                {title}
            </h3>
            <ul className="space-y-2 text-sm">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="hover:text-pink-400 transition"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}