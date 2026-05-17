# LifeBoard
a full stack project

<!-- Project Structure -->

lifeboard/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                 # Frontend React App
│   │   ├── src/
│   │   │   ├── app/         # App-wide settings
│   │   │   │   ├── providers.tsx
│   │   │   │   └── router.tsx
│   │   │   ├── features/    # Feature-based modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── api/
│   │   │   │   │   └── types/
│   │   │   │   ├── planner/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── WeeklyGrid.tsx
│   │   │   │   │   │   ├── TimeBlock.tsx
│   │   │   │   │   │   └── DayColumn.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useWeekPlanner.ts
│   │   │   │   │   └── api/
│   │   │   │   ├── expenses/
│   │   │   │   └── analytics/
│   │   │   ├── shared/      # Shared components
│   │   │   │   ├── ui/      # shadcn/ui components
│   │   │   │   ├── layout/
│   │   │   │   └── utils/
│   │   │   ├── lib/         # Utilities
│   │   │   │   ├── axios.ts
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── tests/           # E2E tests
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── server/              # Backend Express App
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   └── auth.schema.ts
│       │   │   ├── planner/
│       │   │   ├── expenses/
│       │   │   └── analytics/
│       │   ├── shared/
│       │   │   ├── middleware/
│       │   │   │   ├── auth.middleware.ts
│       │   │   │   ├── validate.middleware.ts
│       │   │   │   └── error.middleware.ts
│       │   │   ├── utils/
│       │   │   │   ├── logger.ts
│       │   │   │   └── errors.ts
│       │   │   └── types/
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   └── env.ts
│       │   └── app.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── tests/
│       ├── .env.example
│       └── package.json
│
├── packages/                # Shared packages
│   └── shared-types/        # Shared TypeScript types
│       ├── src/
│       │   └── index.ts     # User, Plan, Expense types
│       └── package.json
│
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── turbo.json               # Monorepo orchestration
├── package.json              # Root package.json
└── README.md