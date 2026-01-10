# TRNDK - Service Management Platform

A full-stack web application for managing service orders with separate Admin and Client dashboards. Built with React, Express, Prisma, and MySQL, featuring bilingual support (Arabic/English) and a mobile-first responsive design.

---

## 📋 Project Overview

TRNDK is a service management platform that enables:

- **Clients** to browse services, add them to cart, checkout, and track orders
- **Admins** to manage services, view/update orders, manage users, and monitor platform statistics

The system follows a streamlined flow: **Cart → Checkout → Orders**, where each checkout can create multiple orders (one per service), all grouped by a shared `transactionId`.

---

## 👥 User Roles

### Client
- Browse and search services
- Add services to cart
- Complete checkout and make payments
- View order history and status
- Receive notifications for order updates
- Leave reviews for completed services

### Admin
- Manage services (create, update, delete)
- View and update all orders
- Manage users (view, suspend, promote to VIP)
- Manage affiliates and commission rates
- Process payout requests
- View dashboard statistics (revenue, orders, users)
- Receive notifications for new orders and payout requests
- Configure platform settings

### Affiliate
- Join the affiliate program with a unique referral code
- Share referral links to promote services
- Earn 5% commission on completed orders (default rate, adjustable by admin)
- Track earnings (Pending, Approved, Requested, Paid)
- Request payouts when approved balance reaches $25 minimum
- View referral statistics and performance

### VIP User
- Special status granted by administrators
- Enhanced user privileges and priority support
- Visible VIP badge in the system
- Managed through Admin User Management panel

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v7** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS 3** - Utility-first styling
- **Shadcn/ui** - Component library (Radix UI primitives)
- **i18next** - Internationalization (Arabic/English)
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime environment
- **Express 4** - Web framework
- **Prisma ORM** - Database toolkit
- **MySQL** - Relational database
- **Socket.io** - Real-time notifications
- **Passport.js** - Authentication (Google OAuth 2.0)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **TypeScript** - Type safety

### Additional Tools
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **date-fns** - Date utilities
- **Lucide React** - Icon library

---

## 🏗️ Core Architecture

### Order Flow

```
Services → Cart → Checkout → Orders (grouped by transactionId)
```

1. **Cart**: Users add multiple services to cart
2. **Checkout**: User provides details and payment method
3. **Orders**: System creates **one Order per service** in the cart
4. **Transaction Grouping**: All orders from a single checkout share the same `transactionId`

### Order Status Values

Orders progress through the following statuses:

- **pending**: Order placed, awaiting processing
- **processing**: Order is being worked on
- **completed**: Order successfully fulfilled
- **cancelled**: Order was cancelled
- **refunded**: Payment was refunded to customer

### Key Architectural Rules

> [!CAUTION]
> **NEVER store multiple services in one Order**. Each Order must reference exactly ONE service.

> [!IMPORTANT]
> Orders are grouped by `transactionId`, NOT by a single Order entity.

### Route Structure

#### Client Routes
- `/` - Home page
- `/services` - Browse services
- `/services/other` - Other services category
- `/cart` - View cart
- `/checkout` - Complete purchase
- `/client/dashboard` - Client dashboard
- `/client/orders` - View order history
- `/client/affiliates` - Affiliate dashboard and program enrollment
- `/client/profile` - User profile

#### Admin Routes
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/services` - Manage services
- `/admin/orders` - View and update all orders
- `/admin/users` - Manage users
- `/admin/affiliates` - Manage affiliates and commission rates
- `/admin/affiliate-payouts` - Process payout requests
- `/admin/settings` - Platform settings

---

## 💰 Currency System

> [!CAUTION]
> **USD is the ONLY currency for storage, calculations, and payments.**

### Critical Currency Rules

1. **Storage**: All prices and amounts are stored in **USD cents** (integer)
   - Example: $10.00 = 1000 (stored as integer)

2. **Calculations**: All backend calculations use **USD only**
   - No currency conversion logic exists
   - No multi-currency support

3. **Payments**: Payment gateways **MUST receive USD**
   - Never send local currency to payment providers
   - Always validate currency is USD before processing

4. **Display**: Local currency is **DISPLAY-ONLY** (informational)
   - Frontend may show converted amounts for user convenience
   - Conversion is purely cosmetic
   - Never used in actual transactions

### Database Schema

```prisma
model Order {
  totalAmount Int    // USD cents
  currency    String @default("USD") // Always USD
}

