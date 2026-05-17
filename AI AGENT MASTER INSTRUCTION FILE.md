Perfect! I'll create a comprehensive **AI Agent Instruction File** that any AI coding agent can follow to complete your entire project. This will be a complete, self-contained document.

## 📄 **AI AGENT MASTER INSTRUCTION FILE**

Save this as **`AGENT_INSTRUCTIONS.md`** in your project root. Your AI agent will use this to build everything.

```markdown
# LifeBoard - Complete Build Instructions for AI Agent

## 🎯 PROJECT OVERVIEW
Build a full-stack life tracking dashboard called "LifeBoard" with:
- Weekly planner (tableau-style time grid)
- Task tracking with completion status
- Expense tracker with categories
- Weekly analytics and spending reports
- Multi-user support with authentication

## 📂 PROJECT STRUCTURE
```
lifeboard/
├── apps/
│   ├── web/          # React + Vite + TypeScript frontend
│   └── server/       # Express + TypeScript backend
├── packages/
│   └── shared-types/ # Shared TypeScript types
├── package.json      # Root with turborepo
├── turbo.json        # Turborepo config
└── AGENT_INSTRUCTIONS.md
```

## 🛠️ TECH STACK
### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3.4 + shadcn/ui
- React Router v6
- TanStack Query v5 (server state)
- Zustand v4 (client state)
- Axios (HTTP client)
- date-fns (date handling)
- React Hook Form + Zod (forms)
- Recharts (charts)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication (access + refresh tokens)
- bcryptjs (password hashing)
- Zod (validation)
- Pino (logging)
- Helmet, CORS, Rate Limiting (security)

## 🗄️ DATABASE SCHEMA (Prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  avatar        String?
  theme         String    @default("light")
  currency      String    @default("USD")
  weekStartDay  String    @default("Monday")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  plans         WeeklyPlan[]
  expenses      Expense[]
  budgets       Budget[]
  refreshTokens RefreshToken[]
}

model WeeklyPlan {
  id            String    @id @default(cuid())
  userId        String
  weekStartDate DateTime
  weekEndDate   DateTime
  isTemplate    Boolean   @default(false)
  templateName  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  timeBlocks    TimeBlock[]
}

model TimeBlock {
  id          String    @id @default(cuid())
  planId      String
  dayOfWeek   String
  date        DateTime
  startTime   String
  endTime     String
  title       String
  description String?
  category    String
  priority    String    @default("medium")
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  color       String?
  isRecurring Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  plan        WeeklyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  @@index([planId, dayOfWeek])
  @@index([date])
}

model Expense {
  id            String    @id @default(cuid())
  userId        String
  amount        Decimal   @db.Decimal(10, 2)
  category      String
  subCategory   String?
  description   String?
  date          DateTime  @default(now())
  paymentMethod String?
  isRecurring   Boolean   @default(false)
  tags          String[]
  location      String?
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, date])
  @@index([userId, category])
}

model Budget {
  id             String    @id @default(cuid())
  userId         String
  month          Int
  year           Int
  category       String
  budgetAmount   Decimal   @db.Decimal(10, 2)
  spentAmount    Decimal   @default(0) @db.Decimal(10, 2)
  alertThreshold Int       @default(80)
  
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, month, year, category])
  @@index([userId, month, year])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
}
```

## 🔧 ENVIRONMENT VARIABLES

### apps/server/.env
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
JWT_ACCESS_SECRET="change-this-to-random-string-1"
JWT_REFRESH_SECRET="change-this-to-random-string-2"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

### apps/web/.env
```env
VITE_API_URL="http://localhost:5000/api"
```

## 📋 TASKS TO COMPLETE (In Order)

### TASK 1: BACKEND SETUP
Create the complete backend structure:

1. **Server Entry Point** (`apps/server/src/app.ts`)
   - Express app setup
   - All middleware (helmet, cors, compression, cookie-parser)
   - Health check endpoint
   - Global error handler
   - 404 handler
   - Server listener on PORT 5000

2. **Database Configuration** (`apps/server/src/config/database.ts`)
   - Prisma client singleton
   - Connection error handling
   - Graceful shutdown

