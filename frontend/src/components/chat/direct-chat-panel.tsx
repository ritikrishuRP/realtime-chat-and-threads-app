"use client";

import {
  apiGet,
  createBrowserApiClient,
} from "@/lib/api-client";
import {
  ChatUser,
  DirectMessage,
  mapDirectMessage,
  mapDirectMessagesResponse,
  RawDirectMessage,
} from "@/types/chat";
import { useAuth } from "@clerk/nextjs";
import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import ImageUploadButton from "./image-upload-button";

type DirectChatPanelProps = {
  otherUserId: number;
  otherUser: ChatUser | null;
  socket: Socket | null;
  connected: boolean;
};

function DirectChatPanel(
  props: DirectChatPanelProps
) {
  const {
    otherUser,
    otherUserId,
    socket,
    connected,
  } = props;

  const { getToken } = useAuth();

  const apiClient = useMemo(
    () => createBrowserApiClient(getToken),
    [getToken]
  );

  const [messages, setMessages] =
    useState<DirectMessage[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [input, setInput] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [typingLabel, setTypingLabel] =
    useState<string | null>(null);

  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const typingTimeoutRef =
    useRef<NodeJS.Timeout | null>(null);

  /*
   * SCROLL
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * LOAD MESSAGES
   */

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);

      try {
        const res =
          await apiGet<DirectMessage[]>(
            apiClient,
            `/api/chat/conversations/${otherUserId}/messages`,
            {
              params: {
                limit: 100,
              },
            }
          );

        if (!isMounted) return;

        setMessages(
          mapDirectMessagesResponse(res)
        );
      } catch (err) {
        console.error(
          "Failed to load messages:",
          err
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (otherUserId) {
      void load();
    }

    return () => {
      isMounted = false;
    };
  }, [apiClient, otherUserId]);

  /*
   * SOCKET
   */

  useEffect(() => {
    if (!socket) return;

    function handleMessage(
      payload: RawDirectMessage
    ) {
      const mapped =
        mapDirectMessage(payload);

      if (
        mapped.senderUserId !==
          otherUserId &&
        mapped.recipientUserId !==
          otherUserId
      ) {
        return;
      }

      setMessages((previous) => [
        ...previous,
        mapped,
      ]);
    }

    function handleTyping(
      payload: {
        senderUserId?: number;
        isTyping?: boolean;
      }
    ) {
      const senderId =
        Number(payload.senderUserId);

      if (
        senderId !== otherUserId
      ) {
        return;
      }

      setTypingLabel(
        payload.isTyping
          ? "Typing..."
          : null
      );
    }

    socket.on(
      "dm:message",
      handleMessage
    );

    socket.on(
      "dm:typing",
      handleTyping
    );

    return () => {
      socket.off(
        "dm:message",
        handleMessage
      );

      socket.off(
        "dm:typing",
        handleTyping
      );
    };
  }, [socket, otherUserId]);

  /*
   * TYPING
   */

  function setSendTyping(
    isTyping: boolean
  ) {
    if (!socket) return;

    socket.emit(
      "dm:typing",
      {
        recipientUserId: otherUserId,
        isTyping,
      }
    );
  }

  function handleInputChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setInput(event.target.value);

    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    setSendTyping(true);

    typingTimeoutRef.current =
      setTimeout(() => {
        setSendTyping(false);
        typingTimeoutRef.current =
          null;
      }, 2000);
  }

  /*
   * ENTER TO SEND
   */

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void handleSend();
    }
  }

  /*
   * SEND
   */

  async function handleSend() {
    if (!socket || !connected) {
      toast("Not connected", {
        description:
          "Realtime connection is not established yet!",
      });

      return;
    }

    const body = input.trim();

    if (!body && !imageUrl) {
      return;
    }

    setSending(true);

    try {
      socket.emit("dm:send", {
        recipientUserId: otherUserId,
        body: body || null,
        imageUrl: imageUrl || null,
      });

      setInput("");
      setImageUrl(null);
      setSendTyping(false);
    } finally {
      setSending(false);
    }
  }

  /*
   * TITLE
   */

const title =
  otherUser?.displayName?.trim() ||
  (otherUser?.handle?.trim()
    ? `@${otherUser.handle}`
    : "Conversation");
  /*
   * UI
   */

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border/70 bg-card">
      {/* HEADER */}

      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border px-5 py-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-base text-foreground">
            {title}
          </CardTitle>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Direct message conversation
          </p>
        </div>

        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
            connected
              ? "bg-primary/10 text-primary"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {connected ? (
            <>
              <Wifi className="h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline
            </>
          )}
        </span>
      </CardHeader>

      {/* MESSAGES */}

      <CardContent className="min-h-0 flex-1 overflow-y-auto bg-background/60 px-5 py-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">
              Loading messages...
            </p>
          </div>
        )}

        {!isLoading &&
          messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No messages yet.
                </p>

                <p className="mt-1 text-xs text-muted-foreground/70">
                  Start the conversation.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          messages.length > 0 && (
            <div className="flex w-full flex-col gap-2.5">
              {messages.map((msg) => {
                const isOther =
                  msg.senderUserId ===
                  otherUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      isOther
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`flex max-w-[72%] flex-col ${
                        isOther
                          ? "items-start ml-1"
                          : "items-end mr-1"
                      }`}
                    >
                      {/* MESSAGE */}

                      {msg.body && (
                        <div
                          className={`w-fit max-w-full wrap-break-word rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                            isOther
                              ? "rounded-tl-md bg-accent text-accent-foreground"
                              : "rounded-tr-md bg-primary/80 text-primary-foreground"
                          }`}
                        >
                          {msg.body}
                        </div>
                      )}

                      {/* IMAGE */}

                      {msg.imageUrl && (
                        <div className="mt-2 overflow-hidden rounded-xl border border-border">
                          <img
                            src={msg.imageUrl}
                            alt="attachment"
                            className="max-h-64 max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {typingLabel && (
                <div className="flex w-full justify-start">
                  <div className="ml-1 rounded-full bg-accent px-3 py-1.5 text-[11px] italic text-muted-foreground">
                    {typingLabel}
                  </div>
                </div>
              )}

              <div
                ref={messagesEndRef}
              />
            </div>
          )}
      </CardContent>

      {/* COMPOSER */}

      <div className="shrink-0 border-t border-border bg-card px-5 py-3">
        {imageUrl && (
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 p-2">
            <img
              src={imageUrl}
              alt="Pending attachment"
              className="h-12 w-12 rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="text-xs text-foreground">
                Image ready to send
              </p>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                It will be sent with your next message.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <div className="flex min-w-0 flex-1 items-end gap-2 rounded-xl border border-border bg-background/60 px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-primary/40">
            <ImageUploadButton
              onImageUpload={(url) =>
                setImageUrl(url)
              }
            />

            <Textarea
              rows={1}
              value={input}
              onChange={
                handleInputChange
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Type a message..."
              disabled={
                !connected ||
                sending
              }
              className="min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              sending ||
              !connected ||
              (!input.trim() &&
                !imageUrl)
            }
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default DirectChatPanel;