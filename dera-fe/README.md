# Dera Frontend Service

Dera Frontend is a Next.js web application.

## Running it locally

### 1. Set up Clerk Authentication

Dera uses [Clerk](https://clerk.com/) for user authentication. You need to create an account with Clerk if you do not already have one.

#### Create an application for Dera in Clerk

Create an application for Dera by following these instructions:

1. Login to [Clerk](https://dashboard.clerk.com/)
2. Add an application.
3. Take note of the application keys which you will need for the environment variables.
4. Go to Organization Settings and enable organizations

#### Custom JWT Template

Dera uses a custom JWT template that has certain claims in it. You'll need to create the custom template by following these instructions:

1. Login to [Clerk](https://dashboard.clerk.com/)
2. Go to the application that you have created for Dera (or create a new one if you have not done so).
3. Go to **JWT Templates > New template**.
4. Give the template a meaningful name. You will need this name for the environment variables. Optionally, set a token lifetime value. The default is 60 seconds.
5. Copy and paste the following into the `claims` section and save it:

```
{
	"org_id": "{{org.id}}",
	"org_role": "{{org.role}}",
	"org_slug": "{{org.slug}}",
	"org_memberships": "{{user.organizations}}",
	"org_permissions": "{{org_membership.permissions}}"
}
```

### 2. Set up environment variables

Make a copy of [sample.env](./sample.env) and name it `.env`. Update the values in `.env` accordingly.

### 3. Install dependencies

Run `yarn --frozen-lockfile`.

### 4. Run it

- In development: `yarn dev`.
- In production: First, build the app with `yarn build`. Next, run it with `yarn start`.
