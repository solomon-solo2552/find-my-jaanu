"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Match } from "@/lib/matches";
import { photoUrl } from "@/lib/profiles";

interface Props {
  match: Match | null;
  onClose: () => void;
}

export function MatchModal({ match, onClose }: Props) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
              className="flex justify-center mb-4"
            >
              <Heart className="w-16 h-16 fill-pink-600 text-pink-600" />
            </motion.div>

            <h2 className="text-3xl font-bold text-pink-600 mb-2">It&apos;s a Match!</h2>
            <p className="text-gray-600 mb-6">
              You and <strong>{match.other_profile.display_name}</strong> liked each other.
            </p>

            <div className="flex justify-center mb-6">
              {match.other_profile.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl(match.other_profile.photos[0].image)}
                  alt={match.other_profile.display_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-pink-200"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/chat/${match.id}`} onClick={onClose}>
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send a Message
                </Button>
              </Link>
              <Button variant="ghost" onClick={onClose} className="w-full">
                Keep Swiping
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}