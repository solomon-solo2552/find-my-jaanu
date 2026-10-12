"use client";

import { Message } from "@/lib/chat";
import { formatRelativeTime } from "@/lib/time";
import clsx from "clsx";


interface Props {
    message: Message;
    isMine: boolean;
    showSenderName?: boolean;
}

export function MessageBubble({ message, isMine, showSenderName }: Props) {
    if (message.message_type === "system") {
        return (
            <div className="flex justify-center my-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // Image message
    if (message.message_type === "image" && message.image) {
        return (
            <div className={clsx(
                "flex flex-col max-w-[75%]",
                isMine ? "items-end self-end" : "items-start self-start"
            )}>
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
                </div>
                {message.content && message.content !== "📷 Photo" && message.content !== "🎬 GIF" && (
                    <div className={clsx(
                        "px-4 py-2 mt-1 rounded-2xl break-words text-sm",
                        isMine
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-900"
                )}>
                    {message.content}
                    </div>
                )}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatRelativeTime(message.created_at)}
                </span>
            </div>
        );
    }

    return (
        <div className={clsx(
            "flex flex-col max-w-[75%]",
            isMine ? "items-end self-end" : "items-start self-start"
        )}
        >
            {showSenderName && !isMine && (
                <span className="text-xs text-gray-500 mb-1 px-1">
                    {message.sender_name}
                </span>
            )}
            <div className={clsx(
                "px-4 py-2 rounded-2xl break-words",
                isMine ? "bg-pink-600 text-white rounded-br-sm" :
                "bg-gray-100 text-gray-900 rounded-bl-sm"
            )}
            >
                {message.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatRelativeTime(message.created_at)}
            </span>
        </div>
    );
}