model Payment {
  amount   Int    // USD cents
  currency String @default("USD") // Always USD
}
```

> [!WARNING]
> **Breaking this rule will cause payment failures and financial discrepancies.**

---

## 💼 Affiliate Commission System

The platform includes a comprehensive affiliate marketing system that allows users to earn commissions by referring customers.

### Commission Flow

```
Referral Link → Order Placed → Order Completed → Commission Approved → Payout Requested → Admin Processes → Funds Paid
```

### Commission Statuses

1. **Pending**: Order is placed but not yet completed
2. **Approved**: Order is completed, commission is ready for withdrawal
3. **Requested**: Affiliate has requested a payout (minimum $25)
4. **Paid**: Admin has processed the payout
5. **Cancelled**: Order was cancelled, commission voided

### Key Rules

> [!IMPORTANT]
> - **Default Commission Rate**: 5% of order total (adjustable per affiliate by admin)
> - **Minimum Payout**: $25.00 in approved earnings
> - **Auto-Approval**: Commissions automatically move from `pending` to `approved` when order status changes to `completed`
> - **Tracking**: Referral codes are stored in localStorage and attached to orders during checkout

### Payout Model

The system uses a dedicated `Payout` model to manage affiliate withdrawals:

**Payout Statuses:**
1. **pending**: Payout request submitted, awaiting admin review
2. **processing**: Admin is processing the payment
3. **completed**: Payment successfully sent to affiliate
4. **failed**: Payment failed, requires admin intervention

**Payout Flow:**
```
Affiliate Requests → Admin Reviews → Processing → Payment Gateway → Completed/Failed
```

**Database Structure:**
- Amount stored in USD cents
- Supports multiple payment methods (Payoneer, PayPal, etc.)
- Tracks transaction IDs from payment providers
- Links to multiple orders included in the payout

### Commission Status Flow

Each order tracks commission status independently:

- **none**: No affiliate attached to this order
- **pending**: Order placed but not yet completed
- **approved**: Order completed, commission ready for withdrawal
- **paid**: Commission included in a processed payout
- **cancelled**: Order was cancelled, commission voided

### Affiliate Workflow

1. **Join Program**: User enrolls and receives a unique referral code
2. **Share Link**: Affiliate shares `/?ref=CODE` with potential customers
3. **Track Orders**: System tracks all orders from referral links
4. **Earn Commission**: 5% commission on each completed order
5. **Request Payout**: When approved balance ≥ $25, affiliate can request withdrawal
6. **Admin Review**: Admin processes payout request and marks as paid

### Admin Management

- View all affiliates and their performance stats
- Adjust individual commission rates (0-100%)
- Process payout requests from dedicated admin panel
- Receive real-time notifications for new payout requests

---

## 💳 Payment Gateway Integration

### Payoneer

The platform supports Payoneer as a payment gateway for processing affiliate payouts.

#### Configuration

Add the following variables to your `.env` file:

```env
# Payoneer Configuration
PAYONEER_ENABLED=false          # Set to true to enable Payoneer
PAYONEER_ENV=sandbox            # 'sandbox' or 'production'
PAYONEER_CLIENT_ID=             # Your Payoneer client ID
PAYONEER_CLIENT_SECRET=         # Your Payoneer client secret
```

#### Setup Steps

1. **Register with Payoneer**: Create a developer account at [Payoneer Developer Portal](https://developer.payoneer.com)
2. **Get Credentials**: Obtain your Client ID and Client Secret
3. **Configure Environment**: Update `.env` with your credentials
4. **Enable Integration**: Set `PAYONEER_ENABLED=true`
5. **Test in Sandbox**: Use `PAYONEER_ENV=sandbox` for testing
6. **Go Live**: Switch to `PAYONEER_ENV=production` when ready

#### Features

- Automated payout processing for affiliates
- Support for multiple currencies (converted from USD)
- Transaction tracking and reconciliation
- Sandbox mode for safe testing

> [!WARNING]
> Always test Payoneer integration in sandbox mode before enabling in production.

---

## 🌐 RTL / LTR Handling

The application supports both Arabic (RTL) and English (LTR) with special handling to maintain layout stability.

### Critical RTL Rules

> [!CAUTION]
> **NEVER use `left` / `right` positioning or `translate-x` hacks.**

### Layout Strategy

1. **Base Layout**: Application uses **LTR layout** for structural stability
   - Prevents modal/dialog positioning issues
   - Ensures consistent component behavior

2. **Text Direction**: Arabic text inputs use `dir="rtl"` attribute
   - Applied to input fields, textareas, and content areas
   - Does NOT affect layout positioning

3. **Modal/Dialog Handling**: All modals force `dir="ltr"` on container
   ```tsx
   <DialogContent dir="ltr">
     {/* Content with proper text direction */}
   </DialogContent>
   ```

### Positioning Best Practices

✅ **DO USE:**
- Flexbox (`justify-center`, `items-center`)
- Logical properties (`margin-inline-start`, `padding-inline-end`)
- Grid layout
- `text-align` for text direction

❌ **NEVER USE:**
- `left-0`, `right-0` for centering
- `translate-x-1/2` for positioning
- Absolute positioning with `left`/`right` for layout
- RTL-specific layout hacks

### Example: Correct Modal Centering

```tsx
// ✅ CORRECT
<div className="fixed inset-0 flex items-center justify-center">
  <DialogContent dir="ltr">
    <input dir="rtl" /> {/* Arabic text */}
  </DialogContent>
