'use client'
import React from 'react'
import { signin } from 'payload-auth-plugin/client'
import { Button, Gutter } from '@payloadcms/ui'
import './styles.scss'

export const AdminLogin = () => {
  const { oauth } = signin({ name: 'admin' })

  const handleGoogleSignin = async () => {
    await oauth('google')
  }
  const handleAuth0Signin = async () => {
    await oauth('auth0')
  }
  return (
    <div className="oauth-container">
      <Button type="button" onClick={handleGoogleSignin} className="oauth-btn">
        Signin with Google
      </Button>
      <Button type="button" onClick={handleAuth0Signin} className="oauth-btn">
        Signin with Auth0
      </Button>
    </div>
  )
}
