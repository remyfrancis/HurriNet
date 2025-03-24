export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ChatMessage {
  id: number;
  session: number;
  sender: User;
  message_type: "text" | "image" | "file" | "emergency" | "location";
  content: string;
  attachment?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  created_at: string;
  read: boolean;
}

export interface ChatSession {
  id: number;
  initiator: User;
  recipient: User;
  status: "active" | "closed" | "blocked";
  created_at: string;
  updated_at: string;
  closed_at?: string;
  latest_message?: ChatMessage;
  unread_count: number;
} 