</div>

// ❌ WRONG
<div className="fixed left-1/2 -translate-x-1/2">
  <DialogContent>
    {/* This will break in RTL */}
  </DialogContent>
</div>
```

---

## 📱 UI & Mobile Behavior

### Mobile-First Design

- All components designed for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interactive elements

### Modal Guidelines

> [!IMPORTANT]
> All modals must follow these rules:

1. **Centering**: Use flexbox (`flex items-center justify-center`)
2. **Viewport Fit**: Must fit within viewport (`max-h-[90vh]`)
3. **Internal Scrolling**: Content scrolls inside modal, not page
4. **Direction**: Force `dir="ltr"` on modal container

### Bottom Sheets

- Preferred for mobile actions (cart, filters, etc.)
- Uses `vaul` library for native-like experience
- Automatically adapts to mobile gestures

### Responsive Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## ⚠️ Critical Business Rules

> [!CAUTION]
> **DO NOT BREAK THESE RULES**

### 1. Order-Service Relationship
- ❌ **NEVER** store multiple services in one Order
- ✅ **ALWAYS** create one Order per service
- ✅ Group orders by `transactionId`

### 2. Currency Handling
- ❌ **NEVER** accept non-USD payments
- ❌ **NEVER** perform currency conversion in backend
- ✅ **ALWAYS** store amounts in USD cents
- ✅ **ALWAYS** validate `currency === "USD"` before payment

### 3. RTL Layout
- ❌ **NEVER** use `left`/`right` positioning for layout
- ❌ **NEVER** use `translate-x` for centering
- ✅ **ALWAYS** use flexbox or grid for positioning
- ✅ **ALWAYS** force `dir="ltr"` on modals

### 4. Backend Validation
- ❌ **NEVER** trust client-side validation alone
- ✅ **ALWAYS** validate all inputs on backend
- ✅ **ALWAYS** use Zod schemas for validation
- ✅ **ALWAYS** sanitize user inputs

### 5. Authentication
- ❌ **NEVER** expose sensitive data in responses
- ❌ **NEVER** allow role escalation via client
- ✅ **ALWAYS** verify JWT tokens on protected routes
- ✅ **ALWAYS** check user role for admin routes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **Google OAuth 2.0** credentials (for Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TRNDK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database (MySQL)
   DATABASE_URL="mysql://user:password@localhost:3306/trndk"

   # Google OAuth 2.0
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Initial Admin User
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="securepassword"

   # Session Secret
   SESSION_SECRET="your-random-secret-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: `http://localhost:5000`
   - Backend API: `http://localhost:5000/api`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
TRNDK/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and helpers
│   │   └── i18n/        # Internationalization
├── server/              # Backend Express application
│   ├── routes/          # API route handlers
│   ├── storage/         # Data access layer (DB/Memory)
│   ├── middleware/      # Express middleware
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
├── prisma/              # Database schema and migrations
│   └── schema.prisma    # Prisma schema
└── dist/                # Production build output
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Console |
| `ADMIN_EMAIL` | Initial admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial admin password | Strong password |
| `PAYONEER_ENABLED` | Enable Payoneer integration | `false` |
| `PAYONEER_ENV` | Payoneer environment | `sandbox` or `production` |
| `PAYONEER_CLIENT_ID` | Payoneer client ID | From Payoneer Developer Portal |
| `PAYONEER_CLIENT_SECRET` | Payoneer client secret | From Payoneer Developer Portal |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Session encryption key | Random string |

---

## ⚙️ Platform Settings

The application uses a flexible key-value settings system for platform configuration.

### Settings Model

