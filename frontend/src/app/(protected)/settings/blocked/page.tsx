"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UserX } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { safetyApi, BlockedUser } from "@/lib/safety";
import { absoluteMediaUrl } from "@/lib/api";
import { notify, errorMessage } from "@/lib/toast";

export default function BlockedPage() {
  return (
    <RequireAuth>
      <BlockedList />
    </RequireAuth>
  );
}

function BlockedList() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockTarget, setUnblockTarget] = useState<BlockedUser | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await safetyApi.listBlocked();
      setBlocked(res.results);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to load blocked users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnblock = async () => {
    if (!unblockTarget) return;
    setUnblocking(true);
    try {
      await safetyApi.unblock(unblockTarget.blocked);
      setBlocked((prev) => prev.filter((b) => b.id !== unblockTarget.id));
      notify.success(`Unblocked ${unblockTarget.blocked_display_name}.`);
      setUnblockTarget(null);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to unblock."));
    } finally {
      setUnblocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-pink-600 mb-6">Blocked Users</h1>

        {blocked.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No blocked users"
            description="You haven't blocked anyone. People you block won't be able to see your profile or message you."
          />
        ) : (
          <div className="space-y-2">
            {blocked.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-3 flex items-center gap-4 border border-gray-100"
              >
                {absoluteMediaUrl(b.blocked_photo) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={absoluteMediaUrl(b.blocked_photo) as string}
                    alt={b.blocked_display_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    {b.blocked_display_name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {b.blocked_display_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Blocked {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setUnblockTarget(b)}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!unblockTarget}
        title="Unblock this user?"
        description={`${unblockTarget?.blocked_display_name} will be able to see your profile and message you again if you match.`}
        confirmLabel="Unblock"
        loading={unblocking}
        onConfirm={handleUnblock}
        onCancel={() => setUnblockTarget(null)}
      />
    </main>
  );
}