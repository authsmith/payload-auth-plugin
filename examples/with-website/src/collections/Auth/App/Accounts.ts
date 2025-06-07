import { withAccountCollection } from 'payload-auth-plugin/collection'
export const AppUsersAccounts = withAccountCollection(
  {
    slug: 'appUserAccounts',
  },
  'appUsers',
)
