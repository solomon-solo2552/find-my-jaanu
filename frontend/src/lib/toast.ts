import { toast } from "sonner";

export const notify = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg),
    loading: (msg: string) => toast.loading(msg),
    promise: <T,>(
        p: Promise<T>,
        msgs: { loading: string; success: string; error: string }
    ) =>
        toast.promise(p, {
            loading: msgs.loading,
            success: msgs.success,
            error: msgs.error,
        }),
};

/**
 * Extract a human-readable error message from an axios error.
 */
export function errorMessage(err: any, fallback = "Something went wrong."): string {
    const data = err?.response?.data;
    if (!data) return err?.message || fallback;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    // DRF field errors: { field: ["msg1", "msg2"] }
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
    return fallback;
}