'use client'

import React from 'react'
import { signin } from "payload-auth-plugin/client"
import { useRouter } from 'next/navigation'
import { Button, toast } from '@payloadcms/ui'

const Page = () => {
    const router = useRouter()

    const { oauth } = signin({ name: "app" })

    const handleGoogleSignin = async () => {
        const { isError, isSuccess, message } = await oauth("google", {
            firstName: "Sourab",
            lastName: "Pramanik"
        })
        if (isSuccess) {
            toast.success(message)
            router.push("/private")
        }
        if (isError) {
            toast.error(message)
        }
    }
    return (
        <div className='w-full h-full bg-red-500'>
            <div className='flex flex-col items-start gap-y-4'>
                <Button type="button" onClick={handleGoogleSignin}>
                    Signin with Google
                </Button>
            </div>
        </div>
    )
}

export default Page