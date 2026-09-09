import { Server } from "socket.io";
import {
  getUserFromClerk,
} from "../modules/users/user.service.js";
import {
  createDirectMessage,
} from "../modules/chat/chat.service.js";

let io: Server | null = null;

const onlineUsers =
  new Map<number, Set<string>>();

function addOnlineUser(
  rawUserId: unknown,
  socketId: string
) {
  const userId =
    Number(rawUserId);

  if (
    !Number.isFinite(userId) ||
    userId <= 0
  ) {
    return;
  }

  const existing =
    onlineUsers.get(userId);

  if (existing) {
    existing.add(socketId);
  } else {
    onlineUsers.set(
      userId,
      new Set([socketId])
    );
  }
}

function removeOnlineUser(
  rawUserId: unknown,
  socketId: string
) {
  const userId =
    Number(rawUserId);

  if (
    !Number.isFinite(userId) ||
    userId <= 0
  ) {
    return;
  }

  const existing =
    onlineUsers.get(userId);

  if (!existing) {
    return;
  }

  existing.delete(socketId);

  if (existing.size === 0) {
    onlineUsers.delete(userId);
  }
}

function getOnlineUserIds() {
  return Array.from(
    onlineUsers.keys()
  );
}

function broadcastPresence() {
  io?.emit(
    "presence:update",
    {
      onlineUserIds:
        getOnlineUserIds(),
    }
  );
}

export function initIo(
  httpServer: any
) {
  if (io) {
    return io;
  }

  io = new Server(
    httpServer,
    {
      cors: {
        origin:
          "http://localhost:4000",
        credentials: true,
      },
    }
  );

  io.on(
    "connection",
    async (socket) => {
      console.log(
        `[io connection]------> ${socket.id}`
      );

      try {
        const clerkUserId =
          socket.handshake.auth
            ?.userId;

        if (
          !clerkUserId ||
          typeof clerkUserId !==
            "string"
        ) {
          console.log(
            `[Missing clerk user id]------> ${socket.id}`
          );

          socket.disconnect(true);
          return;
        }

        const profile =
          await getUserFromClerk(
            clerkUserId
          );

        const rawLocalUserId =
          profile.user.id;

        const localUserId =
          Number(
            rawLocalUserId
          );

        const displayName =
          profile.user
            .displayName ??
          null;

        const handle =
          profile.user.handle ??
          null;

        if (
          !Number.isFinite(
            localUserId
          ) ||
          localUserId <= 0
        ) {
          console.log(
            `[Invalid user id]------> ${socket.id}`
          );

          socket.disconnect(true);
          return;
        }

        socket.data = {
          userId:
            localUserId,
          displayName,
          handle,
        };

        /*
         * Notification room
         */
        const notiRoom =
          `notifications:user:${localUserId}`;

        socket.join(
          notiRoom
        );

        /*
         * Direct message room
         */
        const dmRoom =
          `dm:user:${localUserId}`;

        socket.join(dmRoom);

        /*
         * ---------------------------------------------------
         * PRESENCE
         * ---------------------------------------------------
         */

        addOnlineUser(
          localUserId,
          socket.id
        );

        /*
         * Send current presence to the
         * newly connected socket.
         */
        socket.emit(
          "presence:update",
          {
            onlineUserIds:
              getOnlineUserIds(),
          }
        );

        /*
         * Tell everyone about the
         * new online user.
         */
        broadcastPresence();

        /*
         * Allow client to request
         * current presence.
         */
        socket.on(
          "presence:request",
          () => {
            socket.emit(
              "presence:update",
              {
                onlineUserIds:
                  getOnlineUserIds(),
              }
            );
          }
        );

        /*
         * ---------------------------------------------------
         * SEND DIRECT MESSAGE
         * ---------------------------------------------------
         */

        socket.on(
          "dm:send",
          async (payload) => {
            try {
              const data =
                payload as {
                  recipientUserId?: unknown;
                  body?: unknown;
                  imageUrl?: unknown;
                };

              const senderUserId =
                Number(
                  socket.data
                    .userId
                );

              if (
                !Number.isFinite(
                  senderUserId
                ) ||
                senderUserId <= 0
              ) {
                return;
              }

              const recipientUserId =
                Number(
                  data?.recipientUserId
                );

              if (
                !Number.isFinite(
                  recipientUserId
                ) ||
                recipientUserId <= 0
              ) {
                return;
              }

              if (
                senderUserId ===
                recipientUserId
              ) {
                return;
              }

              const body =
                typeof data?.body ===
                "string"
                  ? data.body
                  : "";

              const imageUrl =
                typeof data?.imageUrl ===
                "string"
                  ? data.imageUrl
                  : null;

              console.log(
                `dm:send`,
                senderUserId,
                recipientUserId
              );

              const message =
                await createDirectMessage(
                  {
                    senderUserId,
                    recipientUserId,
                    body,
                    imageUrl,
                  }
                );

              const senderRoom =
                `dm:user:${senderUserId}`;

              const recipientRoom =
                `dm:user:${recipientUserId}`;

              io
                ?.to(senderRoom)
                .to(recipientRoom)
                .emit(
                  "dm:message",
                  message
                );
            } catch (err) {
              console.error(
                err
              );
            }
          }
        );

        /*
         * ---------------------------------------------------
         * TYPING
         * ---------------------------------------------------
         */

        socket.on(
          "dm:typing",
          (payload) => {
            const data =
              payload as {
                recipientUserId?: unknown;
                isTyping?: unknown;
              };

            const senderUserId =
              Number(
                socket.data
                  .userId
              );

            if (
              !Number.isFinite(
                senderUserId
              ) ||
              senderUserId <= 0
            ) {
              return;
            }

            const recipientUserId =
              Number(
                data?.recipientUserId
              );

            if (
              !Number.isFinite(
                recipientUserId
              ) ||
              recipientUserId <= 0
            ) {
              return;
            }

            const recipientRoom =
              `dm:user:${recipientUserId}`;

            io
              ?.to(recipientRoom)
              .emit(
                "dm:typing",
                {
                  senderUserId,
                  recipientUserId,
                  isTyping:
                    Boolean(
                      data?.isTyping
                    ),
                }
              );
          }
        );

        /*
         * ---------------------------------------------------
         * DISCONNECT
         * ---------------------------------------------------
         */

        socket.on(
          "disconnect",
          (reason) => {
            console.log(
              `[io disconnect] ${socket.id} -> ${reason}`
            );

            removeOnlineUser(
              localUserId,
              socket.id
            );

            broadcastPresence();
          }
        );
      } catch (err) {
        console.log(
          `[Error while socket connection]------> ${err}`
        );

        socket.disconnect(
          true
        );
      }
    }
  );

  return io;
}

export function getIo() {
  return io;
}