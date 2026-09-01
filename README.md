# Product Hub

**All your products. One place.**

Product Hub is a SaaS for creators, affiliates, professionals and businesses who want one polished storefront for everything they sell or promote. Products can point to an existing checkout/provider such as Hotmart, Kiwify, Eduzz, Shopify or WhatsApp instead of requiring Product Hub to process payments.

## Current build

This repository now contains the first production-oriented UI foundation:

- premium marketing landing page;
- responsive authenticated-area shell;
- Overview dashboard with storefront link, views, clicks, CTR and top products;
- Products management with search, status and provider columns;
- Storefront customizer with live visual preview;
- Analytics dashboard with traffic chart and top products;
- public storefront at `/store/joao-silva`;
- login entry screen at `/login`;
- Supabase PostgreSQL schema with organizations, products, images, storefronts, categories and analytics events;
- Row Level Security policies designed for multi-tenant isolation;
- Supabase client scaffold and `.env.example`;
- mobile responsive layouts.

## Design direction

The supplied reference screens are the visual source of truth: clean white surfaces, restrained warm neutrals, editorial typography, generous whitespace, subtle borders/shadows, premium storefront cards and a practical SaaS dashboard.

The Product Hub should not become a generic link-in-bio page. Its core identity is a **product storefront platform**.

## Stack

- Next.js + React + TypeScript
- Supabase + PostgreSQL + Supabase Auth/Storage
- Tailwind-compatible design approach (custom CSS tokens in the first pass)
- Lucide icons
- Vercel-ready

## Product roadmap

### Core — now

1. Authentication
2. Organization onboarding
3. Username/storefront identity
4. Product CRUD
5. Multiple product images
6. External purchase links
7. Categories
8. Product ordering
9. Featured products
10. Storefront customization
11. Public storefront
12. Product pages
13. Analytics
14. QR/share links
15. SEO/Open Graph

### Later

- Multi-Feed community for sellers
- AI assistance
- provider APIs and imports
- subscriptions/billing automation
- advanced team roles

The Core must remain useful without AI or social feeds.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

For the database, run `supabase/schema.sql` in a Supabase project, then add the project URL and anon key to `.env.local`.

## Quality bar

A feature is not considered complete just because its button renders. It should have working state, validation, loading/error/empty states, responsive behavior, accessibility and server-side authorization where applicable.

## Production rule

Never commit Supabase secrets, service-role keys or other credentials. Use environment variables and server-side access controls.
