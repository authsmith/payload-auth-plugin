import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { AdminUsers } from '@/collections/Auth/Admin/Users'

import { authPlugin } from 'payload-auth-plugin'
import {
  Auth0AuthProvider,
  GoogleAuthProvider,
  MicrosoftEntraAuthProvider,
  PasswordProvider,
  TwitchAuthProvider,
} from 'payload-auth-plugin/providers'
import { AdminAccounts } from '@/collections/Auth/Admin/Accounts'
import { AppUsers } from '@/collections/Auth/App/Users'
import { AppUsersAccounts } from '@/collections/Auth/App/Accounts'
import { renderForgotPasswordTemplate } from '@/templates/forgot-password'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadCloudPlugin(),
  authPlugin({
    name: 'app',
    allowOAuthAutoSignUp: true,
    usersCollectionSlug: AppUsers.slug,
    accountsCollectionSlug: AppUsersAccounts.slug,
    successRedirectPath: '/',
    errorRedirectPath: '/auth/signin',
    providers: [
      GoogleAuthProvider({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      TwitchAuthProvider({
        client_id: process.env.TWITCH_CLIENT_ID as string,
        client_secret: process.env.TWITCH_CLIENT_SECRET as string,
      }),
      PasswordProvider({
        emailTemplates: {
          forgotPassword: renderForgotPasswordTemplate,
        },
      }),
    ],
  }),
  authPlugin({
    name: 'admin',
    useAdmin: true,
    allowOAuthAutoSignUp: true,
    usersCollectionSlug: AdminUsers.slug,
    accountsCollectionSlug: AdminAccounts.slug,
    successRedirectPath: '/admin',
    errorRedirectPath: '/admin/login',
    providers: [
      GoogleAuthProvider({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      Auth0AuthProvider({
        domain: process.env.AUTH0_DOMAIN as string,
        client_id: process.env.AUTH0_CLIENT_ID as string,
        client_secret: process.env.AUTH0_CLIENT_SECRET as string,
      }),
	  MicrosoftEntraAuthProvider({
		tenant_id: process.env.MSFT_ENTRA_TENANT_ID as string,
		client_id: process.env.MSFT_AUTH_CLIENT_ID as string,
		client_secret: process.env.MSFT_AUTH_CLIENT_SECRET as string,

		skip_email_verification: true,
	  })
    ],
  }),
]
