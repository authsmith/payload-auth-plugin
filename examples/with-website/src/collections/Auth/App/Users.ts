import { deleteLinkedAccounts } from 'payload-auth-plugin/collection/hooks'
import { AppUsersAccounts } from './Accounts'
import { withUsersCollection } from 'payload-auth-plugin/collection'
export const AppUsers = withUsersCollection({
  slug: 'appUsers',
  admin: {
    defaultColumns: ['fullName', 'email'],
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
    },
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
    },
  ],
  timestamps: true,
  hooks: {
    afterDelete: [deleteLinkedAccounts(AppUsersAccounts.slug)],
  },
})
