# PrintWala — full-stack services marketplace

A complete, deployable e‑commerce website for a local services business (printing,
photocopy/PDF, design, documentation, government paperwork, …) with a full **admin panel**.

Customers browse services, fill a booking form, upload files where needed, pay online
(Razorpay), and land on an order confirmation page. Admins manage services, site content,
orders and enquiries from a dedicated dashboard.

```
ecom/
├── backend/          Express + Prisma API (deploy to Render)
├── frontend/         React + Vite + Tailwind SPA (deploy to Vercel)
├── docker-compose.yml   Local Postgres for development
└── render.yaml       Render blueprint for the backend
```

Tech: **React 18 + Vite + Tailwind** · **Node/Express + Prisma** · **PostgreSQL** · **Razorpay**
· **JWT auth** · images & file uploads on **ImageKit.io**.

---

## Features

**Storefront**
- Home, Services (search + category filter), Service detail, About, Contact
- Booking flow: customer details → dynamic per‑service fields → optional file upload →
  Razorpay payment → order confirmation
- User accounts (register / login) + "My orders" tracking
- Fully responsive, mobile menu, editorial hand‑crafted design

**Admin panel** (`/admin`, admin role only)
- Dashboard with revenue / orders / customers stats + recent orders
- Services: create, edit, delete/deactivate, feature, categorise, toggle file‑upload
  requirement, and a **custom booking‑field builder** (text/number/select/…)
- Orders: filter by status, expand for full details + uploaded file, update status
- Site content editor: home hero/stats/steps/testimonials, about, contact, business settings
- Contact messages inbox

**Payments** — Razorpay integration with an automatic **mock mode**: with no keys set the
whole flow works (payments auto‑succeed) so you can develop and demo without an account.

**Images & files — ImageKit.io** — every image on the platform is stored on and served from
ImageKit:
- Admins upload service images and site‑content images by drag‑and‑drop (no URL pasting),
  straight from the admin panel to the ImageKit media library.
- Customer booking uploads (PDFs, scans, photos) go to the same media library.
- The storefront renders every image through one `<Img>` component, which asks ImageKit for
  the exact size needed, auto‑negotiates AVIF/WebP, ships a responsive `srcSet`, and fades in
  from a blurred low‑quality placeholder.
- Without ImageKit keys everything falls back to local disk, so local dev needs no account.

---

## Quick start (local)

Prerequisites: **Node 18+** and **Docker** (for local Postgres). No global Postgres needed.

```bash
# 1. Start a local Postgres
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env          # defaults already point at the docker DB
npm install
npx prisma migrate dev        # creates tables
npm run seed                  # admin user + demo services + content
npm run dev                   # → http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

Open http://localhost:5173.

**Demo logins** (created by the seed):
- Admin — `admin@printwala.test` / `admin12345`
- Customer — `customer@printwala.test` / `customer123`

> Without Docker: set `DATABASE_URL` in `backend/.env` to any Postgres you have
> (including your Aiven URL) and run the same Prisma commands.

---

## How the booking → payment flow works

1. `POST /api/orders` (multipart) creates a `PENDING` order, stores any uploaded file,
   and creates a Razorpay order (or a mock one). Returns `{ order, payment }`.
2. The frontend opens **Razorpay Checkout** with `payment.razorpayOrderId`.
   In mock mode it skips the popup and synthesises a successful payment.
3. `POST /api/orders/:id/verify` validates the Razorpay signature and marks the order
   `PAID`.
4. The browser redirects to `/order/:id` — the confirmation / order‑details page.

Other services work identically; the per‑service fields and the "requires upload" flag
are configured by the admin, so e.g. the "Photocopy / PDF Printing" service asks for
copies/colour/paper and requires a PDF, while "Lamination" just asks size/finish/quantity.

---

## Deployment

### 1. Database — Aiven (Postgres)
1. Create a Postgres service on Aiven.
2. Copy the **Service URI** and append `?sslmode=require`.
   Example: `postgres://avnadmin:pass@host:12345/defaultdb?sslmode=require`

