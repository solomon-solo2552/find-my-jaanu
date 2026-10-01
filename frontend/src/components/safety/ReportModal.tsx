"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import clsx from "clsx";
import { ReportReason } from "@/lib/safety";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "fake", label: "Fake profile / catfishing" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
];

interface Props {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
}

export function ReportModal({ open, displayName, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onSubmit(reason, details);
      setReason(null);
      setDetails("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">
                Report {displayName}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Help us keep Find My JAANU safe. Reports are anonymous.
            </p>

            <div className="space-y-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-lg border transition font-medium",
                    reason === r.value
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white text-gray-900 hover:border-pink-300 hover:bg-gray-50"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <Textarea
              label="Additional details (optional)"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything else we should know?"
              maxLength={500}
            />

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!reason}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Submit Report
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}