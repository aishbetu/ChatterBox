import api from "./axios";

export interface ChatUser {
  _id: string;
  username: string;
  email: string;
  lastMessage?: {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  unreadCount: number;
}


export interface FetchUsersResponse {
  message: string;
  users: ChatUser[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface FetchMessagesResponse {
  message: string;
  messages: ChatMessage[];
}

/**
 * Fetch all users (except self) with their last message and unread count
 */
export function fetchChatUsers() {
  return api
    .get<FetchUsersResponse>('/chat/users')
    .then(res => res.data.users);
}

/**
 * Fetch paginated messages between current user and `otherUserId`
 */
export function fetchMessagesWithUser(userId: string) {
  return api
    .get<FetchMessagesResponse>(`/chat/messages/${userId}`)
    .then(res => res.data.messages);
}

