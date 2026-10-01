"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Message } from "@/lib/chat";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";

interface UseChatSocketOptions {
  matchId: string | null;
  onMessage: (msg: Message) => void;
}

export function useChatSocket({ matchId, onMessage }: UseChatSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnect = 5;
  const shouldReconnect = useRef(true);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!matchId) return;

    // Guard: don't open a second socket while one is already connecting/open
    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.CONNECTING || existing.readyState === WebSocket.OPEN)) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/chat/${matchId}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "error") {
          console.error("WS error:", data.detail);
          return;
        }
        onMessageRef.current(data as Message);
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      wsRef.current = null;

      // Only reconnect if this wasn't a deliberate close
      if (!shouldReconnect.current) return;
      // Auth failures — don't keep retrying with a dead token
      if (event.code === 4001 || event.code === 4002 || event.code === 4003) {
        return;
      }

      if (reconnectAttempts.current < maxReconnect) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
        reconnectTimer.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will follow; don't double-handle
    };
  }, [matchId]);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();

    return () => {
      // Stop reconnect attempts
      shouldReconnect.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      const ws = wsRef.current;
      if (!ws) return;

      if (ws.readyState === WebSocket.CONNECTING) {
        // Wait for handshake to finish before closing (avoids the React warning)
        ws.onopen = () => ws.close();
        ws.onerror = () => {};
        ws.onclose = () => {};
      } else if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      wsRef.current = null;
    };
  }, [connect]);

  const send = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify({ content }));
    return true;
  }, []);

  return { connected, send };
}