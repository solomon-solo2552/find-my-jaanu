"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (content: string) => boolean;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const ok = onSend(trimmed);
    if (ok) setText("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          // ⚠️ Changed: only block sending, not typing
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 max-h-32 text-gray-900 bg-white placeholder:text-gray-400"
          style={{ minHeight: 44 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="p-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title={disabled ? "Connecting…" : "Send"}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-1 px-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}