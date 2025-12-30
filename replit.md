# STAALKER - Social Media Marketing Services Platform

## Overview

STAALKER is a full-stack web application for social media marketing services. It allows customers to purchase services like YouTube subscribers, Instagram followers, and TikTok engagement. The platform includes a public storefront, customer dashboard for order management, and an admin dashboard for service and user management.

The application is built with a React frontend using TypeScript and a Node.js/Express backend. It uses an in-memory storage layer that implements interfaces compatible with PostgreSQL via Drizzle ORM, allowing easy migration to a persistent database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for Replit integration
- **Routing**: React Router v6 with public routes, client dashboard, and admin dashboard
- **State Management**: TanStack Query for server state, React Context for auth and language
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Internationalization**: i18next with Arabic (RTL) and English support
- **Theme**: next-themes for dark/light mode switching

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with `/api/v1` prefix
- **Storage Pattern**: Interface-based storage (`IStorage`) with in-memory implementation (`MemStorage`)
- **Database Schema**: Drizzle ORM with PostgreSQL dialect (schema in `shared/schema.ts`)
- **Authentication**: Simple token-based auth with localStorage persistence (mock implementation)

### Directory Structure
- `client/src/` - React frontend application
  - `components/` - UI components (common, layouts, ui from shadcn)
  - `pages/` - Page components organized by section (public, client, admin)
  - `contexts/` - React contexts for auth and language
  - `lib/` - Utilities and API client
  - `hooks/` - Custom React hooks
- `server/` - Express backend
  - `routes.ts` - API route definitions
  - `storage.ts` - Data storage interface and implementation
  - `static.ts` - Static file serving for production
  - `vite.ts` - Vite dev server integration
- `shared/` - Shared code between frontend and backend
  - `schema.ts` - Drizzle ORM table definitions and Zod schemas

### Key Design Decisions
1. **Shared Schema**: Database schema is defined once in `shared/schema.ts` and used by both frontend (for type safety) and backend (for database operations)
2. **Storage Abstraction**: The `IStorage` interface allows swapping between in-memory storage (development) and database storage (production) without changing route logic
3. **Component Library**: Uses shadcn/ui with Radix primitives for accessible, customizable components
4. **RTL Support**: Full Arabic language support with automatic RTL layout switching

## External Dependencies

### Database
- **Drizzle ORM**: PostgreSQL database access with type-safe queries
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **connect-pg-simple**: Session storage for PostgreSQL (available but not currently used)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-router-dom**: Client-side routing
- **i18next / react-i18next**: Internationalization framework
- **next-themes**: Theme management for dark/light mode
- **date-fns**: Date formatting utilities
- **sonner**: Toast notifications
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar/date picker component
- **react-hook-form** with **zod**: Form handling and validation

### UI Components (Radix UI)
Full suite of Radix UI primitives for accessible components including dialogs, dropdowns, tooltips, accordions, and more.

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-***: Replit-specific Vite plugins for error handling and development tools