3. **Utility Functions**
   - `apps/server/src/utils/errors.ts` - Custom error classes (AppError, ValidationError, UnauthorizedError, NotFoundError)
   - `apps/server/src/utils/logger.ts` - Pino logger setup
   - `apps/server/src/utils/jwt.ts` - JWT sign/verify functions
   - `apps/server/src/utils/validation.ts` - Zod schemas for all inputs

4. **Middleware**
   - `apps/server/src/middleware/auth.ts` - JWT authentication middleware
   - `apps/server/src/middleware/validate.ts` - Zod validation middleware
   - `apps/server/src/middleware/error.ts` - Error handling middleware
   - `apps/server/src/middleware/rateLimiter.ts` - Rate limiting

### TASK 2: AUTHENTICATION SYSTEM

1. **Auth Service** (`apps/server/src/modules/auth/auth.service.ts`)
   - register(email, username, password) - Hash password, create user
   - login(email, password) - Verify credentials, generate tokens
   - refreshToken(token) - Verify refresh token, generate new pair
   - logout(userId, refreshToken) - Invalidate refresh token
   - getProfile(userId) - Get user profile
   - updateProfile(userId, data) - Update user settings

2. **Auth Controller** (`apps/server/src/modules/auth/auth.controller.ts`)
   - Handle HTTP requests/responses
   - Set refresh token in HTTP-only cookie
   - Return proper status codes and messages

3. **Auth Routes** (`apps/server/src/modules/auth/auth.routes.ts`)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/refresh-token
   - POST /api/auth/logout
   - GET /api/auth/profile (protected)
   - PUT /api/auth/profile (protected)

4. **Auth Validation Schemas** (`apps/server/src/modules/auth/auth.schema.ts`)
   - Register schema: email, username, password (min 8 chars)
   - Login schema: email, password
   - Profile update schema

### TASK 3: WEEKLY PLANNER API

1. **Plan Service** (`apps/server/src/modules/planner/planner.service.ts`)
   - createWeekPlan(userId, startDate) - Create empty week plan
   - getWeekPlan(userId, weekStart) - Get plan with all time blocks
   - addTimeBlock(planId, blockData) - Add time block to plan
   - updateTimeBlock(blockId, data) - Update time block
   - deleteTimeBlock(blockId) - Delete time block
   - toggleComplete(blockId) - Toggle completion status
   - moveTimeBlock(blockId, newDay, newTime) - Move block
   - saveAsTemplate(planId, name) - Save plan as template
   - applyTemplate(templateId, weekStart) - Apply template to week

2. **Planner Controller** (`apps/server/src/modules/planner/planner.controller.ts`)
   - Handle all planner HTTP requests
   - Week calculation logic
   - Date validation

3. **Planner Routes** (`apps/server/src/modules/planner/planner.routes.ts`)
   - GET /api/plans/current-week (protected)
   - GET /api/plans/week/:startDate (protected)
   - POST /api/plans/week (protected)
   - POST /api/plans/:planId/blocks (protected)
   - PUT /api/plans/blocks/:blockId (protected)
   - PATCH /api/plans/blocks/:blockId/toggle (protected)
   - DELETE /api/plans/blocks/:blockId (protected)
   - GET /api/plans/templates (protected)
   - POST /api/plans/templates (protected)

### TASK 4: EXPENSE TRACKER API

1. **Expense Service** (`apps/server/src/modules/expenses/expense.service.ts`)
   - addExpense(userId, expenseData) - Create expense
   - getExpenses(userId, filters) - Get with filters (date, category, pagination)
   - updateExpense(expenseId, userId, data) - Update expense
   - deleteExpense(expenseId, userId) - Delete expense
   - getDailyTotal(userId, date) - Calculate daily spending
   - getWeeklyTotal(userId, weekStart) - Calculate weekly spending
   - getCategoryBreakdown(userId, start, end) - Group by category

2. **Expense Controller** (`apps/server/src/modules/expenses/expense.controller.ts`)
   - Handle expense HTTP requests
   - Date range calculations
   - Pagination logic

