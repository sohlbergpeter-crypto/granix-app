# Granix Planering

Ett webbaserat internt planeringssystem byggt för riktig delad data, riktig inloggning och deployment till `granix.se/rapportering`.

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- FullCalendar
- Zod
- Server actions och API routes
- Cookie-baserade sessioner med rollstyrning

## Projektstruktur

```text
src/app                 App Router, sidor och API routes
src/components          Återanvändbara UI-, layout-, kalender-, admin- och projektkomponenter
src/lib                 Databas, auth, validering och hjälpfunktioner
src/server/actions      Server actions för auth, projekt och admin-CRUD
prisma/schema.prisma    Datamodell
prisma/seed.ts          Testdata
prisma/migrations       Initial PostgreSQL-migration
public/uploads          Lokal fillagring under utveckling
ecosystem.config.js     PM2-start för produktion
deploy.nginx.conf       Exempel för Nginx på domänen
Dockerfile              Alternativ container-deployment
```

## Funktioner i nuvarande version

- Inloggning med användarnamn eller e-post
- Roller: `admin` och `user`
- Dashboard med mörkt Granix-UI
- Kalender med månad, vecka, dag, lista och tydliga veckonummer
- Färgkodade projekt
- Drag and drop i kalendern för admin
- Projektlista med sök och filter
- Projektdetaljsida
- Projektformulär för admin
- Koppling av anställda, maskiner och fordon till projekt
- Lokal filuppladdning till projekt
- Notisstruktur i appen
- Struktur för återkommande händelser
- Konfliktmarkering för överlappande resurser
- Adminregister för användare, anställda, team, maskiner och fordon
- AuditLog för viktiga ändringar
- Health endpoint på `/api/health`

## Lokal utveckling

1. Installera beroenden:

```bash
npm install
```

2. Skapa `.env` från exempel:

```bash
copy .env.example .env
```

3. Fyll i minst:

```env
DATABASE_URL="postgresql://USER:PASS@localhost:5432/granix_planering?schema=public"
SESSION_SECRET="byt-till-en-lång-hemlig-nyckel"
UPLOAD_DIR="./public/uploads"
APP_URL="http://localhost:3000"
COOKIE_DOMAIN=""
NODE_ENV="development"
```

4. Kör migrationer och seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Starta appen:

```bash
npm run dev
```

## Testkonton efter seed

- Admin: `admin` / `admin123`
- User: `ali` / `user123`
- User: `sara` / `user123`
- User: `omar` / `user123`

## Produktionsklar för domän och undermapp

Projektet är nu förberett för uppladdning till en server bakom din domän och specifikt under sökvägen `granix.se/rapportering`.

Det som är på plats:
- standalone-build via Next.js
- PM2-konfig i [ecosystem.config.js](C:/Users/sohlb/Documents/Codex/2026-04-19-g-r-en-app-en-kallender/ecosystem.config.js)
- Nginx-exempel i [deploy.nginx.conf](C:/Users/sohlb/Documents/Codex/2026-04-19-g-r-en-app-en-kallender/deploy.nginx.conf)
- Dockerfile som alternativ väg
- produktionsskydd för `SESSION_SECRET`
- valfri `COOKIE_DOMAIN`
- healthcheck-route för övervakning

## Rekommenderad deployment till granix.se

### 1. Serverkrav

- Linux VPS eller liknande
- Node.js 24
- PostgreSQL
- Nginx
- PM2

### 2. Filer att ladda upp

Ladda upp hela projektmappen, utom:
- `.next`
- `node_modules`
- `.env`

### 3. Skapa produktionsmiljö

Skapa `.env` på servern med riktiga värden:

```env
DATABASE_URL="postgresql://USER:PASS@localhost:5432/granix_planering?schema=public"
SESSION_SECRET="en-lång-slumpad-hemlighet-minst-32-tecken"
UPLOAD_DIR="./public/uploads"
APP_URL="https://granix.se/rapportering"
COOKIE_DOMAIN=".granix.se"
NODE_ENV="production"
NEXT_PUBLIC_BASE_PATH="/rapportering"
```

### 4. Installera och bygg på servern

```bash
npm install
npm run prisma:deploy
npm run db:seed
npm run build
```

Obs:
- `db:seed` ska normalt bara köras första gången eller i testmiljö
- i skarp drift bör seed inte köras igen om riktig data redan finns

### 5. Starta appen

Med PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Eller manuellt:

```bash
npm run start:prod
```

### 6. Koppla domänen via Nginx

Använd [deploy.nginx.conf](C:/Users/sohlb/Documents/Codex/2026-04-19-g-r-en-app-en-kallender/deploy.nginx.conf) som grund. Den proxar nu uttryckligen sökvägen `/rapportering/` till Next-servern.

- `granix.se`
- `www.granix.se`

### 7. SSL

När Nginx fungerar, lägg på HTTPS med exempelvis Certbot:

```bash
sudo certbot --nginx -d granix.se -d www.granix.se
```

## Viktigt om filer i produktion

Filer sparas just nu lokalt under `public/uploads`. Det fungerar för en första produktionsserver, men om appen senare flyttas till flera noder eller containerkluster bör `ProjectFile.storageKey` i stället peka mot exempelvis:

- Amazon S3
- Azure Blob Storage
- Cloudflare R2

## Hälsokontroll

För att verifiera att appen och databasen svarar:

```text
https://granix.se/rapportering/api/health
```

Svarar den med `ok: true` så lever appen och databasen.
