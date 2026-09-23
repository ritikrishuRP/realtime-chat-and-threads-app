"use client";

import DirectChatPanel from "@/components/chat/direct-chat-panel";
import {
  Avatar,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import {
  apiGet,
  createBrowserApiClient,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  ChatUser,
  mapChatUser,
  mapDirectMessage,
} from "@/types/chat";
import { useAuth } from "@clerk/nextjs";
import {
  MessageSquare,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

function Chat() {
  console.log("🔥🔥 CHAT PAGE LOADED 🔥🔥");
  const { getToken } = useAuth();
  const { connected, socket } = useSocket();

  const apiClient = useMemo(
    () => createBrowserApiClient(getToken),
    [getToken]
  );

  const [users, setUsers] =
    useState<ChatUser[]>([]);

  const [activeUserId, setActiveUserId] =
    useState<number | null>(null);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [onlineUserIds, setOnlineUserIds] =
    useState<number[]>([]);

  const [unreadUserIds, setUnreadUserIds] =
    useState<Set<number>>(new Set());

  /*
   * LOAD USERS
   */

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoadingUsers(true);

      try {
        const response =
          await apiGet<any[]>(
            apiClient,
            "/api/chat/users"
          );

          console.log("USERS FROM API:", users);

          

        if (!isMounted) return;


        setUsers(
          response.map(mapChatUser)
        );

        /*
         * Do not automatically select
         * the first user.
         */
      } catch (error) {
        console.error(
          "Failed to load chat users:",
          error
        );
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  /*
   * PRESENCE
   */

  useEffect(() => {
    if (!socket) return;

    function handlePresence(
      payload: {
        onlineUserIds?: number[];
      }
    ) {
      setOnlineUserIds(
        (payload?.onlineUserIds ?? []).map(
          Number
        )
      );
    }

    socket.on(
      "presence:update",
      handlePresence
    );

    socket.emit(
      "presence:request"
    );

    return () => {
      socket.off(
        "presence:update",
        handlePresence
      );
    };
  }, [socket]);

  /*
   * REAL-TIME MESSAGE
   */

  useEffect(() => {
    if (!socket) return;

    function handleMessage(
      payload: Record<string, any>
    ) {
      const message =
        mapDirectMessage(payload);

      const senderId =
        Number(message.senderUserId);

      const recipientId =
        Number(message.recipientUserId);

      setUsers((previousUsers) =>
        previousUsers.map((user) => {
          if (
            user.id !== senderId &&
            user.id !== recipientId
          ) {
            return user;
          }

          return {
            ...user,
            lastMessage: message.body,
            lastMessageImageUrl:
              message.imageUrl,
            lastMessageAt:
              message.createdAt,
            lastMessageSenderId:
              senderId,
            hasConversation: true,
          };
        })
      );

      /*
       * Message came from somebody whose
       * conversation is not currently open.
       */
      if (senderId !== activeUserId) {
        setUnreadUserIds((previous) => {
          const next = new Set(previous);
          next.add(senderId);
          return next;
        });
      }
    }

    socket.on(
      "dm:message",
      handleMessage
    );

    return () => {
      socket.off(
        "dm:message",
        handleMessage
      );
    };
  }, [socket, activeUserId]);

  /*
   * SELECT CHAT
   */

  function handleSelectUser(
    userId: number
  ) {
    setActiveUserId(userId);

    /*
     * Opening the chat clears
     * the green unread indicator.
     */
    setUnreadUserIds((previous) => {
      const next = new Set(previous);
      next.delete(userId);
      return next;
    });
  }

  /*
   * SORTING
   *
   * Priority:
   * 1. Unread
   * 2. Existing conversation
   * 3. Most recent conversation
   * 4. Online
   * 5. Alphabetical
   */

  const sortedUsers = useMemo(() => {
    const onlineSet =
      new Set(onlineUserIds);

    return [...users].sort((a, b) => {
      const aUnread =
        unreadUserIds.has(a.id);

      const bUnread =
        unreadUserIds.has(b.id);

      if (aUnread !== bUnread) {
        return aUnread ? -1 : 1;
      }

      if (
        a.hasConversation !==
        b.hasConversation
      ) {
        return a.hasConversation
          ? -1
          : 1;
      }

      if (
        a.hasConversation &&
        b.hasConversation
      ) {
        const aTime = a.lastMessageAt
          ? new Date(
              a.lastMessageAt
            ).getTime()
          : 0;

        const bTime = b.lastMessageAt
          ? new Date(
              b.lastMessageAt
            ).getTime()
          : 0;

        if (aTime !== bTime) {
          return bTime - aTime;
        }
      }

      const aOnline =
        onlineSet.has(a.id);

      const bOnline =
        onlineSet.has(b.id);

      if (aOnline !== bOnline) {
        return aOnline ? -1 : 1;
      }

      const aName =
        a.displayName?.trim() ||
        a.handle ||
        "User";

      const bName =
         b.displayName?.trim() ||
         b.handle ||
      "User";

      return aName.localeCompare(
        bName
      );
    });
  }, [
    users,
    onlineUserIds,
    unreadUserIds,
  ]);

  /*
   * ACTIVE USER
   */

  const activeUser =
    activeUserId !== null
      ? users.find(
          (user) =>
            user.id === activeUserId
        ) ?? null
      : null;

  const onlineCount =
    users.filter((user) =>
      onlineUserIds.includes(user.id)
    ).length;

  /*
   * HELPERS
   */

  function getUserLabel(user: ChatUser) {
  return (
    user.displayName?.trim() ||
    (user.handle?.trim()
      ? `@${user.handle}`
      : "User")
  );
}

  function getMessagePreview(
    user: ChatUser
  ) {
    if (
      user.lastMessage &&
      user.lastMessage.trim()
    ) {
      return user.lastMessage;
    }

    if (user.lastMessageImageUrl) {
      return "Image";
    }

    return "";
  }

  /*
   * UI
   */

  return (
    <div className="w-full px-2 py-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex h-[calc(100dvh-7.5rem)] w-full gap-4 md:gap-5">
        {/* INBOX */}

        <aside className="hidden w-[300px] shrink-0 md:block lg:w-[320px]">
          <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card">
            <CardHeader className="shrink-0 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm text-foreground">
                  Direct Messages
                </CardTitle>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {onlineCount} Online -{" "}
                {users.length} total
              </p>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {loadingUsers && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    Loading users...
                  </p>
                </div>
              )}

              {!loadingUsers &&
                sortedUsers.map((user) => {
                  const isActive =
                    activeUserId === user.id;

                  const isUnread =
                    unreadUserIds.has(
                      user.id
                    );

                  const isOnline =
                    onlineUserIds.includes(
                      user.id
                    );

                  const label =
                    getUserLabel(user);

                  const preview =
                    getMessagePreview(user);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        handleSelectUser(
                          user.id
                        )
                      }
                      className={cn(
                        "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-primary/15 ring-1 ring-primary/30"
                          : "hover:bg-background/70"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10">
                          {user.avatarUrl && (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={label}
                            />
                          )}
                        </Avatar>

                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "truncate text-sm font-medium",
                            isActive
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {label}
                        </div>

                        {preview && (
                          <div className="mt-1 flex min-w-0 items-center gap-2">
                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                            )}

                            <span
                              className={cn(
                                "truncate text-xs",
                                isUnread
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {preview}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </CardContent>
          </Card>
        </aside>

        {/* CHAT */}

        <main className="min-w-0 flex-1">
          {activeUserId !== null &&
          activeUser ? (
            <DirectChatPanel
              otherUserId={activeUserId}
              otherUser={activeUser}
              socket={socket}
              connected={connected}
            />
          ) : (
            <Card className="flex h-full items-center justify-center border-border/70 bg-card">
              <CardContent className="text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />

                <p className="text-sm text-muted-foreground">
                  Select a user to start
                  chatting
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default Chat;
