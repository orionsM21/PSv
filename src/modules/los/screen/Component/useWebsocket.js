// components/hooks/useWebsocket.js
import { useEffect, useRef } from 'react';

export default function useWebsocket({ url, onMessage, onOpen, onClose, protocols }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  useEffect(() => {
    if (!url) return;
    let closed = false;

    const connect = () => {
      const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (ev) => {
        retryRef.current = 0;
        onOpen?.(ev);
      };
      ws.onmessage = (ev) => {
        try { onMessage?.(JSON.parse(ev.data)); } catch (e) { onMessage?.(ev.data); }
      };
      ws.onclose = (ev) => {
        onClose?.(ev);
        if (closed) return;
        // exponential backoff capped
        const retry = Math.min(5, ++retryRef.current);
        const wait = 1000 * Math.pow(2, retry);
        setTimeout(connect, wait);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      closed = true;
      try { wsRef.current?.close(); } catch (_) {}
    };
  }, [url]);

  return {
    send: (payload) => {
      try {
        const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
        wsRef.current?.readyState === 1 && wsRef.current.send(json);
      } catch (e) {}
    },
  };
}
