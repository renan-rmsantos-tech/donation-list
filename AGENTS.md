# Agents Guide

This document describes the foundation and infrastructure established during project initialization.

## Project Overview

**Church Donations Platform** - A transparent, community-driven donation platform built with Next.js 15, Drizzle ORM, and Supabase.

## Architecture

### Core Stack

- **Frontend**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle
- **Authentication**: iron-session (fixed credential admin)
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (catalog)
│   ├── admin/             # Admin routes (protected)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── features/              # Feature modules
│   ├── donations/         # Donation flows
│   ├── products/          # Product management
│   ├── categories/        # Category management
│   ├── pix/              # PIX settings
│   └── dashboard/         # Admin dashboard
├── lib/
│   ├── db/               # Database client & schema
│   ├── auth/             # Authentication
│   ├── storage/          # Storage client
│   └── utils/            # Utility functions
├── middleware.ts         # Next.js middleware
└── components/           # Shared UI components
```

## Database Schema

### Tables

1. **categories** - Donation categories
   - id (UUID PK)
   - name (unique text)
   - timestamps

2. **products** - Donation items
   - id (UUID PK)
   - name, description, donationType
   - targetAmount (monetary only, in cents)
   - currentAmount (denormalized, in cents)
   - isFulfilled (physical only)
   - isPublished
   - timestamps

3. **product_categories** - Product-category relationships
   - productId (FK)
   - categoryId (FK)
   - Composite PK

4. **donations** - Recorded donations/pledges
   - id (UUID PK)
   - productId (FK)
   - donationType
   - amount (monetary, in cents)
   - donorName, donorPhone, donorEmail
   - receiptPath (storage path)
   - createdAt

5. **pix_settings** - PIX configuration
   - id (UUID PK)
   - qrCodeImagePath
   - copiaEColaCode
   - updatedAt

## Key Features Established

### Authentication

- **Admin Session**: iron-session with encrypted cookies
- **Fixed Credentials**: Username/password from env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- **Session Duration**: 7 days
- **Protected Routes**: `/admin/*` routes check session in layout

### Database Access

- Drizzle ORM with PostgreSQL driver
- Connection pooling via Supabase
- Query timeout: 10 seconds
- Migrations: Drizzle Kit generates SQL migrations

### File Storage

- **Supabase Storage** for receipts and QR codes
- **Signed URLs**: 60-second expiry for secure uploads
- **Buckets**:
  - `receipts` (private) - PIX payment proofs
  - `pix-qr` (public) - QR code image

### Validation

- **Zod schemas** for all inputs
- Phone validation: Brazilian format (10-11 digits)
- Email validation: Standard format
- Currency: Integer cents (avoid floating-point errors)

## Development Workflow

### Prerequisites

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with local values
```

### Local Development

```bash
# Start Supabase stack (Docker required)
npm run supabase:start

# Generate and apply migrations
npm run db:generate
npm run db:migrate

# Start Next.js dev server
npm run dev
```

### Testing

```bash
# Run all tests once
npm run test

# Watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Database Migrations

```bash
# After schema changes
npm run db:generate
# Review generated migration in src/lib/db/migrations/
npm run db:migrate

# Reset database (local only)
npx supabase db reset
```

## Server Actions

All mutations are implemented as Server Actions in Next.js (no API routes).

### Donation Actions

- `createMonetaryDonation` - Record monetary donation + update progress
- `createPhysicalPledge` - Record physical pledge + mark fulfilled
- `generateUploadUrl` - Get signed URL for file upload

### Product Actions

- `createProduct` - Create new product (admin only)
- `updateProduct` - Modify product (admin only)
- `deleteProduct` - Remove product (admin only)

### Category Actions

- `createCategory` - Create category (admin only)
- `updateCategory` - Modify category (admin only)
- `deleteCategory` - Remove category (admin only)

### PIX Actions

- `updatePixSettings` - Update QR code and copia e cola (admin only)

## Query Functions

All read operations are server-side queries:

- `getPublishedProducts()` - Products for catalog
- `getAllProducts()` - All products (admin)
- `getProductById(id)` - Single product with categories
- `getProductsByCategory(categoryId)` - Filter by category
- `getCategories()` - All categories
- `getDonationsByProductId(id)` - Donations for a product
- `getPixSettings()` - PIX configuration
- `getDashboardStats()` - Admin dashboard totals

## Error Handling

All Server Actions return `{ success: boolean, data?, error?, details? }` format.

Common errors:
- `VALIDATION_ERROR` - Invalid input per Zod schema
- `PRODUCT_NOT_FOUND` - Referenced product doesn't exist
- `UNAUTHORIZED` - Admin session invalid
- `INTERNAL_ERROR` - Database or system error

## Testing Strategy

### Unit Tests

- Schema validation (Zod)
- Business logic (donation calculations)
- Helper utilities (format, validate)

### Integration Tests

- Database transactions (monetary/physical flows)
- Storage integration (signed URLs)
- End-to-end donations

### Coverage Target

- ≥80% for critical paths
- Focus: donations/schemas, products/schemas, utilities

## Performance Considerations

1. **Denormalized Progress**: `current_amount` on products table for fast catalog reads
2. **Atomic Transactions**: All donation writes wrapped in DB transactions
3. **Signed URLs**: Direct client-to-Supabase uploads bypass server
4. **Drizzle Lightweight**: Better cold-start performance than Prisma

## Security

1. **Session**: Encrypted iron-session cookies
2. **Validation**: All inputs validated with Zod before DB writes
3. **Storage**: Signed URLs for private bucket access
4. **Environment**: Sensitive values in env vars (not committed)

## Deployment

### Vercel

- Deploy Next.js app directly
- Environment variables set in Vercel dashboard
- Database: Connection pooling via Supabase (port 6543)
- Storage: Direct signed URLs from serverless functions

### Supabase

- Managed PostgreSQL
- Storage RLS policies enforced
- Free tier sufficient for MVP (~500MB DB, 1GB storage)

## Troubleshooting

### Database Connection Issues

1. Check `DATABASE_URL` in `.env.local`
2. Verify Supabase CLI is running: `npx supabase start`
3. Check Docker is running

### Migration Failures

1. Review generated SQL in `src/lib/db/migrations/`
2. Reset local database: `npx supabase db reset`
3. Check schema.ts for conflicts

### Authentication Issues

1. Verify `SESSION_PASSWORD` is 32+ characters
2. Check iron-session cookies in DevTools
3. Ensure `/admin/login` credentials match env vars

## Next Steps

Following tasks build on this foundation:

1. **Admin Authentication** - Implement login flow
2. **Admin CRUD** - Product and category management pages
3. **Public Catalog** - Product listing and filtering
4. **Donation Flows** - Monetary and physical donation UIs
5. **Admin Dashboard** - Summary statistics and reports

All features inherit the scaffold's infrastructure, validation patterns, and test setup.
