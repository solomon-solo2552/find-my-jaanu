"use client";

import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { notify } from "@/lib/toast";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      notify.success("Back online!");
      setWasOffline(false);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 shadow"
        >
          <WifiOff className="w-4 h-4" />
          You&apos;re offline. Some features won&apos;t work.
        </motion.div>
      )}
    </AnimatePresence>
  );
}