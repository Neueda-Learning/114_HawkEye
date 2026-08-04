# HawkEye — Frontend

> React 18 + TypeScript + Vite frontend for the **Transaction Monitoring Platform**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd Frontend
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start dev server (mock API enabled by default)
npm run dev
```

Open **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role     | Email                    | Password    | Redirects to         |
|----------|--------------------------|-------------|----------------------|
| Admin    | admin@hawkeye.com        | password123 | /admin/dashboard     |
| Analyst  | analyst@hawkeye.com      | password123 | /alerts              |
| Customer | customer@hawkeye.com     | password123 | /customer/dashboard  |

---

## ⚙️ Environment Variables

| Variable            | Default                    | Description                        |
|---------------------|----------------------------|------------------------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080`    | Spring Boot backend URL            |
| `VITE_USE_MOCK_API` | `true`                     | `true` = MSW mocks, `false` = real |
| `VITE_APP_NAME`     | `HawkEye`                  | App display name                   |

**To switch to the real backend:**
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8080
```

---

## 📁 Project Structure

```
src/
├── app/                    # Router + Providers
├── components/
│   ├── common/             # DataTable, MetricCard, StatusBadge, Toast, etc.
│   └── layout/             # AdminLayout, CustomerLayout, Sidebar, Topbar
├── features/
│   ├── auth/               # Login, ForgotPassword, ProtectedRoute, authStore
│   ├── customer/           # Dashboard, SendMoney, TransactionList, TransactionDetail
│   ├── rules/              # CRUD, Toggle, AuditTrail + RuleForm component
│   ├── alerts/             # List, Detail, History, Stats + AlertActionPanel
│   └── dashboard/          # AdminDashboard, AdminMetrics
├── lib/
│   ├── api/                # axios.ts, transactions.ts, alerts.ts, rules.ts
│   ├── types/              # All TypeScript interfaces and enums
│   └── utils/              # cn(), formatDate, formatCurrency, status helpers
├── mocks/
│   ├── data.ts             # Seed data: accounts, payees, transactions, rules, alerts
│   └── handlers/           # MSW handlers for transactions, alerts, rules
└── test/                   # Vitest unit tests
e2e/                        # Playwright smoke tests
```

---

## 🧪 Running Tests

```bash
# Unit tests (Vitest)
npm run test

# Unit tests with coverage
npm run test:coverage

# Unit tests with UI
npm run test:ui

# E2E smoke tests (requires dev server running)
npm run test:e2e

# E2E with Playwright UI
npm run test:e2e:ui
```

---

## 🏗️ Build

```bash
npm run build       # Production build → dist/
npm run preview     # Preview production build
```

---

## 🌐 API Integration

The frontend is **pre-wired** to all backend endpoints. To connect to the real backend:

1. Set `VITE_USE_MOCK_API=false` in `.env`
2. Ensure Spring Boot is running on `http://localhost:8080`
3. Run `npm run dev`

### Endpoints used

| Method | Endpoint | Feature |
|--------|----------|---------|
| POST   | `/api/v1/transactions` | Send Money |
| GET    | `/api/v1/transactions` | Transaction list |
| GET    | `/api/v1/transactions/:id` | Transaction detail |
| GET    | `/api/v1/transactions/:id/alerts` | Linked alerts |
| GET    | `/api/v1/alerts` | Alert list |
| GET    | `/api/v1/alerts/:id` | Alert detail |
| PUT    | `/api/v1/alerts/:id/acknowledge` | Lifecycle |
| PUT    | `/api/v1/alerts/:id/investigate` | Lifecycle |
| PUT    | `/api/v1/alerts/:id/close` | Lifecycle |
| PUT    | `/api/v1/alerts/:id/dismiss` | Lifecycle |
| GET    | `/api/v1/alerts/stats` | Stats charts |
| POST   | `/api/v1/rules` | Create rule |
| GET    | `/api/v1/rules` | Rule list |
| PUT    | `/api/v1/rules/:id` | Edit rule |
| DELETE | `/api/v1/rules/:id` | Soft delete |
| PUT    | `/api/v1/rules/:id/toggle` | Toggle active |
| GET    | `/api/v1/rules/:id/audit-trail` | Rule history |

---

## 🎨 Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| UI State | Zustand v5 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Dates | Day.js |
| Mock API | MSW v2 |
| Unit Tests | Vitest + React Testing Library |
| E2E Tests | Playwright |

