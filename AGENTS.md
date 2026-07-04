# Cafeteria Menu Frontend

## Stack
- **Next.js 16** App Router + React 19 + TypeScript
- **Tailwind CSS v4** (`@tailwindcss/postcss`) with shadcn/ui (radix-vega style, lucide icons)
- **pnpm** (v9.15.0) – use `pnpm` not `npm`/`yarn`
- **Drizzle ORM** + PostgreSQL (Neon Serverless)
- **JWT auth** (jose) with bcryptjs, session cookie named `session`
- **Cloudinary** for images, **Supabase** for realtime
- **Zod** + react-hook-form for validation

## Commands
```
pnpm dev        # dev server on :3000
pnpm build      # production build
pnpm start      # start production server
pnpm lint       # ESLint (flat config, core-web-vitals + TypeScript)
```

## Drizzle
- Schema: `src/db/schema.ts`, output: `drizzle/`
- `drizzle-kit` is a runtime dependency (not dev)
- Config reads `DATABASE_URL` from env (`.env` not gitignored; contains live secrets)

## Project structure
```
src/
├── app/
│   ├── layout.tsx, page.tsx          # public root
│   ├── api/auth/{login,logout,me,register}/  # API routes
│   ├── api/order-items/pending/
│   └── admin/
│       ├── layout.tsx                # wraps AuthProvider + Toaster
│       ├── page.tsx                  # login page
│       └── workspace/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── dashboard/{menu,metrics,workers}/
│           ├── orders/{[id],actions}/
│           └── system/{kitchen,bar,lunch}/
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── workspace/                    # workspace-specific components
│   └── ...                           # feature components
├── db/                               # Drizzle schema + connection
├── lib/                              # auth, supabase client, utils
├── repositories/                     # data access layer
├── schemas/                          # Zod validation schemas
├── contexts/AuthContext.tsx
├── hooks/
├── types/roles.ts                    # UserRole enum
└── helpers/
```

## Role-based routing (middleware.ts)
- Cookie `session` holds JWT with `id`, `name`, `role`
- Roles: `admin`, `dependiente`, `cocinero`, `bartender`, `lunch`
- Route permissions:
  - `/admin/workspace/dashboard` → admin only
  - `/admin/workspace/system` → cocinero, bartender, lunch, admin
  - `/admin/workspace/orders` → dependiente, admin
- Login redirects to role-specific default workspace page

## DB schema (src/db/schema.ts)
Tables: `workers`, `items_categories`, `items`, `orders`, `prices`, `order_items`
Enums: `worker_role`, `order_status`, `order_item_status`, `elaboration_areas`
Indexes on: status, created_at, worker_id, category_id, elaboration_area, is_active

## Deployment
AWS Amplify (see `amplify.yml`) – not Vercel. Build uses `pnpm install --no-frozen-lockfile`.

## Config notes
- `@/*` maps to `./src/*`
- React Compiler enabled in next.config.ts
- next.config.ts allows Cloudinary images (`res.cloudinary.com`)
- Components aliased via `components.json`: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
- No .env.example – secrets checked into `.env` (not gitignored)
