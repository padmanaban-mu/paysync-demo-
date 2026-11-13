# PaySync — Payroll & Workforce Management

PaySync is a Next.js application with admin and employee-facing areas for payroll and workforce workflows. The repository includes pages and API routes for employees, attendance, and payroll, along with authentication and a Prisma data layer.

## What is included

- Admin dashboard, employee records, attendance, and payroll pages
- Employee dashboard and payroll simulator page
- API route groups for authentication, employee information, attendance, and payroll
- Shared UI components, including the application shell and navigation
- Prisma schema with SQLite configured for local development

The presence of a page or route does not by itself confirm that the workflow is production-ready. Test the relevant flows locally before relying on them.

## Stack

| Area | Tools |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Database access | Prisma |
| Local database | SQLite |
| Authentication | NextAuth, bcryptjs |
| UI | Tailwind CSS, Framer Motion, cmdk, Lucide React |
| Charts | Recharts |

## Project layout

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
    │   └── components/
    ├── lib/
    └── middleware.ts
```

## Run locally

Install Node.js and npm first.

```bash
git clone https://github.com/padmanaban-mu/paysync-demo-.git
cd paysync-demo-
npm install
```

Create a local `.env` file and set the database connection and authentication values used by the application:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="use_a_long_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate the Prisma client, create/update the local schema, and start the development server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes before using real data

Payroll and attendance systems handle sensitive employee and compensation information. Use fabricated data for demos. Keep credentials and database backups out of Git, and review authentication, authorisation, input validation, payroll calculations, audit logging, and secure deployment before connecting real employee records.

## License

No license file was identified for this repository during this update. Add one if you want to define reuse and redistribution terms.
