'use client'

import React from 'react'
import { register } from 'payload-auth-plugin/client'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const signupFormSchema = z.object({
  email: z.string().min(2).max(50),
  password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

const Page = () => {
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  })

  const { password } = register({ name: 'app' })

  const handleSignup = async (value: z.infer<typeof signupFormSchema>) => {
    const res = await password({
      email: value.email,
      password: value.password,
      userInfo: {
        first_name: value.first_name,
        last_name: value.last_name,
      },
      allowAutoSignin: true,
    })
    if (res.isError) {
      toast.error(res.message)
    }
  }
  return (
    <div className="w-full min-h-screen h-full px-24 py-28">
      <div className="space-y-8 w-full max-w-[440px] mx-auto">
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-8">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
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
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Page
