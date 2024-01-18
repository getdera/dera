# Dera Backend Service

Dera Backend is a NestJS web service.

## Dependencies

In addition to the npm dependencies in `package.json`, Dera Backend uses

- [Postgres](https://www.postgresql.org/) for its application database
- [Flyway](https://flywaydb.org/) to handle database migrations
- [Clerk](https://clerk.com/) for user authentication
- [Neon](https://neon.tech/) for its users' embeddings

### Set up Postgres database

Make sure you have Postgres installed. Create a database for Dera application. The following values are the defaults that have been coded in the sample environment and Flyway configuration files. If you choose to use different values, remember to update those files. Default values:

```
DERA_DB_HOST=localhost
DERA_DB_PORT=5432
DERA_DB_NAME=dera
DERA_DB_USER_NAME=dera
DERA_DB_USER_PW=dera
```

Login to the database and create a schema for the user: `create schema dera authorization dera;`.

### Set up flyway

1. Install Flyway CLI tool.
2. Make a copy of [sample.flyway.conf](./sample.flyway.conf) and update the values if necessary.

### Set up Clerk Authentication

Refer to [Dera FE's README](../dera-fe/README.md) for instructions on setting up Clerk Auth.

### Set up Neon

1. Create an account at https://neon.tech/.
2. Go to https://console.neon.tech/app/settings/api-keys and generate an API key. Note down the API key which you will need as the environment variable.

## Running it locally

### 1. Set up environment variables

Make a copy of [sample.env](./sample.env) and name it `.env`. Update the values in `.env` accordingly.

### 2. Install dependencies

Run `yarn --frozen-lockfile`.

### 3. Run database migrations

Run `flyway migrate`.

### 4. Run it

- In development: `yarn start:dev`.
- In production: First, build the app with `yarn build`. Next, run it with `yarn start:prod`.
