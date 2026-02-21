'use client'

import React from 'react'

import { Button } from '@payloadcms/ui'
import { adminAuthClient } from '@/lib/auth'

const AdminLoginViewClient = () => {
  const { oauth } = adminAuthClient.signin()
  
  const handleGoogleSignin = async () => oauth('google')
  const handleAuth0Signin = async () => oauth('auth0')
  const handleMicrosoftSignin = async () => oauth('msft-entra')

  return (
    <div className="w-full h-full bg-red-500">
      <div className="flex flex-col items-start gap-y-4">
        <Button type="button" onClick={handleGoogleSignin}>
          Signin with Google
        </Button>
        <Button type="button" onClick={handleAuth0Signin}>
          Signin with Auth0
        </Button>
        <Button type="button" onClick={handleMicrosoftSignin}>
          Signin with Microsoft
        </Button>
      </div>
    </div>
  )
}

export default AdminLoginViewClient
