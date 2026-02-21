# Changelog

All notable changes to this project will be documented in this file.

## [0.7.5] - 2026-02-21

### 🚀 Features

- *(oauth)* Add support for additional scope in oauth flow
- *(oauth)* Add additionalScope parameter to OAuthHandlers
- *(oauth)* Add refresh_token and expires_in fields to oauth flow
- Added claims to users
- Using ciamlogin.com instead of .microsoftonline.com as the latter only supports work and school accounts. Microsoft Entra uses ciamlogin.com for everything

### 🐛 Bug Fixes

- *(password)* Correct typo in variable name isVerified
- Add support for payload auth cookie settings to be added to the token.
- Missing claims:w

### ⚙️ Miscellaneous Tasks

- Release v0.7.4
- Added Microsoft example
- Added support for postgres in example
- Deleted examples/with-website/start_db.sh
- Cleanup
- Cleanup

## [0.7.4] - 2025-07-19

### 🚀 Features

- Add access_token support for oauth authentication

### 🐛 Bug Fixes

- Include name in user creation data for OAuth auto sign-up
- Make use of sessions

### ⚙️ Miscellaneous Tasks

- Update example

## [0.7.3] - 2025-06-27

### 🚀 Features

- Adds option to override the default scope

### 🐛 Bug Fixes

- Update success redirection URL to use server configuration
- Use lower cased email
- Type

### ⚙️ Miscellaneous Tasks

- Release v0.7.2
- Prepare 0.7.3

## [0.7.2] - 2025-06-23

### 🐛 Bug Fixes

- Error type
- Updates validation pattern
- Updates validation pattern

### 📚 Documentation

- Updated jsdoc

## [0.7.1] - 2025-06-15

### 🐛 Bug Fixes

- Changes redirection to function call

### ⚙️ Miscellaneous Tasks

- Release v0.7.0
- Env
- Release v0.7.1

## [0.7.0] - 2025-06-15

### 🚀 Features

- Auth plugin config and session
- Oauth new response
- Pass metadata
- Add Okta ODIC support
- Adds oauth options
- Adds password template flow
- Adds signout

### 🐛 Bug Fixes

- Shift session
- Rm auth strategy
- Merge clients
- Merge config
- Change status code
- Oauth response
- Add password on auto signup
- Check collection auth
- Fields
- Expire
- Use hook
- Oauth flow
- ClientOrigin
- Session client origin name
- Use redirections
- Collection config
- Password
- Password
- Password
- Ssr session
- Client session
- Render type
- Client config
- Client config

### 💼 Other

- Rename field
- Change option name
- Use redirect only

### ⚙️ Miscellaneous Tasks

- Cleanup
- Cleanup
- Example
- Fix config
- Fix collection
- Custom route and view
- Cleanup
- Send success
- Rm lock
- Cleanup
- Updated env
- Ui
- Fmt

## [0.6.4] - 2025-03-21

### 🐛 Bug Fixes

- Make calls async

### ⚙️ Miscellaneous Tasks

- Release
- Logs

## [0.6.3] - 2025-03-21

### 🐛 Bug Fixes

- Oauth workflow

### ⚙️ Miscellaneous Tasks

- Release
- Logs

## [0.6.2] - 2025-03-20

### 🐛 Bug Fixes

- Typo
- Docs and typos
- Dynamic user slug

### ⚙️ Miscellaneous Tasks

- Logs
- Release

## [0.6.1] - 2025-03-20

### 🚀 Features

- Example

### 🐛 Bug Fixes

- Make fields optional
- Dynamic user slug
- Rm example

### ⚙️ Miscellaneous Tasks

- Cleanup
- Use plugin
- Release

## [0.6.0] - 2025-03-17

### 🚀 Features

- App plugin
- Updated endpoint strategy
- Use new endpoint strategy
- New provider utils
- Adds endpoints
- Cli
- All the basic implementations
- Deps installer
- Create accounts collection
- Admin plugin init process
- Added instruction
- Collection process
- All init process
- Local config
- Transform plugin
- Adds transform plugin
- Update imports
- Sub-cmd
- Slugifier
- App session
- Updates client func
- Updates client func
- Oauth session
- Collections preflight
- New error kind
- New exceptions
- New callbacks
- OnSuccess payload updates
- Creds signin
- Adding JumpCloud provider
- Add support for `client_secret_basic` client auth type.
- New error type
- Session for app
- Oaut app session
- Adds redirection util
- Adds refresh lops
- Signup
- Signup
- Error
- Pw util
- Cred signin
- Password recovery
- Twitch provider
- Collections and hooks
- Current user session

