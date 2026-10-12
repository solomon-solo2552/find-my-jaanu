"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Send, Image as ImageIcon, Smile, Film, X, Loader2 } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";

interface Props {
  onSend: (content: string) => boolean;
  onSendImage: (file: File) => Promise<boolean>;
  onSendGif: (url: string) => Promise<boolean>;
  disabled?: boolean;
}

export function MessageComposer({
  onSend,
  onSendImage,
  onSendGif,
  disabled,
}: Props) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (inputRef.current) inputRef.current.value = "";
  };

  const confirmImageSend = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const ok = await onSendImage(pendingFile);
    setUploading(false);
    if (ok) {
      setPendingFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((t) => t + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  const handleGifSelect = async (url: string) => {
    setGifOpen(false);
    await onSendGif(url);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Image preview */}
      {previewUrl && (
        <div className="p-3 border-b border-gray-100 flex items-center gap-3">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-pink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={cancelPreview}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 text-sm text-gray-600">
            Ready to send
          </div>
          <button
            onClick={confirmImageSend}
            disabled={uploading}
            className="px-4 py-2 rounded-full bg-pink-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send
          </button>
        </div>
      )}

      {/* Emoji / GIF pickers (overlay above composer) */}
      {emojiOpen && (
        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setEmojiOpen(false)} />
      )}
      {gifOpen && (
        <GifPicker onSelect={handleGifSelect} onClose={() => setGifOpen(false)} />
      )}

      {/* Composer row */}
      <div className="p-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />

        <div className="flex items-end gap-2">
          {/* Emoji */}
          <button
            type="button"
            onClick={() => {
              setEmojiOpen((v) => !v);
              setGifOpen(false);
            }}
            className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Image */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            title="Send image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* GIF */}
          <button
            type="button"
            onClick={() => {
              setGifOpen((v) => !v);
              setEmojiOpen(false);
            }}
            className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            title="Send GIF"
          >
            <Film className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled || uploading}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 max-h-32 text-gray-900 bg-white placeholder:text-gray-400"
            style={{ minHeight: 44 }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim() || uploading}
            className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}