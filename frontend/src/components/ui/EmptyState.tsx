import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";


interface Props {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}


export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <Icon className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            {description && (
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
            )}
            {actionLabel && actionHref && (
                <Link href={actionHref}>
                    <Button>{actionLabel}</Button>
                </Link>
            )}
            {actionLabel && onAction && !actionHref && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}