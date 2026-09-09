export type ChatUser = {
  id: number;

  displayName: string | null;
  handle: string | null;
  avatarUrl: string | null;

  lastMessage: string | null;
  lastMessageImageUrl: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: number | null;

  hasConversation: boolean;
};

export type DirectMessage = {
  id: number;

  senderUserId: number;
  recipientUserId: number;

  body: string | null;
  imageUrl: string | null;

  createdAt: string;

  sender: {
    displayName: string | null;
    handle: string | null;
    avatarUrl: string | null;
  };

  recipient: {
    displayName: string | null;
    handle: string | null;
    avatarUrl: string | null;
  };
};

export type RawDirectMessage =
  Record<string, any>;

export function mapChatUser(
  r: any
): ChatUser {
  return {
    id: Number(r.id),

    displayName:
      r.displayName ??
      r.display_name ??
      null,

    handle:
      r.handle ??
      null,

    avatarUrl:
      r.avatarUrl ??
      r.avatar_url ??
      null,

    lastMessage:
      r.lastMessage ??
      r.last_message ??
      null,

    lastMessageImageUrl:
      r.lastMessageImageUrl ??
      r.last_message_image_url ??
      null,

    lastMessageAt:
      r.lastMessageAt ??
      r.last_message_at ??
      null,

    lastMessageSenderId:
      r.lastMessageSenderId !==
        undefined &&
      r.lastMessageSenderId !==
        null
        ? Number(
            r.lastMessageSenderId
          )
        : r.last_message_sender_id !==
            undefined &&
          r.last_message_sender_id !==
            null
        ? Number(
            r.last_message_sender_id
          )
        : null,

    hasConversation:
      Boolean(
        r.hasConversation ??
          r.has_conversation
      ),
  };
}

export function mapDirectMessage(
  r: RawDirectMessage
): DirectMessage {
  return {
    id: Number(r.id),

    senderUserId: Number(
      r.senderUserId ??
        r.sender_user_id
    ),

    recipientUserId: Number(
      r.recipientUserId ??
        r.recipient_user_id
    ),

    body:
      r.body ?? null,

    imageUrl:
      r.imageUrl ??
      r.image_url ??
      null,

    createdAt:
      r.createdAt ??
      r.created_at,

    sender: {
      displayName:
        r.sender?.displayName ??
        r.sender_display_name ??
        null,

      handle:
        r.sender?.handle ??
        r.sender_handle ??
        null,

      avatarUrl:
        r.sender?.avatarUrl ??
        r.sender_avatar ??
        null,
    },

    recipient: {
      displayName:
        r.recipient?.displayName ??
        r.recipient_display_name ??
        null,

      handle:
        r.recipient?.handle ??
        r.recipient_handle ??
        null,

      avatarUrl:
        r.recipient?.avatarUrl ??
        r.recipient_avatar ??
        null,
    },
  };
}

export function mapDirectMessagesResponse(
  res: unknown
): DirectMessage[] {
  const rawList =
    Array.isArray(res)
      ? res
      : Array.isArray(
          (res as any)?.data
        )
      ? (res as any).data
      : [];

  return (
    rawList as RawDirectMessage[]
  ).map(
    mapDirectMessage
  );
}