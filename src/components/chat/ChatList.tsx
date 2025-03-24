"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatSession, User } from "@/types/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
  onChatsUpdate: (chats: ChatSession[]) => void;
}

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onChatsUpdate,
}: ChatListProps) {
  const { user } = useAuth();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query) {
      setAvailableUsers([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search/?q=${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const startNewChat = async (recipientId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ recipient: recipientId }),
      });

      if (response.ok) {
        const newChat = await response.json();
        onChatsUpdate([newChat, ...chats]);
        onSelectChat(newChat);
        setIsNewChatOpen(false);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-border">
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">New Chat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => startNewChat(user.id)}
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-start">
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {chats.map((chat) => {
            const otherUser =
              chat.initiator.id === user?.id ? chat.recipient : chat.initiator;
            return (
              <Button
                key={chat.id}
                variant={selectedChat?.id === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex flex-col items-start space-y-1 w-full">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium">
                      {otherUser.first_name} {otherUser.last_name}
                    </span>
                    {chat.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                    <span className="truncate max-w-[150px]">
                      {chat.latest_message?.content || "No messages yet"}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(chat.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
} 