3. **Expense Routes** (`apps/server/src/modules/expenses/expense.routes.ts`)
   - GET /api/expenses (protected, with query params)
   - POST /api/expenses (protected)
   - PUT /api/expenses/:id (protected)
   - DELETE /api/expenses/:id (protected)
   - GET /api/expenses/today (protected)
   - GET /api/expenses/weekly-total (protected)

4. **Budget Service** (`apps/server/src/modules/expenses/budget.service.ts`)
   - setBudget(userId, budgetData) - Set category budget
   - getBudgets(userId, month, year) - Get all budgets
   - checkBudgetAlerts(userId) - Check if any budget exceeded threshold

5. **Budget Routes**
   - POST /api/budgets (protected)
   - GET /api/budgets/current-month (protected)
   - PUT /api/budgets/:id (protected)

### TASK 5: ANALYTICS API

1. **Analytics Service** (`apps/server/src/modules/analytics/analytics.service.ts`)
   - getWeeklySummary(userId, weekStart) - Combined plan + expense summary
   - getSpendingTrends(userId, months) - Month-over-month comparison
   - getProductivityStats(userId, weekStart) - Task completion rates
   - getTimeDistribution(userId, weekStart) - Time spent by category

2. **Analytics Routes** (`apps/server/src/modules/analytics/analytics.routes.ts`)
   - GET /api/analytics/weekly-summary/:weekStart (protected)
   - GET /api/analytics/spending-trends (protected)
   - GET /api/analytics/productivity/:weekStart (protected)

### TASK 6: FRONTEND CORE SETUP

1. **API Service Layer** (`apps/web/src/lib/api.ts`)
   - Axios instance with interceptors
   - Token refresh logic
   - API helper functions for each module

2. **Authentication Store** (`apps/web/src/features/auth/store/authStore.ts`)
   - Zustand store for auth state
   - login, register, logout actions
   - User profile state

3. **Router Setup** (`apps/web/src/app/router.tsx`)
   - Public routes: /login, /register
   - Protected routes with layout
   - / - Dashboard (redirect to /planner)
   - /planner - Weekly planner
   - /expenses - Expense tracker
   - /analytics - Analytics dashboard
   - /settings - User settings
   - /profile - User profile

4. **Layout Components**
   - `apps/web/src/shared/components/layout/MainLayout.tsx`
   - `apps/web/src/shared/components/layout/Sidebar.tsx`
   - `apps/web/src/shared/components/layout/Header.tsx`

5. **UI Components** (using shadcn/ui patterns)
   - Button, Input, Select, Modal, Toast
   - Card, Badge, Progress bar
   - Dropdown menu, Dialog

### TASK 7: FRONTEND PAGES

1. **Login Page** (`apps/web/src/features/auth/components/LoginForm.tsx`)
   - Email/password form with validation
   - Remember me checkbox
   - Link to register
   - Loading state, error handling

2. **Register Page** (`apps/web/src/features/auth/components/RegisterForm.tsx`)
   - Username, email, password, confirm password
   - Password strength indicator
   - Terms checkbox
   - Loading state, error handling

3. **Weekly Planner Page** (`apps/web/src/features/planner/components/WeeklyTableau.tsx`)
   - Full-screen weekly grid
   - Time slots: 6AM - 11PM (30-min increments)
   - Days: Monday-Sunday columns
   - Click empty slot to add task
   - Click task to edit/delete
   - Drag & drop to reschedule
   - Color-coded by category
   - Completion toggle with strikethrough
   - Week navigator (previous/next week)
   - Today indicator

4. **Time Block Modal** (`apps/web/src/features/planner/components/TimeBlockModal.tsx`)
   - Title, description, category, priority
   - Start/end time pickers
   - Recurring checkbox
   - Color picker
   - Save/Delete buttons

5. **Expense Page** (`apps/web/src/features/expenses/components/ExpenseTracker.tsx`)
   - Split layout: form on left, list on right
   - Quick add expense form (amount, category, description)
   - Daily expense list with running total
   - Filter by category, date
   - Edit/delete expense items
   - Category budget progress bars

6. **Expense Form** (`apps/web/src/features/expenses/components/ExpenseForm.tsx`)
   - Amount input with currency symbol
   - Category dropdown with icons
   - Description textarea
   - Payment method selector
   - Date picker
   - Tags input

