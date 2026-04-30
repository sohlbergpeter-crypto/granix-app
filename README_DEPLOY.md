# Vercel Deployment Guide

This project is prepared for deployment to Vercel on the custom domain `app.granix.se`.

## What is already prepared

- Next.js production build works
- Prisma Client is generated automatically on install
- Production migration command uses `prisma migrate deploy`
- Seed script can create the first admin user
- Environment variables are documented in `.env.example`
- App is configured for root deployment on `app.granix.se`

## Required environment variables in Vercel

Set all of these in the Vercel project settings:

```env
DATABASE_URL=
DIRECT_URL=
SESSION_SECRET=
UPLOAD_DIR=./public/uploads
APP_URL=https://app.granix.se
COOKIE_DOMAIN=app.granix.se
NODE_ENV=production
NEXT_PUBLIC_BASE_PATH=
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@granix.se
ADMIN_PASSWORD=change-this-before-seeding
ALLOW_SAMPLE_SEED=false
```

## Recommended database setup

Use a PostgreSQL provider that works well with Vercel, for example:

- Vercel Postgres
- Neon
- Supabase
- Railway PostgreSQL

Use:

- `DATABASE_URL` for Prisma runtime queries
- `DIRECT_URL` for Prisma migrations

If your provider gives you separate pooled and direct connection strings:

- `DATABASE_URL` = pooled connection
- `DIRECT_URL` = direct non-pooled connection

## Build behavior on Vercel

Vercel is configured to run:

```bash
npm run vercel-build
```

That command runs:

```bash
prisma migrate deploy && npm run build
```

So production migrations use the correct Prisma command.

## First deployment steps

1. Push this project to GitHub, GitLab, or Bitbucket.
2. In Vercel, click `Add New Project`.
3. Import the repository.
4. In project settings, add all required environment variables.
5. Set the custom domain to:

```text
app.granix.se
```

6. Trigger the first deployment.

## Create the first admin user

After the database exists and env vars are set, run the seed script once against production:

```bash
npm run prisma:seed
```

The seed script will:

- create or update the first admin user
- use `ADMIN_USERNAME`
- use `ADMIN_EMAIL`
- use `ADMIN_PASSWORD`

If `ALLOW_SAMPLE_SEED=true`, it also creates demo data.

For production, keep:

```env
ALLOW_SAMPLE_SEED=false
```

unless you explicitly want demo records.

## Important limitation about file uploads

This app currently stores uploaded files under:

```text
public/uploads
```

That is acceptable for local development, but **not ideal for Vercel production**, because Vercel instances do not provide persistent local disk storage for app data.

Before using production file uploads seriously, move file storage to one of:

- Vercel Blob
- Amazon S3
- Cloudflare R2
- Supabase Storage

The database model is already structured so `storageKey` can later point to cloud storage.

## Health check

After deployment, verify:

```text
https://app.granix.se/api/health
```

## Manual things still required from you

You still need to do these yourself:

1. Create the Vercel project.
2. Provision a production PostgreSQL database.
3. Add the environment variables in Vercel.
4. Point the DNS for `app.granix.se` to Vercel.
5. Run the first seed once with your chosen admin credentials.
6. Replace local file storage later if you want reliable production uploads.
