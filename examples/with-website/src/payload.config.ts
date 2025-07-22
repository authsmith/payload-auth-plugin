// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'node:path'
import { buildConfig, type PayloadRequest } from 'payload'
import { fileURLToPath } from 'node:url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { AdminUsers } from './collections/Auth/Admin/Users'
import { AdminAccounts } from './collections/Auth/Admin/Accounts'
import { AppUsers } from './collections/Auth/App/Users'
import { AppUsersAccounts } from './collections/Auth/App/Accounts'
import { resendAdapter } from '@payloadcms/email-resend'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    // routes: {
    //   login: '/auth/signin',
    // },
    components: {
      afterLogin: ['@/components/AfterLogin/index#AdminLogin'],
      views: {
        login: {
          Component: '@/views/AdminLogin/index#AdminLoginView',
          path: '/auth/signin',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: AdminUsers.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: process.env.DATABASE_URI.startsWith("mongodb") ? mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }) : postgresAdapter({
	pool: {
		connectionString: process.env.DATABASE_URI || '',
	}
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    AdminUsers,
    AdminAccounts,
    AppUsers,
    AppUsersAccounts,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  email: resendAdapter({
    defaultFromAddress: 'delivered@resend.dev',
    defaultFromName: 'AuthSmith',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
