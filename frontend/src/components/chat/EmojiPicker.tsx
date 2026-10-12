"use client";

import EmojiPickerReact, { EmojiClickData, Theme } from "emoji-picker-react";

interface Props {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: Props) {
    return (
        <div className="border-t border-gray-100">
            <div className="relative">
                <div className="h-[350px] overflow-hidden">
                    <EmojiPickerReact
                        onEmojiClick={(data: EmojiClickData) => onSelect(data.emoji)}
                        theme={Theme.LIGHT}
                        lazyLoadEmojis
                        width="100%"
                        height="350"
                        previewConfig={{ showPreview: false }}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white shadow text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}