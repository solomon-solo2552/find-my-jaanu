"use client";

import { useState } from "react";
import { Message } from "@/lib/chat";
import { formatRelativeTime } from "@/lib/time";
import clsx from "clsx";
import { Trash2, X, UserX } from "lucide-react";

interface Props {
    message: Message;
    isMine: boolean;
    showSenderName?: boolean;
    onDeleteForMe: (msg: Message) => void;
    onDeleteForEveryone: (msg: Message) => void;
}

export function MessageBubble({
    message,
    isMine,
    showSenderName,
    onDeleteForMe,
    onDeleteForEveryone,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);

    // System message
    if (message.message_type === "system") {
        return (
            <div className="flex justify-center my-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // Deleted message placeholder
    if (message.is_deleted) {
        return (
            <div className={clsx(
                "flex flex-col max-w-[75%]",
                isMine ? "items-end self-end" : "items-start self-start"
            )}>
                <div className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 italic text-sm flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    This message was deleted
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatRelativeTime(message.created_at)}
                </span>
            </div>
        );
    }

    const renderContent = () => {
        if (message.message_type === "image" && message.image) {
            return (
                <div
                    className={clsx(
                        "rounded-2xl overflow-hidden border-2",
                        isMine ? "border-pink-200" : "border-gray-200"
                    )}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={message.image}
                        alt="Shared media"
                        className="max-w-[280px] max-h-[320px] object-cover cursor-pointer"
                        onClick={() => window.open(message.image!, "_blank")}
                    />
                    {message.content && !["📷 Photo", "🎬 GIF"].includes(message.content) && (
                        <div
                            className={clsx(
                                "px-3 py-1.5 text-sm",
                                isMine ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-900"
                            )}
                        >
                            {message.content}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                className={clsx(
                    "px-4 py-2 rounded-2xl break-words",
                    isMine
                        ? "bg-pink-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                )}
            >
                {message.content}
            </div>
        );
    };

    return (
        <div
            className={clsx(
                "group flex flex-col max-w-[75%] relative",
                isMine ? "items-end self-end" : "items-start self-start"
            )}
        >
            {showSenderName && !isMine && (
                <span className="text-xs text-gray-500 mb-1 px-1">
                    {message.sender_name}
                </span>
            )}

            <div
                className="relative"
                onDoubleClick={() => setMenuOpen(true)}
            >
                {renderContent()}

                {/* Hover/tap action button */}
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={clsx(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-full bg-white shadow-md border border-gray-200",
                        isMine ? "-left-9" : "-right-9"
                    )}
                    title="Message options"
                >
                    <span className="text-gray-600 text-xs font-bold">⋮</span>
                </button>

                {/* Menu */}
                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setMenuOpen(false)}
                        />
                        <div
                            className={clsx(
                                "absolute top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40 min-w-[180px]",
                                isMine ? "right-0" : "left-0"
                            )}
                        >
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDeleteForMe(message);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <UserX className="w-3.5 h-3.5" />
                                Delete for me
                            </button>

                            {isMine && message.can_delete_for_everyone && (
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onDeleteForEveryone(message);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete for everyone
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div
                className={clsx(
                    "flex items-center gap-1 mt-1 px-1",
                    isMine ? "flex-row-reverse" : "flex-row"
                )}
            >
                <span className="text-[10px] text-gray-400">
                    {formatRelativeTime(message.created_at)}
                </span>
                {isMine && (
                    <span
                        className={clsx(
                            "text-[11px] font-bold transition-colors",
                            message.is_read ? "text-pink-500" : "text-gray-400"
                        )}
                        title={message.is_read ? "Seen" : "Sent"}
                    >
                        {message.is_read ? "✓✓" : "✓"}
                    </span>
                )}
            </div>
        </div>
    );
}