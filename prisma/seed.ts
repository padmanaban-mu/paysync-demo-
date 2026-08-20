import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.payroll.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@payroll.com",
      passwordHash: "password",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create 5 Employees
  const employeesData = [
    {
      email: "john.doe@payroll.com",
      firstName: "John",
      lastName: "Doe",
      department: "Engineering",
      designation: "Senior Software Engineer",
      baseSalary: 8500,
      joinDate: new Date("2022-03-15"),
      bankAccount: "ACCT-001-9283",
    },
    {
      email: "jane.smith@payroll.com",
      firstName: "Jane",
      lastName: "Smith",
      department: "Marketing",
      designation: "Marketing Manager",
      baseSalary: 7200,
      joinDate: new Date("2021-07-01"),
      bankAccount: "ACCT-002-4756",
    },
    {
      email: "raj.patel@payroll.com",
      firstName: "Raj",
      lastName: "Patel",
      department: "Engineering",
      designation: "DevOps Engineer",
      baseSalary: 7800,
      joinDate: new Date("2023-01-10"),
      bankAccount: "ACCT-003-8192",
    },
    {
      email: "maria.garcia@payroll.com",
      firstName: "Maria",
      lastName: "Garcia",
      department: "Finance",
      designation: "Financial Analyst",
      baseSalary: 6500,
      joinDate: new Date("2022-11-20"),
      bankAccount: "ACCT-004-3647",
    },
    {
      email: "alex.chen@payroll.com",
      firstName: "Alex",
      lastName: "Chen",
      department: "Design",
      designation: "UX Lead",
      baseSalary: 7000,
      joinDate: new Date("2023-06-05"),
      bankAccount: "ACCT-005-7291",
    },
  ];

  for (const empData of employeesData) {
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        passwordHash: "password",
        role: "EMPLOYEE",
        Employee: {
          create: {
            firstName: empData.firstName,
            lastName: empData.lastName,
            department: empData.department,
            designation: empData.designation,
            baseSalary: empData.baseSalary,
            joinDate: empData.joinDate,
            bankAccount: empData.bankAccount,
          },
        },
      },
      include: { Employee: true },
    });
    console.log(`✅ Employee created: ${user.Employee?.firstName} ${user.Employee?.lastName}`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
