"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Fetch available users when component mounts
    const fetchUsers = async () => {
      if (!token) {
        console.error("No token available");
        toast({
          title: "Authentication Error",
          description: "Please log in to access chat features.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        // Make sure token is in the correct format
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log("Fetching users with token:", authToken.substring(0, 20) + "...");
        
        const response = await fetch("/api/users", {
          headers: {
            Authorization: authToken,
          },
        });

        const contentType = response.headers.get("content-type");
        console.log("Response content type:", contentType);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = await response.text();
          }
          console.error("Failed to fetch users:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          toast({
            title: "Error",
            description: typeof errorData === 'object' ? errorData.error : "Failed to load users",
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        console.log("Received users:", data);
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchUsers();
    }
  }, [user, token, toast]);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || u.email.toLowerCase().includes(query);
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const startChat = async (userId: string) => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to start a chat",
          variant: "destructive",
        });
        return;
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log("Creating chat session with user:", userId);
      
      const response = await fetch("/api/chats/sessions", {
        method: "POST",
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient: parseInt(userId, 10) }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to start chat:", error);
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive",
        });
        return;
      }

      const chatSession = await response.json();
      console.log("Created chat session:", chatSession);
      
      if (!chatSession || !chatSession.id) {
        console.error("Invalid chat session response:", chatSession);
        toast({
          title: "Error",
          description: "Invalid chat session response",
          variant: "destructive",
        });
        return;
      }

      router.push(`/chat/${chatSession.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  if (!user || !token) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <p className="text-muted-foreground">Please log in to access chat features</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <Button
                key={u.id}
                variant="ghost"
                className="w-full justify-start p-4"
                onClick={() => startChat(u.id.toString())}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {u.first_name} {u.last_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {u.email} • {u.role}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
} 