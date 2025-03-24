// Simple in-memory store for messages
interface Message {
  id: number;
  content: string;
  sender_id: number;
  chat_session_id: number;
  timestamp: string;
}

interface ChatSession {
  id: number;
  sender_id: number;
  recipient_id: number;
  messages: Message[];
}

class MessageStore {
  private chatSessions: Map<number, ChatSession> = new Map();
  private messageIdCounter: number = 1;
  private sessionIdCounter: number = 1;

  createChatSession(sender_id: number, recipient_id: number): ChatSession {
    const session: ChatSession = {
      id: this.sessionIdCounter++,
      sender_id,
      recipient_id,
      messages: []
    };
    this.chatSessions.set(session.id, session);
    return session;
  }

  getChatSession(id: number): ChatSession | undefined {
    return this.chatSessions.get(id);
  }

  getChatSessions(userId: number): ChatSession[] {
    return Array.from(this.chatSessions.values()).filter(
      session => session.sender_id === userId || session.recipient_id === userId
    );
  }

  addMessage(sessionId: number, content: string, sender_id: number): Message | null {
    const session = this.chatSessions.get(sessionId);
    if (!session) return null;

    const message: Message = {
      id: this.messageIdCounter++,
      content,
      sender_id,
      chat_session_id: sessionId,
      timestamp: new Date().toISOString()
    };

    session.messages.push(message);
    return message;
  }

  getMessages(sessionId: number): Message[] {
    return this.chatSessions.get(sessionId)?.messages || [];
  }

  // Helper method to check if a user is part of a chat session
  isUserInSession(sessionId: number, userId: number): boolean {
    const session = this.chatSessions.get(sessionId);
    if (!session) return false;
    return session.sender_id === userId || session.recipient_id === userId;
  }
}

// Create a singleton instance
const messageStore = new MessageStore();
export default messageStore; 