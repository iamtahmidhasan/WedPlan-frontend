# WedPlan — Modern Wedding Planning & Vendor Booking Platform

WedPlan is a modern full-stack wedding planning platform that connects couples with verified wedding professionals—photographers, venues, caterers, florists, and stylists.

---

## 🌟 Key Features

### 💍 Couple Experience
- **Curated Home Page**: Minimalist editorial design featuring category showcases, curated featured services, and a dedicated **Top-Rated Vendors** section with verified couple testimonials.
- **Vendors Directory (`/vendors`)**: Search and filter wedding professionals by discipline, studio name, **Verified Partners**, and **Top Rated (4.5★+)**.
- **Service Pages (`/services/[id]`)**: High-resolution image galleries, detailed package information, pricing, direct booking inquiry forms, and authentic couple reviews with star distributions.
- **Vendor Profiles (`/vendors/[id]`)**: Full vendor portfolio, contact details, active listings, and client testimonials.
- **Booking Flow & Review System (`/dashboard/bookings/[id]`)**:
  - Track booking statuses from `pending` to `confirmed` and `completed`.
  - Once a service is completed, customers can submit a **1–5 star rating and review**.
  - **Review Persistence & Editing**: Completed booking pages remember submitted reviews, allowing customers to view and update their feedback at any time.

### 🎨 Vendor Experience
- **Portfolio & Service Management**: Add, edit, and publish wedding services with pricing, categories, and cover images.
- **Booking Management**: Review reservation inquiries, customer contact details, event dates, and update statuses (including marking as `completed`).
- **Customer Reviews Hub (`/dashboard/reviews`)**: Dedicated read-only view of client feedback and star ratings across all services in their portfolio.
- **Premium Subscription**: Upgrade via Stripe checkout for featured partner badges and higher visibility.

### 🛡️ Admin Experience
- **Platform Management**: Approve or reject newly submitted vendor services.
- **Review Moderation (`/dashboard/reviews`)**: View all reviews across the platform with confirmation-based deletion.
- **User Management**: Monitor vendors and customers with one-click block/unblock capabilities and role adjustments.
- **Category Management**: Add and manage custom wedding categories.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components & Icons**: [Lucide React](https://lucide.dev/), [Shadcn UI](https://ui.shadcn.com/), [Sonner](https://sonner.emilkowal.ski/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) with MongoDB Adapter
- **Animations**: [Motion](https://motion.dev/)
- **Payments**: [Stripe](https://stripe.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- Running instance of the WedPlan backend (`http://localhost:5000`)

### 2. Environment Variables
Create a `.env` file in the `frontend` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your_mongodb_connection_string
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build & Verification
```bash
# Typecheck
npx tsc --noEmit

# Lint check
npm run lint

# Production build
npm run build
```

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (site)/                  # Public pages (home, vendors, services, etc.)
│   │   │   ├── page.tsx             # Home page with Top-Rated Vendors
│   │   │   ├── vendors/             # Directory & profile pages
│   │   │   └── services/            # Service directory & details
│   │   ├── dashboard/               # Role-based dashboard
│   │   │   ├── bookings/            # Booking management & review submission
│   │   │   ├── reviews/             # Reviews management (Admin & Vendor)
│   │   │   ├── services/            # Vendor services management
│   │   │   └── users/               # Admin user management
│   │   ├── sign-in/                 # Authentication pages
│   │   └── sign-up/
│   ├── components/
│   │   ├── home/                    # Hero, categories, featured, top-rated vendors
│   │   ├── vendors/                 # Vendors directory & filters
│   │   ├── services/                # Service cards & detail sections
│   │   ├── reviews/                 # Customer review form & delete button
│   │   ├── bookings/                # Booking editing & status buttons
│   │   └── ui/                      # Reusable UI primitives
│   └── lib/
│       ├── auth.ts                  # Better Auth configuration
│       └── core/                    # Unified API fetch utilities
└── package.json
```

---

## 📜 License
This project is private and proprietary.
