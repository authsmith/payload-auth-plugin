'use client'

import React from 'react'
import { forgotPassword, recoverPassword, register } from 'payload-auth-plugin/client'
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
import { useRouter, useSearchParams } from 'next/navigation'

const formSchema = z
  .object({
    password: z.string().min(4),
    confirmPassword: z.string().min(4),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      })
    }
  })

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('restore_code')

  if (!code) {
    return null
  }

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    const res = await recoverPassword(
      { name: 'app' },
      {
        password: value.password,
        code,
      },
    )
    if (res.isError) {
      toast.error(res.message)
    }
    if (res.isSuccess) {
      toast.success(res.message)
      setTimeout(() => {
        router.push('/auth/signin')
      }, 500)
    }
  }
  return (
    <div className="w-full min-h-screen h-full px-16 py-28">
      <div className="space-y-8 w-full max-w-[440px] mx-auto border border-white/40 rounded-xl overflow-hidden p-6">
        <div className="flex items-center justify-center pt-2">
          <h4 className="text-xl font-medium">Restore Password</h4>
        </div>
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Restore Password
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Page
