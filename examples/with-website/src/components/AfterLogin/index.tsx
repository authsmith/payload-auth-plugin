'use client'

import './styles.scss'

import { adminAuthClient } from '@/lib/auth'
import { Button } from '@payloadcms/ui'

export const AdminLogin = () => {
  const { oauth } = adminAuthClient.signin()

  const handleGoogleSignin = async () => oauth('google')
  const handleAuth0Signin = async () => oauth('auth0')
  const handleMicrosoftSignin = async () => oauth('msft-entra')
  const handleRobloxSignin = async () => oauth('roblox')

  return (
    <div className="oauth-container">
      <Button type="button" onClick={handleGoogleSignin} className="oauth-btn">
        Signin with Google
      </Button>
      <Button type="button" onClick={handleAuth0Signin} className="oauth-btn">
        Signin with Auth0
      </Button>
      <Button type="button" onClick={handleMicrosoftSignin} className="oauth-btn">
        Signin with Microsoft
      </Button>
      <Button type="button" onClick={handleRobloxSignin} className="oauth-btn">
        Signin with Roblox
      </Button>
    </div>
  )
}