```prisma
model Setting {
  key       String   @id
  value     String   @db.Text
  updatedAt DateTime @default(now()) @updatedAt
}
```

### Usage

- **Admin Settings Page**: Manage platform-wide configurations
- **Dynamic Configuration**: Update settings without code changes
- **Key-Value Storage**: Flexible structure for any configuration need

### Common Settings

- Platform name and branding
- Contact information
- Feature flags
- Business rules and limits
- Email templates
- Payment gateway preferences

> [!TIP]
> Settings are cached and updated in real-time across the application.

---

## 🧪 Development Notes

### Admin Initialization

- Admin user is created automatically on first server start
- Uses credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Process is **idempotent** (safe to run multiple times)
- No duplicate admins will be created

### Database Migrations

```bash
# Push schema changes to database
npm run db:push

# Generate Prisma client
npx prisma generate
```

### Available NPM Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build application for production
npm start            # Start production server

# Database
npm run db:push      # Push Prisma schema changes to database

# Type Checking
npm run check        # Run TypeScript type checking
```

### Verification Scripts

The `/script` folder contains utility scripts for testing and verification:

| Script | Purpose |
|--------|----------|
| `build.ts` | Custom production build script |
| `check-config.ts` | Validate environment configuration |
| `check-payout-type.ts` | Verify payout type definitions |
| `e2e-payment.ts` | End-to-end payment flow testing |
| `reset-db.ts` | Reset database to clean state |
| `verify-delayed-notif.ts` | Test notification delay functionality |
| `verify-enabled-payment.ts` | Check payment gateway status |
| `verify-payment-gateway.ts` | Verify payment gateway integration |
| `verify-payoneer.ts` | Test Payoneer integration |

**Running Verification Scripts:**

```bash
# Example: Run payment gateway verification
npx tsx script/verify-payment-gateway.ts

# Example: Test Payoneer integration
npx tsx script/verify-payoneer.ts

# Example: Run end-to-end payment test
npx tsx script/e2e-payment.ts
```

> [!TIP]
> Run verification scripts before deploying to production to ensure all integrations are working correctly.

### Real-time Notifications

- Uses Socket.io for real-time updates
- Notifications are role-based:
  - Clients receive order status updates
  - Admins receive new order notifications
  - Admins are NOT notified of their own actions

---

## ⚡ Performance Considerations

1. **Database Queries**: Use Prisma's `include` carefully to avoid N+1 queries
2. **Image Optimization**: Compress service images before upload
3. **Caching**: Consider implementing Redis for session storage in production
4. **Rate Limiting**: Already configured via `express-rate-limit`
5. **Bundle Size**: Frontend uses code splitting via React Router

---

## 🐛 Common Pitfalls

### 1. Modal Not Centering
**Problem**: Modal appears off-screen or misaligned  
**Solution**: Ensure modal container uses `flex items-center justify-center` and `dir="ltr"`

### 2. Payment Failing
**Problem**: Payment gateway rejects transaction  
**Solution**: Verify `currency` field is always `"USD"` and amount is in cents

### 3. Multiple Services in One Order
**Problem**: Checkout creates single order with multiple services  
**Solution**: Loop through cart items and create one Order per service

### 4. RTL Layout Breaking
**Problem**: Components misaligned in Arabic  
**Solution**: Never use `left`/`right` positioning; use flexbox instead

### 5. Admin Self-Notification
**Problem**: Admin receives notification for their own action  
**Solution**: Check if action initiator is admin before creating notification

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Router Documentation](https://reactrouter.com)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [i18next Documentation](https://www.i18next.com)

---

## 📝 License

MIT

---

## 🤝 Contributing

When contributing to this project:

1. **Read this README thoroughly** - Understand the critical business rules
2. **Never break the rules** - Especially currency, order structure, and RTL handling
3. **Test thoroughly** - Verify changes on both mobile and desktop
4. **Validate backend** - Always implement server-side validation
5. **Document changes** - Update this README if adding new features

---

## ⚠️ Final Warning for Developers

> [!CAUTION]
> This system has **critical business rules** that must not be violated:
> 
> 1. **USD-only payments** - No exceptions
> 2. **One service per Order** - Never combine services
> 3. **LTR-based layout** - Never use left/right positioning
> 4. **Backend validation** - Never trust client alone
> 
> Breaking these rules will cause **financial errors**, **data corruption**, or **UI failures**.
> 
> When in doubt, ask before making changes to core architecture.

---

**Built with ❤️ for service management excellence**
