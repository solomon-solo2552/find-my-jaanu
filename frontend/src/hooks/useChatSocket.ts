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

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!matchId) return;

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

    ws.onclose = () => {
      setConnected(false);
      if (reconnectAttempts.current < maxReconnect) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose fires next
    };
  }, [matchId]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
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