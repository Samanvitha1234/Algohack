import { useEffect } from "react";
import { getWsUrl } from "../services/api";

export function useRealtime(onMessage: (event: string, payload: unknown) => void): void {
  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    ws.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data) as { event: string; payload: unknown };
        onMessage(parsed.event, parsed.payload);
      } catch (_err) {
        // Ignore malformed ws payloads.
      }
    };
    return () => {
      ws.close();
    };
  }, [onMessage]);
}
