"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type UseSocketResult = {
  socket: Socket | null;
  connected: boolean;
};

export function useSocket(): UseSocketResult {
  const { userId, isLoaded } = useAuth();

  const [socket, setSocket] =
    useState<Socket | null>(null);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      setConnected(false);

      setSocket((prev) => {
        if (prev) {
          prev.disconnect();
        }

        return null;
      });

      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5000";

    const socketInstance = io(baseUrl, {
      auth: {
        userId,
      },

      withCredentials: true,

      transports: ["websocket"],

      autoConnect: false,
    });

    const handleConnect = () => {
      console.log(
        `[Socket connected] ${socketInstance.id}`
      );

      setConnected(true);
    };

    const handleDisconnect = (
      reason: string
    ) => {
      console.log(
        `[Socket disconnected] ${socketInstance.id}`,
        reason
      );

      setConnected(false);
    };

    const handleConnectError = (
      error: Error
    ) => {
      console.error(
        "[Socket connection error]",
        error
      );

      setConnected(false);
    };

    socketInstance.on(
      "connect",
      handleConnect
    );

    socketInstance.on(
      "disconnect",
      handleDisconnect
    );

    socketInstance.on(
      "connect_error",
      handleConnectError
    );

    setSocket(socketInstance);

    socketInstance.connect();

    return () => {
      socketInstance.off(
        "connect",
        handleConnect
      );

      socketInstance.off(
        "disconnect",
        handleDisconnect
      );

      socketInstance.off(
        "connect_error",
        handleConnectError
      );

      socketInstance.disconnect();

      setConnected(false);
      setSocket(null);
    };
  }, [userId, isLoaded]);

  return {
    socket,
    connected,
  };
}