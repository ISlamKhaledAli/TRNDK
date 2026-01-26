# TRNDK - Professional Service Management Platform

A high-performance, full-stack service management platform designed for scale. Featuring dual dashboards (Admin & Client), real-time updates via Socket.io, multi-language support (Arabic/English), and integrated payment gateways.

---

## 🚀 Tech Stack

### Frontend
- **React 18** with **Vite** (Next-gen build tooling)
- **Tailwind CSS** & **Shadcn/UI** (Modern design system)
- **TanStack Query** (Robust state management)
- **i18next** (Bilingual support: Arabic & English)

### Backend
- **Node.js** & **Express** (High-performance API)
- **Prisma ORM** (Type-safe database access)
- **MySQL** (Relational data storage)
- **Socket.io** (Real-time notifications)
- **Passport.js & JWT** (Secure authentication)

---

## 🛠️ Installation & Development

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0+
- Google OAuth credentials (for login)

### Setup
1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd TRNDK
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your local database and OAuth credentials
   ```

3. **Database Initialization**:
   ```bash
   npm run db:push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📦 Production Deployment (Hostinger Guide)

This project is optimized for Hostinger Node.js hosting. Follow these steps for a successful deployment:

### 1. Build the Project
Before uploading, generate the production build:
```bash
npm run build
```
This creates a `dist/` directory containing:
- `index.cjs`: The optimized server bundle.
- `public/`: The compiled frontend assets.

### 2. Upload Files to Hostinger
Upload the following files/folders to your Hostinger file manager (typically in `public_html` or your application root):
- `dist/`
- `prisma/`
- `package.json`
- `package-lock.json`
- `.env` (configured with production values)

### 3. Setup Hostinger Node.js App
In the Hostinger Control Panel:
1. Navigate to **Node.js Dashboard**.
2. **Node.js Version**: Select 18.x or 20.x.
3. **Application Root**: Set to the path where you uploaded the files.
4. **Application URL**: Your domain (e.g., `https://example.com`).
5. **Application Startup File**: Set to `dist/index.cjs`.
6. **Environment Variables**: Ensure `PORT` is set (usually handled by Hostinger automatically) and other variables match `.env`.

### 4. Database Setup
1. Create a MySQL database in the Hostinger panel.
2. Update the `DATABASE_URL` in your production `.env` file.
3. Run migrations via SSH (if available):
   ```bash
   npx prisma db push
   ```

### 5. Final Configuration
- **Permissions**: Ensure the `uploads/` directory exists and has write permissions.
- **SSL**: Enable SSL via Hostinger for secure HTTPS connections.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts server and frontend in development mode with HMR. |
| `npm run build` | Bundles frontend for production and bundles server into `dist/index.cjs`. |
| `npm start` | Runs the production server (requires `npm run build` first). |
| `npm run db:push` | Synchronizes the database schema with the Prisma model. |
| `npm run check` | Runs TypeScript type checking across the project. |

---

## 🛡️ Security & Performance
- **Helmet**: Hardened HTTP headers for security.
- **Rate Limiting**: Protection against brute-force and DDoS.
- **CORS**: Restricted cross-origin resource sharing.
- **Compression**: Gzip compression for faster load times.
- **JWT & HTTPOnly Cookies**: Secure, stateless session management.

---

## 📝 License
Built by TRNDK Team. All rights reserved.
