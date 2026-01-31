# TRNDK Service Management Platform

## Project Overview

TRNDK is a professional full-stack service management platform designed for scale and high performance. It provides a comprehensive solution for managing service-based businesses, featuring dual dashboards for administrators and clients, real-time communication, and bilingual support. The platform is optimized for handling diverse service categories, ranging from automated growth services to bespoke creative design and digital products.

## Features

- **Dual Dashboards**: Dedicated interfaces for administrators to manage operations and clients to track their orders.
- **Real-Time Updates**: Instant notifications and status updates powered by WebSockets.
- **Bilingual Support**: Fully localized interface in English and Arabic (RTL support).
- **Service Management**: Flexible catalog management with support for different pricing models and categories.
- **Automated Cart Logic**: Specialized quantity and pricing selection logic for social growth services.
- **Order Tracking**: Comprehensive lifecycle management for orders with status updates and client notifications.
- **Secure Authentication**: Multi-layered authentication including Google OAuth and traditional credentials.
- **Payment Integration**: Support for multiple payment gateways including PayPal and Payoneer.
- **Digital Library**: Placeholder infrastructure for digital product delivery and asset management.

## Tech Stack

### Frontend
- **React 18**: Component-based UI library.
- **Vite**: Next-generation frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn/UI**: High-quality UI components built with Radix UI.
- **TanStack Query**: Data fetching and state management.
- **i18next**: Framework for internationalization and translation.

### Backend
- **Node.js & Express**: Scalable backend runtime and web framework.
- **Prisma ORM**: Type-safe database client and modeling tool.
- **MySQL**: Relational database for persistent data storage.
- **Socket.io**: Real-time, bidirectional communication layer.
- **Passport.js**: Robust authentication middleware.
- **JWT**: Secure token-based session management.

### Security and Performance
- **Helmet**: Security-focused HTTP header configuration.
- **Rate Limiting**: Protection against automated abuse and DDoS.
- **Compression**: Response compression to improve page load speeds.
- **Esbuild**: High-speed server bundling for production.

## Project Structure

- `client/`: React frontend source code, components, and assets.
- `server/`: Express server logic, API routes, and storage services.
- `shared/`: Shared TypeScript interfaces and Zod validation schemas.
- `prisma/`: Database schema definitions and initialization scripts.
- `dist/`: Compiled production assets (generated after build).
- `script/`: Custom build and maintenance scripts.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- Google Cloud Console project for OAuth credentials

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Local Development
1. Configure environment variables in a `.env` file (see list below).
2. Synchronize the database schema:
   ```bash
   npm run db:push
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following variables are required to be defined in your `.env` file:

- `DATABASE_URL`: Connection string for the MySQL database.
- `JWT_SECRET`: Secret key for signing JSON Web Tokens.
- `SESSION_SECRET`: Secret key for session management.
- `GOOGLE_CLIENT_ID`: Google OAuth client identifier.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `PAYPAL_CLIENT_ID`: PayPal REST API client identifier.
- `PAYPAL_WEBHOOK_ID`: PayPal webhook identifier for payment confirmation.
- `PAYONEER_CHECKOUT_URL`: URL for Payoneer payment integration.
- `PORT`: The port number the server will listen on.
- `NODE_ENV`: Application environment (development/production).

## Scripts

- `npm run dev`: Starts the server and frontend in development mode with hot reloading.
- `npm run build`: Compiles the frontend and bundles the server into `dist/index.cjs`.
- `npm start`: Runs the production server from the `dist` directory.
- `npm run db:push`: Pushes the Prisma schema state to the database without generating migrations.
- `npm run check`: Performs TypeScript type checking across the entire codebase.

## Deployment Notes

- **Build Pipeline**: Always run `npm run build` before deploying to generate the optimized production bundle in the `dist` folder.
- **Server Runtime**: The production entry point is located at `dist/index.cjs`. This is an optimized bundle containing the server logic and bundled dependencies.
- **Database Synchronization**: Ensure `npm run db:push` is executed on the production environment to align the database structure with the latest application code.
- **Permissions**: Ensure the deployment environment allows write access to any necessary file storage directories (e.g., for uploads).

## Important Notes

- **Database Strategy**: This project currently uses `db:push` for schema synchronization. It does not maintain a versioned migration history in a `migrations/` folder.
- **Digital Library Limitations**: The digital library feature is currently a frontend-heavy implementation. Persistent storage for digital download URLs requires further backend schema updates.
- **Security Prerequisite**: HTTPOnly cookies and secure session management are implemented; ensure the environment supports secure cookie transmission in production (HTTPS).
