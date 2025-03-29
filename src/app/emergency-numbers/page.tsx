'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Phone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { EmergencyHQNav } from '../../components/HQDashboard/EmergencyHQNav';
import { CitizenNav } from '../citizen-dashboard/citizen-nav';
import { ResourceManagerNav } from '../resource-manager-dashboard/resource-manager-nav';
import { AdminNav } from '../admin-dashboard/admin-nav';

interface EmergencyContact {
  id: number;
  organization: string;
  phoneNumber: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export default function EmergencyNumbers() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState({
    organization: '',
    phoneNumber: '',
    address: ''
  });

  const canModifyContacts = user?.role?.toLowerCase() === 'administrator' || 
                           user?.role?.toLowerCase() === 'emergency personnel';

  const getNavComponent = () => {
    if (!user) return null;
    
    const role = user.role?.toLowerCase().trim();

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
        return null;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load emergency contacts",
        variant: "destructive",
      });
    }
  };

  const handleAddContact = async () => {
    if (newContact.organization && newContact.phoneNumber) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organization: newContact.organization,
            phone_number: newContact.phoneNumber,
            address: newContact.address,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add contact');
        }

        await fetchContacts();
        setOpen(false);
        setNewContact({ organization: '', phoneNumber: '', address: '' });
        toast({
          title: "Success",
          description: "Emergency contact added successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add emergency contact",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditContact = async (contact: EmergencyContact) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${contact.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: contact.organization,
          phone_number: contact.phoneNumber,
          address: contact.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      await fetchContacts();
      setEditingContact(null);
      toast({
        title: "Success",
        description: "Emergency contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update emergency contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete contact');
        }

        await fetchContacts();
        toast({
          title: "Success",
          description: "Emergency contact deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete emergency contact",
          variant: "destructive",
        });
      }
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="flex min-h-screen">
      {getNavComponent()}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
            {canModifyContacts && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Phone className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Emergency Contact</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Input
                        id="organization"
                        placeholder="Organization Name"
                        value={newContact.organization}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewContact({ ...newContact, organization: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={newContact.phoneNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewContact({ ...newContact, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="address"
                        placeholder="Address"
                        value={newContact.address}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewContact({ ...newContact, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact}>
                      Add Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{contact.organization}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCall(contact.phoneNumber)}
                      className="h-8 w-8"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    {canModifyContacts && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditingContact(contact)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="text-sm text-muted-foreground">
                      📞 {contact.phoneNumber}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span>📍</span> {contact.address}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingContact && (
            <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Input
                      id="edit-organization"
                      placeholder="Organization Name"
                      value={editingContact.organization}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        setEditingContact({ ...editingContact, organization: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="edit-phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={editingContact.phoneNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        setEditingContact({ ...editingContact, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="edit-address"
                      placeholder="Address"
                      value={editingContact.address}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        setEditingContact({ ...editingContact, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingContact(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleEditContact(editingContact)}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
}
