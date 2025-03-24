"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, ChatSession } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, Paperclip } from "lucide-react";

interface ChatConversationProps {
  chat: ChatSession;
  onChatUpdate: (chat: ChatSession) => void;
}

export default function ChatConversation({
  chat,
  onChatUpdate,
}: ChatConversationProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch messages when chat changes
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${chat.id}/messages/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          // Mark messages as read
          fetch(`/api/chats/${chat.id}/mark_read/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chat.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files?.[0]) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("session", chat.id.toString());
      formData.append("content", newMessage);
      formData.append("message_type", "text");

      if (fileInputRef.current?.files?.[0]) {
        formData.append("attachment", fileInputRef.current.files[0]);
        formData.append("message_type", "file");
      }

      const response = await fetch("/api/chats/messages/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              {chat.initiator.id === user?.id
                ? `${chat.recipient.first_name} ${chat.recipient.last_name}`
                : `${chat.initiator.first_name} ${chat.initiator.last_name}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {chat.status === "active" ? "Active" : "Closed"}
            </p>
          </div>
          {chat.status === "active" && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/chats/${chat.id}/close/`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  if (response.ok) {
                    const updatedChat = await response.json();
                    onChatUpdate(updatedChat);
                  }
                } catch (error) {
                  console.error("Error closing chat:", error);
                }
              }}
            >
              Close Chat
            </Button>
          )}
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender.id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender.id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <div className="space-y-1">
                  <p>{message.content}</p>
                  {message.attachment_url && (
                    <a
                      href={message.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      {message.attachment_name}
                    </a>
                  )}
                  <p className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {chat.status === "active" && (
        <form onSubmit={sendMessage} className="border-t border-border p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={() => sendMessage}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFileSelect}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 