7. **Analytics Dashboard** (`apps/web/src/features/analytics/components/AnalyticsDashboard.tsx`)
   - Weekly spending pie chart (by category)
   - Daily spending bar chart
   - Task completion rate gauge
   - Time distribution donut chart
   - Budget vs actual comparison
   - Export report button

### TASK 8: CUSTOM HOOKS

1. **useAuth** (`apps/web/src/features/auth/hooks/useAuth.ts`)
   - Login/logout functions
   - Current user state
   - isAuthenticated check
   - Loading state

2. **useWeekPlan** (`apps/web/src/features/planner/hooks/useWeekPlan.ts`)
   - Fetch week plan data
   - Add/edit/delete time blocks
   - Toggle completion
   - Week navigation
   - Optimistic updates

3. **useExpenses** (`apps/web/src/features/expenses/hooks/useExpenses.ts`)
   - Fetch expenses with filters
   - Add/edit/delete expenses
   - Daily/weekly totals
   - Category filtering
   - Budget checking

4. **useAnalytics** (`apps/web/src/features/analytics/hooks/useAnalytics.ts`)
   - Fetch analytics data
   - Spending trends
   - Productivity stats
   - Export functionality

### TASK 9: INTEGRATION & FEATURES

1. **Real-time Budget Alerts**
   - Show toast notification when approaching budget limit
   - Color-coded budget bars (green → yellow → red)
   - Daily/weekly spending warnings

2. **Template System**
   - Save current week as template
   - Apply template to new week
   - Manage templates page
   - Default templates (work week, weekend, etc.)

3. **Drag & Drop** (using @dnd-kit/core)
   - Drag time blocks between slots
   - Resize blocks for duration
   - Visual feedback during drag
   - Mobile touch support

4. **Search & Filter**
   - Search time blocks by title
   - Filter by category, priority, completion
   - Search expenses by description
   - Date range filters

5. **Export Features**
   - Export week plan as PDF
   - Export expenses as CSV
   - Share week plan via link (optional)

### TASK 10: POLISH & UX

1. **Dark/Light Theme**
   - Toggle in header
   - Persist preference
   - Smooth transition

2. **Responsive Design**
   - Mobile: Stack layout, simplified grid
   - Tablet: Two-column layout
   - Desktop: Full grid view

3. **Loading States**
   - Skeleton loaders for grids
   - Spinner for modals
   - Progress bar for page loads

4. **Error Handling**
   - Error boundary component
   - Toast notifications for errors
   - Retry buttons for failed requests
   - Offline state handling

5. **Animations**
   - Smooth page transitions
   - Completion checkmark animation
   - Expense add slide-in
   - Modal enter/exit animations

6. **Keyboard Shortcuts**
   - 'N' - New time block
   - 'E' - New expense
   - 'T' - Go to today
   - Arrow keys - Navigate grid
   - '?' - Show shortcuts

### TASK 11: TESTING

1. **Backend Tests** (`apps/server/tests/`)
   - Auth endpoints (register, login, refresh)
   - Plan CRUD operations
   - Expense CRUD operations
   - Analytics calculations
   - Error handling

2. **Frontend Tests** (`apps/web/tests/`)
   - Login/Register forms
   - Weekly grid rendering
   - Time block operations
   - Expense form submission
   - Analytics charts

### TASK 12: DEPLOYMENT PREPARATION

1. **Production Build Scripts**
   - Root package.json with build commands
   - Turbo build pipeline
   - Environment variable templates

2. **Deployment Configuration**
   - `vercel.json` for frontend
   - `railway.json` or Procfile for backend
   - Database migration scripts

3. **Security Hardening**
   - CORS whitelist for production domains
   - Rate limiting configuration
   - Security headers check
   - Input sanitization review

