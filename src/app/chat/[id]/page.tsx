"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  read: boolean;
}

interface ChatSession {
  id: number;
  initiator: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  recipient: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdsRef = useRef<Set<number>>(new Set());

  // Mark messages as read
  const markMessagesAsRead = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ mark_read: true }));
    }
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markMessagesAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle window focus
  useEffect(() => {
    const handleFocus = () => {
      markMessagesAsRead();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      markMessagesAsRead();
    }
  };

  // Fetch chat session and messages
  const fetchChatData = async () => {
    if (!token) return;

    try {
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Fetch chat session
      const sessionResponse = await fetch(`/api/chats/sessions/${params.id}`, {
        headers: {
          Authorization: authToken,
        },
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to fetch chat session");
      }

      const sessionData = await sessionResponse.json();
      setSession(sessionData);

      // Fetch messages
      const messagesResponse = await fetch(`/api/chats/messages?session=${params.id}`, {
        headers: {
          Authorization: authToken,
        },
      });

      if (!messagesResponse.ok) {
        throw new Error("Failed to fetch messages");
      }

      const messagesData = await messagesResponse.json();
      // Update messageIdsRef with existing message IDs
      messageIdsRef.current = new Set(messagesData.map((m: Message) => m.id));
      setMessages(messagesData);
      setIsLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching chat data:", error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  // Initialize WebSocket connection
  const initWebSocket = () => {
    if (!token) return;

    const authToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/chat/${params.id}/?token=${authToken}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Mark messages as read when connection is established
      markMessagesAsRead();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.action === "new_message") {
        const message = data.message;
        if (!messageIdsRef.current.has(message.id)) {
          messageIdsRef.current.add(message.id);
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
          // Mark message as read if we're the recipient
          if (message.sender.id !== user?.id) {
            ws.send(JSON.stringify({ mark_read: true }));
          }
        }
      } else if (data.action === "messages_read") {
        // Update read status for all messages when the other user reads them
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender.id === user?.id ? { ...msg, read: true } : msg
          )
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Error",
        description: "WebSocket connection error",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Try to reconnect after 3 seconds
      setTimeout(initWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newMessage.trim() || !wsRef.current) return;

    try {
      // Send message through WebSocket
      wsRef.current.send(JSON.stringify({ message: newMessage.trim() }));
      // Clear input after sending
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchChatData();
      initWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, token, params.id]);

  if (!user || !token) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please log in to access chat</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  const otherUser = session?.initiator.id === user.id ? session?.recipient : session?.initiator;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Chat Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          {otherUser?.first_name} {otherUser?.last_name}
        </h2>
        <p className="text-sm text-muted-foreground">{otherUser?.email}</p>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender.id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender.id === user.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <div className="flex items-center justify-between text-xs mt-1 opacity-70">
                  <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                  {message.sender.id === user.id && (
                    <span className="ml-2">
                      {message.read ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
} 