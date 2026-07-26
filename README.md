# Frontend Architecture & Module Documentation

This application is built with **Angular 19 (Standalone Components)**, **Angular Material**, **RxJS**, and **Signals** for state and reactive flow management.

---

##  Module & Feature Architecture

The application adopts a clean, modular structure split into `core`, `shared`, and domain-based `features`:

```text
frontend/src/app/
├── core/                   # Core singleton services, HTTP interceptors, Guards
│   ├── guards/             # Auth Guard (Route protection)
│   ├── interceptors/       # JWT Auth Interceptor & API Error Handler
│   └── services/           # Authentication state service
│
├── shared/                 # Shared UI components & utilities
│   ├── components/         # Page Header, Confirm Dialog
│   ├── layout/             # Main Layout, Navbar, Sidebar
│   └── services/           # Toast / Notification service
│
└── features/               # Domain-specific Feature Modules
    ├── auth/               # Login feature component
    ├── dashboard/          # Analytics & quick action overview
    ├── users/              # User management (List, Create/Edit Dialog)
    ├── categories/         # Category management (List, Create/Edit Dialog)
    ├── products/           # Product Catalog (Pagination, Search, Filter, Form)
    ├── bulk-upload/        # CSV Drag & Drop Bulk Product Uploader
    └── reports/            # CSV & XLSX Export trigger feature
```

##  Setup & Execution Instructions

### Prerequisites
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
npm install
```

### Development Server
Run the local dev server:
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload when source files are modified.

### Production Build
To generate the production build:
```bash
npm run build
```
Build artifacts will be stored in the `dist/frontend` directory.
