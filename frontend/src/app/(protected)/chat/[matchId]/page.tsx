"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MoreVertical } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/store/auth";
import { chatApi, Message, MatchInfo } from "@/lib/chat";
import { matchesApi } from "@/lib/matches";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatPage() {
  return (
    <RequireAuth>
      <Chat />
    </RequireAuth>
  );
}

function Chat() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const profileId = useAuthStore((s) => s.user?.id);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnmatch, setConfirmUnmatch] = useState(false);
  const [unmatching, setUnmatching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load match info + message history
  useEffect(() => {
    (async () => {
      try {
        const [info, history] = await Promise.all([
          chatApi.getMatchInfo(matchId),
          chatApi.getMessages(matchId),
        ]);
        setMatchInfo(info);
        setMessages(history.results);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("This match no longer exists.");
        } else {
          setError("Failed to load chat.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  // Handle incoming WS message
  const handleIncoming = useCallback((msg: Message) => {
    setMessages((prev) => {
      // Dedupe by ID (in case our optimistic message got a WS echo)
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { connected, send } = useChatSocket({
    matchId,
    onMessage: handleIncoming,
  });

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string): boolean => {
    return send(content);
  };

  const handleUnmatch = async () => {
    setUnmatching(true);
    try {
      await matchesApi.unmatch(matchId);
      router.push("/matches");
    } catch {
      setError("Failed to unmatch.");
      setUnmatching(false);
      setConfirmUnmatch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  if (error || !matchInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-pink-50 px-4">
        <p className="text-gray-600">{error || "Chat not found."}</p>
        <Link href="/matches" className="text-pink-600 font-medium hover:underline">
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/matches" className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {matchInfo.other_profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={matchInfo.other_profile.photo}
              alt={matchInfo.other_profile.display_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
              {matchInfo.other_profile.display_name[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">
              {matchInfo.other_profile.display_name}
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {connected ? "Online" : "Connecting…"}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmUnmatch(true);
                  }}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  Unmatch
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm my-10">
            <p className="font-medium mb-1">You matched! 🎉</p>
            <p>Say hi to {matchInfo.other_profile.display_name}.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === profileId;
            const prevMsg = messages[index - 1];
            const showSenderName =
              !prevMsg || prevMsg.sender_id !== msg.sender_id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={isMine}
                showSenderName={showSenderName}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <MessageComposer onSend={handleSend} disabled={!connected} />

      <ConfirmDialog
        open={confirmUnmatch}
        title="Unmatch?"
        description={`You'll no longer be able to chat with ${matchInfo.other_profile.display_name}.`}
        confirmLabel="Unmatch"
        destructive
        loading={unmatching}
        onConfirm={handleUnmatch}
        onCancel={() => setConfirmUnmatch(false)}
      />
    </main>
  );
}