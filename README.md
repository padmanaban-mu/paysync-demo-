# PaySync — Payroll & Workforce Management

PaySync is a Next.js payroll/workforce application codebase with administrator and employee experiences. Its repository includes attendance and payroll management, employee APIs, authentication, a Prisma schema, and an employee-facing simulator page.

## Main areas

- **Admin workspace:** dashboard, employee records, attendance, and payroll.
- **Employee workspace:** employee dashboard and a payroll simulator page.
- **API routes:** authentication, employee profile, employee records, attendance, and payroll.
- **Shared interface:** application shell, sidebar, and command palette components.
- **Persistence:** Prisma ORM with SQLite configured in the schema.

These are codebase capabilities inferred from the current route and component structure. Confirm their behaviour with a local run and tests before describing them as production features.

## Technology

| Layer | Stack |
| --- | --- |
| Application | Next.js App Router, React |
| Language | TypeScript |
| Data access | Prisma |
| Local database | SQLite |
| Authentication | NextAuth, bcryptjs |
| UI utilities | Tailwind CSS, Framer Motion, cmdk, Lucide React |
| Visualisation | Recharts |

## Repository structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── app/
    │   ├── admin/
    │   │   ├── attendance/
    │   │   ├── dashboard/
    │   │   ├── employees/
    │   │   └── payroll/
    │   ├── employee/
    │   │   ├── dashboard/
    │   │   └── simulator/
    │   ├── api/
    │   │   ├── attendance/
    │   │   ├── auth/
    │   │   ├── employee/
    │   │   ├── employees/
    │   │   └── payroll/
    │   └── components/
    ├── lib/
    └── middleware.ts
```

## Local setup

### Prerequisites

- Node.js compatible with the installed Next.js version
- npm

### Install and configure

```bash
git clone https://github.com/padmanaban-mu/paysync-demo-.git
cd paysync-demo-
npm install
```

Create a local `.env` file. Configure the SQLite connection and authentication settings expected by the application:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace_with_a_long_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

Prepare Prisma and run the application:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Responsible demo data

Payroll software handles sensitive employee, compensation, attendance, and potentially banking information. Use fabricated records for demonstrations. Never commit real personal data, passwords, API keys, or production database backups. Review access control, validation, payroll rules, auditability, and secure deployment before using real employee data.

## License

No license file was identified during this documentation update. Check licensing before reuse or redistribution.
