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