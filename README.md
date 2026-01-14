# RW16 Ciwaruga Database System

## Overview
This project is a Next.js application for managing RW16 Ciwaruga data. It has been migrated from a legacy Google Sheets backend to a robust **MySQL** database using **Prisma ORM**.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: MySQL (local via Laragon or remote)
- **ORM**: Prisma
- **Authentication**: Custom Session (Encrypted Cookies)
- **Styling**: Tailwind CSS

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (e.g., Laragon, XAMPP, or distinct service)

### 2. Environment Setup
Create a `.env` file in the root directory (or use `.env.local`):

```env
# Database Connection
DATABASE_URL="mysql://root:@localhost:3306/rw16_ciwaruga"

# App Secrets
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ENCRYPTION_KEY="your-secure-key-min-32-chars"
```

### 3. Installation
```bash
npm install
```

### 4. Database Migration & Seeding
Set up the database schema and initial data:
```bash
# Apply migrations (creates tables)
npx prisma migrate dev

# Seed initial data (Admin user, dummy data)
npx prisma db seed
```

### 5. Running Development Server
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

## Project Structure

- `prisma/`
  - `schema.prisma`: Database schema definition.
  - `seed.ts`: Script to populate initial data.
- `src/app/api/`: API Routes (Serverless functions).
  - All routes now use `prisma` to interact with the database.
- `src/lib/`: Utility functions.
  - `prisma.ts`: Prisma Client singleton.
  - `auth.ts`: Session management and permission logic.
  - `encrypt.ts`: Encryption helpers for sessions.

## Key Features & Permissions

| Role | Access Level |
|Data Warga| Admin, Ketua RW, Admin RW see all. Ketua RT sees only their RT.|
|UMKM, Loker, Berita| Managed by Admin/RW. Publicly viewable.|
|Security| `LogAktivitas` tracks actions. `BlokirAttempt` blocks IPs after failed verify attempts.|

## Development Notes

### Migration from Google Sheets
The old `src/lib/googleSheets.ts` integration has been **REMOVED**.
All data fetching must be done via `import { prisma } from "@/lib/prisma"`.

**Example:**
```typescript
// OLD
// const data = await readGoogleSheet("warga");

// NEW
const data = await prisma.warga.findMany();
```

### Authorization
Always check session and role before performing database operations in API routes.
```typescript
const session = await getSession(request);
if (!session || !["admin", "ketua_rt"].includes(session.role)) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
}
```