### 🐛 Bug Fixes

- Add support for non standard api path in signin function
- Make executable
- Rm collection setup
- Spinner
- Use consola
- Use new looger
- Path join
- Update const
- Message
- Type
- Params
- Adds missing property
- Adds missing forward slash
- Use plugin type
- Callback
- Use inbuilt error
- Base implementation
- Client config
- Bug where none utc times would cause the cookie to not be set by browsers
- Provider config
- Signin options
- Preflight collections
- Env preflight
- Use secrets
- Rm search params
- Use jose
- Session creations
- Refresh process
- Rm baseURL opts
- Rm dependency
- Error response
- Export cred provider
- Session response
- Env
- Signin
- Output
- Adds callback
- Refresh response
- Missing file
- Args
- Rename to password
- Rename to password
- Verification
- Config
- Response updates
- Config

### 💼 Other

- File and func name
- Move files
- Moves cli to https://github.com/authsmith/cli
- Password reset

### 📚 Documentation

- Updates JSDoc
- Provider doc
- Updated

### ⚙️ Miscellaneous Tasks

- Type changes
- Type changes
- Type changes
- Cleanup
- Setup workspace
- Dep updated
- Changes scripts
- Fmt
- Script updates
- Fix cli meta
- Comments
- Cleanup
- Scripts updated
- Script
- Cleanup
- Cleanup
- Cleanup
- Fmt
- Converts to arrow func.
- Rename var
- Info
- User arrow func
- Cleanup
- Format
- New keyword
- Release
- Change log created

## [0.5.8] - 2025-02-10

### 🐛 Bug Fixes

- Export types

### ⚙️ Miscellaneous Tasks

- Release v0.5.8
- Release v0.5.8

## [0.5.7] - 2025-02-09

### 🐛 Bug Fixes

- Ownership
- Force lowercased emails
- Type name

### 📚 Documentation

- Updates

## [0.5.6] - 2025-01-28

### 🐛 Bug Fixes

- Pass response mode param
- Use params

### ⚙️ Miscellaneous Tasks

- Release v0.5.6
- Update changelogs

## [0.5.5] - 2025-01-23

### ⚙️ Miscellaneous Tasks

- Release v0.5.5
- Release logs

## [0.5.4] - 2025-01-23

### 🐛 Bug Fixes

- Use UTC

### 💼 Other

- Format code

### ⚙️ Miscellaneous Tasks

- Update changelog
- Changes keyword
- Release v0.5.4
- Fix script
- Release logs

## [0.5.3] - 2025-01-21

### 🐛 Bug Fixes

- Client secret is not always required

### 💼 Other

- File name

### ⚙️ Miscellaneous Tasks

- Release v0.5.2
- Adds changelog conf
- Adds provider names
- Bump version

## [0.5.2] - 2025-01-21

### 📚 Documentation

- Update docs

### ⚙️ Miscellaneous Tasks

- Release v0.5.1

## [0.5.1] - 2025-01-18

### 🚀 Features

- Update package config to use bun
- Changeset

### 🐛 Bug Fixes

- Update exports

### 💼 Other

- Format code
- Format code

## [0.5.0] - 2025-01-18

### 🚀 Features

- Allow user signup
- Passkey registration
- Adds passkey provider
- Adds missing browser deps
- New error type
- Allow availabel providers
- Passkey provider
- Client side for passkey
- New err
- Update protocols
- New hash logic
- New account fields
- New error
- Passkey reg
- Passkey auth flow
- Apple auth
- Last setup
- Supports both alg from Apple
- Add successPath config option

### 🐛 Bug Fixes

- Rm app config
- Endpoints config
- Rm status code and imporve message
- Rm use config server URL
- Use email
- Update types
- Field name
- Hashin logic
- Redirect URL
- Signin method
- Rm nextjs and react
- Redirection
- Update to v0.5.0
- Use cutom success path
- Added type and keywords
- Create user password
- Allow user signup using passkey
- Update access
- Rm custom cookie parser

### 💼 Other

- Rename route
- Cleanup
- Updated dir
- Console error file
- Update naming conventions
- Passkey methods

### 📚 Documentation

- Update doc
- Update readme

