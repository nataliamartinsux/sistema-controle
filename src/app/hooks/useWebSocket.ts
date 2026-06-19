import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface WebSocketOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  enabled?: boolean;
}

export function useWebSocket<T>({ url, onMessage, enabled = true }: WebSocketOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = api.defaults.baseURL ? new URL(api.defaults.baseURL).host : window.location.host;
      const fullWsUrl = `${wsProtocol}//${wsHost}${url}`;

      const socket = new WebSocket(fullWsUrl);
      socketRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      socket.onclose = () => {
        setIsConnected(false);
        // Tenta reconectar apenas se o componente ainda estiver montado
        if (socketRef.current) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (e) {
          console.error("Erro ao processar mensagem do WebSocket:", e);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      const socket = socketRef.current;
      socketRef.current = null; // Impede a reconexão
      if (socket) {
        socket.close();
      }
    };
  }, [url, onMessage, enabled]);

  return { isConnected };
}