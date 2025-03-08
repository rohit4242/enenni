"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { useAuth } from "@/context/AuthContext";
// Updated schema to include optional fields for user data
const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .min(1, { message: "This field cannot be empty." })
    .email("This is not a valid email."),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Define a type for the current user
interface CurrentUser {
  name?: string
  email?: string
}

export function ProfileForm() {
  // Annotate user with the defined type (or null if not available) and cast the result
  const { user } = useAuth();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.name || "",
      email: user?.email || "",
      bio: "I own a computer.",
    },
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    // Here you would typically send the data to your server
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder={user?.name || ""} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder={user?.email || ""} />
              </FormControl>
              <FormDescription>
                Your email address will not be shared publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="I am a software engineer"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can write a short bio about yourself. This will be displayed on your
                profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
