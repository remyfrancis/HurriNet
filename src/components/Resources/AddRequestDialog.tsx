'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const requestFormSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  location: z.string().min(1, "Location is required"),
})

export function AddRequestDialog({ onRequestAdded }: { onRequestAdded: () => void }) {
  const [open, setOpen] = useState(false)
  
  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      item: "",
      quantity: "",
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof requestFormSchema>) {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource-management/requests/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          status: "Pending"
        })
      })

      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to add request')
      }

      setOpen(false)
      form.reset()
      onRequestAdded()
    } catch (error) {
      console.error('Error adding request:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Water bottles, First aid kits, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Delivery location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}