'use client'

import React from 'react'
import { forgotPassword, register } from 'payload-auth-plugin/client'
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

const formSchema = z.object({
  email: z.string().min(2).max(50),
})

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    const res = await forgotPassword(
      { name: 'app' },
      {
        email: value.email,
      },
    )
    if (res.isError) {
      toast.error(res.message)
    }
    if (res.isSuccess) {
      toast.success(res.message)
    }
  }
  return (
    <div className="w-full min-h-screen h-full px-24 py-28">
      <div className="space-y-8 w-full max-w-[440px] mx-auto border border-white/40 rounded-xl overflow-hidden p-6">
        <div className="flex items-center justify-center pt-5">
          <h4 className="text-xl font-medium">Forgot Password</h4>
        </div>
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
              <Button type="submit" className="w-full">
                Send Verification Link
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex items-center justify-center pt-5">
          <a href="/auth/signin">Remember your password?</a>
        </div>
      </div>
    </div>
  )
}

export default Page
