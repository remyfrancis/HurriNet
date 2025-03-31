'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createAlert } from '@/app/admin/alerts/actions'
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  severity: z.enum(["High", "Medium", "Low"]),
  district: z.enum([
    "All",
    "Castries",
    "Gros Islet",
    "Vieux Fort",
    "Soufriere",
    "Micoud",
    "Dennery",
    "Laborie",
    "Choiseul",
    "Anse La Raye",
    "Canaries"
  ]),
})

type CreateAlertModalProps = {
  onCreateAlert: (alert: any) => void
}

export function CreateAlertModal({ onCreateAlert }: CreateAlertModalProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      severity: "Low",
      district: "All",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to create alerts",
        variant: "destructive",
      })
      return
    }

    const result = await createAlert({
      ...values,
      active: true,
    }, token)

    if (result.success) {
      toast({
        title: "Success",
        description: "Alert created successfully",
      })
      form.reset()
      setOpen(false)
      if (onCreateAlert) {
        onCreateAlert(result.alert)
      }
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create alert",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Alert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alert title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alert type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All Districts</SelectItem>
                      <SelectItem value="Castries">Castries</SelectItem>
                      <SelectItem value="Gros Islet">Gros Islet</SelectItem>
                      <SelectItem value="Vieux Fort">Vieux Fort</SelectItem>
                      <SelectItem value="Soufriere">Soufriere</SelectItem>
                      <SelectItem value="Micoud">Micoud</SelectItem>
                      <SelectItem value="Dennery">Dennery</SelectItem>
                      <SelectItem value="Laborie">Laborie</SelectItem>
                      <SelectItem value="Choiseul">Choiseul</SelectItem>
                      <SelectItem value="Anse La Raye">Anse La Raye</SelectItem>
                      <SelectItem value="Canaries">Canaries</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Create Alert</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}