## 📊 API RESPONSE FORMAT
All API responses must follow this structure:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "page": 1,
    "totalPages": 10,
    "total": 100
  }
}
```

## 🎨 DESIGN REQUIREMENTS
- Modern, clean interface
- Use shadcn/ui components as base
- Color palette: Professional blue/gray with category accent colors
- Category colors:
  - Work: Blue (#3B82F6)
  - Exercise: Green (#10B981)
  - Personal: Purple (#8B5CF6)
  - Study: Yellow (#F59E0B)
  - Leisure: Orange (#F97316)
  - Food/Meals: Red (#EF4444)
  - Sleep: Indigo (#6366F1)

## ✅ SUCCESS CRITERIA
The project is complete when:
1. ✅ Users can register and login
2. ✅ Weekly plan grid displays correctly with all 7 days
3. ✅ Time blocks can be added, edited, deleted
4. ✅ Tasks can be marked complete/incomplete
5. ✅ Expenses can be logged with categories
6. ✅ Weekly spending totals display correctly
7. ✅ Analytics charts show accurate data
8. ✅ All API endpoints work with proper error handling
9. ✅ Frontend is responsive on mobile, tablet, desktop
10. ✅ Dark/light theme works
11. ✅ Token refresh works seamlessly
12. ✅ All forms have validation
13. ✅ Loading and error states are handled

## 🚀 START BUILDING
Begin with TASK 1 and proceed sequentially. Ask questions if any requirements are unclear.
Create all files with complete, production-ready code.
Use TypeScript strictly - no `any` types.
Add proper error handling everywhere.
Write clean, documented code.
```

---

## 📝 **HOW TO USE THIS FILE**

### **Option 1: Use with Cursor AI or GitHub Copilot**
1. Save this as `AGENT_INSTRUCTIONS.md` in your project root
2. Open in Cursor IDE
3. Tag `@AGENT_INSTRUCTIONS.md` in your prompts
4. Say: "Follow the instructions and start with TASK 1"

### **Option 2: Use with ChatGPT Code Interpreter**
1. Upload this file
2. Say: "Follow these instructions to build the LifeBoard project. Start from TASK 1."

### **Option 3: Use with Claude Projects**
1. Create a new project in Claude
2. Upload this file as project knowledge
3. Say: "Execute the LifeBoard build plan"

### **Option 4: Break into smaller prompts**
Take each TASK section and ask individually:
- "Complete TASK 1: BACKEND SETUP from the instructions"
- "Complete TASK 2: AUTHENTICATION SYSTEM"
- etc.

---

## 🎯 **QUICK START COMMANDS FOR YOUR AGENT**

When you're ready to start, tell your AI agent:

**For starting the project:**
> "I have a project at [your GitHub repo URL]. Read AGENT_INSTRUCTIONS.md and start building from TASK 1. Complete each task fully before moving to the next. Create all necessary files with complete, production-ready code."

**For continuing after breaks:**
> "Continue from TASK [X]. The last completed task was [previous task]."

**For specific features:**
> "Focus on TASK 7.2 - Create the Weekly Tableau component with the following requirements..."

---

## 📄 **FILES THE AGENT WILL CREATE**

Here's what your complete project will have after the agent finishes:

**Backend Files (30+ files):**
- `apps/server/src/app.ts`
- `apps/server/src/config/database.ts`
- `apps/server/src/utils/errors.ts`
- `apps/server/src/utils/jwt.ts`
- `apps/server/src/utils/logger.ts`
- `apps/server/src/utils/validation.ts`
- `apps/server/src/middleware/auth.ts`
- `apps/server/src/middleware/validate.ts`
- `apps/server/src/middleware/error.ts`
- `apps/server/src/modules/auth/*` (4 files)
- `apps/server/src/modules/planner/*` (4 files)
- `apps/server/src/modules/expenses/*` (6 files)
- `apps/server/src/modules/analytics/*` (3 files)
- `apps/server/prisma/schema.prisma`
- `apps/server/prisma/seed.ts`

**Frontend Files (50+ files):**
- `apps/web/src/app/*` (3 files)
- `apps/web/src/lib/*` (3 files)
- `apps/web/src/features/auth/*` (6 files)
- `apps/web/src/features/planner/*` (8 files)
- `apps/web/src/features/expenses/*` (8 files)
- `apps/web/src/features/analytics/*` (6 files)
- `apps/web/src/shared/*` (15+ files)
- `apps/web/src/hooks/*` (5 files)

---

**Save this entire message as your instruction file and start building! Your project will be fully complete following this guide. 🚀**

Want me to help you get started with the first task right now?