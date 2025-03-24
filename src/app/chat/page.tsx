"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Users2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmergencyHQNav } from "@/components/HQDashboard/EmergencyHQNav";
import { CitizenNav } from "@/app/citizen-dashboard/citizen-nav";
import { ResourceManagerNav } from "@/app/resource-manager-dashboard/resource-manager-nav";
import { AdminNav } from "@/app/admin-dashboard/admin-nav";

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

  const getNavComponent = () => {
    if (!user) return null;
    
    console.log("Current user role:", user.role); // Debug log
    const role = user.role?.toLowerCase().trim();
    console.log("Processed role:", role); // Debug log

    switch (role) {
      case 'emergency personnel':
        return <EmergencyHQNav />;
      case 'citizen':
        return <CitizenNav />;
      case 'resource manager':
        return <ResourceManagerNav />;
      case 'administrator':
        return <AdminNav />;
      default:
        console.log("No matching navigation found for role:", role); // Debug log
        return null;
    }
  };

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

  const navComponent = getNavComponent();
  console.log("Nav component rendered:", !!navComponent); // Debug log

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Navigation (25%) */}
      <div className="w-1/4 border-r">
        {navComponent}
      </div>

      {/* Main Content - User List (75%) */}
      <div className="w-3/4 flex flex-col bg-background">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground">Start a conversation with other users</p>
          
          <div className="mt-4">
            <Card className="relative">
              <div className="flex items-center px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 text-muted-foreground">
                <Users2 className="h-12 w-12" />
                <div className="text-center">
                  <p className="font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    className="h-auto p-4 hover:bg-accent"
                    onClick={() => startChat(u.id.toString())}
                  >
                    <div className="flex items-start space-x-4 w-full">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.first_name[0]}
                          {u.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {u.first_name} {u.last_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {u.role}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
} 