### ⚙️ Miscellaneous Tasks

- Dep updates
- Cleanup
- Fmt
- Cleanup
- Rm unused scripts
- Cleanup
- Added keywords
- Release v0.5.0

## [0.4.3] - 2025-01-01

### 🐛 Bug Fixes

- Version

### ⚙️ Miscellaneous Tasks

- Release v0.4.3

## [0.4.2] - 2025-01-01

### 📚 Documentation

- Updated
- Updated

### ⚙️ Miscellaneous Tasks

- Release v0.4.2

## [0.4.1] - 2024-12-31

### 🚀 Features

- Adds auth0 provider
- Adds auth0 provider
- Update example
- Adds cognito provider
- Keycloak
- Updates account options

### 🐛 Bug Fixes

- Issuer url
- Use slug from config
- Type
- Format

### 💼 Other

- Re-organize

### ⚙️ Miscellaneous Tasks

- Cleanup
- Bump version
- Bump version
- Add missing type
- Rm examples dir
- Rm type
- Enable publish
- Release v0.4.1

## [0.4.0] - 2024-11-29

### 🚀 Features

- Updates error handling
- New implementation
- Adds check for base url in env

### 🐛 Bug Fixes

- Create base type and rm error type
- Update implementation
- Remove cookies

### ⚙️ Miscellaneous Tasks

- Bump
- Update doc
- Release v0.4.0

## [0.3.2] - 2024-09-24

### ⚙️ Miscellaneous Tasks

- Release v0.3.2
- Fix change
- Release v0.3.2

## [0.3.1] - 2024-09-24

### ⚙️ Miscellaneous Tasks

- Release v0.3.1

## [0.3.0] - 2024-09-24

### 🚀 Features

- Adds facebook provider
- Adds slack provider
- Update export
- Adds client functions
- Update build conf

### 🐛 Bug Fixes

- Ignore example files
- Replace next cookies with header cookies
- Dev script
- Adds missing payload ui
- Update to support importMap
- Issuer type
- Issuer type
- Build outputs
- Spin up latest payload example app
- Issuer type
- Add root
- Rm async
- Error handling
- Rm jsx components
- Export
- Updates example

### 📚 Documentation

- Update providers
- Adds contributing guide
- Adds contributing guide
- Adds local env instruction
- Adds instructions to run the example app

### ⚙️ Miscellaneous Tasks

- Update deps
- Update deps and scripts
- Cleanup
- Release v0.2.1
- Release v0.3.0
- Release v0.3.0

## [0.2.0] - 2024-07-26

### 🚀 Features

- Add package meta data
- Github provider
- Delegate protocol auth, cb and session
- Adds new providers
- Add auth components
- Provider integrations
- Update ts config and clinet implementation
- Add error redirections
- Adds bundler config
- Release
- Beta release conf
- Beta workflow
- Adds example app
- Adds discord
- Adds providers

### 🐛 Bug Fixes

- Use oidc conventions
- Cookie read
- Use user provided scope
- PackageManager version
- Plugin version
- Payload dep mismatch
- Use dynamic path and use algorthim specific config
- Use dynamic path and use algorthim specific config
- Missing types
- Add generic provider type
- Typow
- Syntax
- Exports
- Cleanup URL
- Form action
- Payload breaking changes
- Changes package manager and adds esbuild
- Changes css import strategy
- Plugin param type
- Changes action event and node version
- Package manager
- Install package manager
- Css path
- Missing deps
- Changes access
- Error format
- Margin
- Duplicate scripts
- Config
- Conf
- Conf
- Conf
- Registry
- Missing step
- Workflow trigger
- Changes provider types and adds profile callback
- Button spacing

### 💼 Other

- Endpoints
- Rename files

### 📚 Documentation

- Provider updates
- Add alert
- Update roadmap
- Update doc
- Add content
- Update provider setup
- Missing usage
- Update

### ⚙️ Miscellaneous Tasks

- Updated readme
- Update deps
- Cleanup
- Cleanup
- Adds guide and basic information
- Cleanup
- Config update
- Add metadata
- Cleanup
- Cleanup
- Cleanup
- Rename package
- Rename package
- Change versioning
- Change versioning
- Version updated
- Rm beta script
- Update workflow
- Cleanup
- Update workflow
- Rm paackage type
- Cleanup
- Release v0.2.0

<!-- generated by git-cliff -->