### 2. Backend — Render
Option A — Blueprint: push this repo to GitHub, then in Render choose **New → Blueprint**
and point it at the repo (`render.yaml` is included). Set the `sync:false` env vars in the
dashboard.

Option B — manual **Web Service**:
- Root directory: `backend`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npm start`
- Env vars:
  | Key | Value |
  |-----|-------|
  | `DATABASE_URL` | your Aiven URI (with `?sslmode=require`) |
  | `JWT_SECRET` | a long random string |
  | `CORS_ORIGIN` | your Vercel URL, e.g. `https://printwala.vercel.app` |
  | `PUBLIC_URL` | this Render service URL, e.g. `https://printwala-api.onrender.com` |
  | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your first admin login |
  | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay (leave blank for mock) |
  | `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT` | from ImageKit → Developer options → API keys |
  | `IMAGEKIT_FOLDER` | media‑library root folder, defaults to `/printwala` |

After the first deploy, seed the production data once (Render **Shell**):
```bash
npm run seed
```

### 3. Frontend — Vercel
- Import the repo, set **Root directory** to `frontend`.
- Framework preset: **Vite** (build `npm run build`, output `dist`).
- Environment variable:
  `VITE_API_URL = https://printwala-api.onrender.com/api`  ← note the `/api`
- `vercel.json` (included) rewrites all routes to `index.html` for the SPA router.

### 4. Razorpay (going live)
- Create a Razorpay account, grab **Key ID** + **Key Secret** (test keys work first).
- Set them on Render. The frontend reads the mode from `GET /api/config`, so no frontend
  change is needed — the real Checkout popup appears automatically once keys are present.

### 5. ImageKit (image & file storage)

Render's and Vercel's filesystems are ephemeral — anything written to `backend/uploads` is
lost on the next deploy — so **set the ImageKit keys in production**.

1. Create a free account at [imagekit.io](https://imagekit.io).
2. **Developer options → API keys**: copy the *Public key*, *Private key* and *URL endpoint*
   (`https://ik.imagekit.io/<your_id>`).
3. Set `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY` and `IMAGEKIT_URL_ENDPOINT` on Render.
   The frontend picks the endpoint up from `GET /api/config`, so no frontend change is
   needed. (Optionally set `VITE_IMAGEKIT_URL_ENDPOINT` on Vercel too — useful with a custom
   ImageKit domain, so transformations apply on the very first render.)
4. Move images you already have into ImageKit and rewrite the database to point at them:

   ```bash
   cd backend
   node scripts/migrate-images-to-imagekit.js --dry      # preview
   node scripts/migrate-images-to-imagekit.js            # move local uploads/ files
   node scripts/migrate-images-to-imagekit.js --remote   # also re-host remote URLs (Unsplash…)
   ```

Uploads are proxied through the backend, so the private key never reaches the browser.

> Without these keys the app still runs and stores uploads in `backend/uploads` — fine for
> local development, not for production.

---

## API overview

| Method | Path | Purpose |
|-------|------|---------|
| POST | `/api/auth/register` · `/login` · GET `/me` | auth |
| GET | `/api/services` · `/services/categories` · `/services/:slug` | public catalogue |
| GET | `/api/content/:key` · POST `/content/contact/message` | content + contact |
| POST | `/api/orders` | create order (+file) & payment |
| POST | `/api/orders/:id/verify` | verify payment |
| GET | `/api/orders/:id` · `/orders/mine/list` | order details / my orders |
| * | `/api/admin/*` | admin: stats, services, categories, content, orders, messages |
| POST | `/api/admin/uploads/image` | admin: upload an image to ImageKit (multipart, field `image`) |
| DELETE | `/api/admin/uploads/:fileId` | admin: remove an asset from the media library |

Admin routes require a `Bearer` JWT for a user with role `ADMIN`.

---

## Useful commands

```bash
# backend
npm run dev            # watch mode
npm run seed           # (re)seed demo data
npx prisma studio      # visual DB browser
npx prisma migrate dev # create a migration after schema changes
node scripts/migrate-images-to-imagekit.js --dry   # preview media migration to ImageKit

# frontend
npm run build          # production build
npm run preview        # preview the build
```
