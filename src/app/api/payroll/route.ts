import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const payrolls = await prisma.payroll.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(payrolls);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { month, year } = await req.json();

    // Fetch all employees
    const employees = await prisma.employee.findMany();
    const payrollRecords = [];

    for (const emp of employees) {
      // Fetch attendance for this month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const attendances = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
        },
      });

      // Calculate deductions based on absences
      let absentDays = 0;
      attendances.forEach((att) => {
        if (att.status === "ABSENT") absentDays += 1;
        if (att.status === "HALF_DAY") absentDays += 0.5;
      });

      const dailyWage = emp.baseSalary / 30;
      const absentDeduction = absentDays * dailyWage;

      // 10% tax deduction
      const taxDeduction = emp.baseSalary * 0.1;

      const totalDeductions = absentDeduction + taxDeduction;

      // Random bonus (0-15% of base for demo variety)
      const bonusPercent = Math.random() * 0.15;
      const bonuses = Math.round(emp.baseSalary * bonusPercent * 100) / 100;

      const netSalary = emp.baseSalary + bonuses - totalDeductions;

      // AI Anomaly Detection:
      // Flag if deductions > 30% of base OR bonuses > 20% of base
      const anomalyFlag =
        totalDeductions > emp.baseSalary * 0.3 || bonuses > emp.baseSalary * 0.2;

      const payroll = await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month: parseInt(String(month)),
          year: parseInt(String(year)),
          baseAmount: emp.baseSalary,
          bonuses,
          deductions: Math.round(totalDeductions * 100) / 100,
          netSalary: Math.round(netSalary * 100) / 100,
          status: "PENDING",
          anomalyFlag,
        },
        include: { employee: true },
      });
      payrollRecords.push(payroll);
    }

    return NextResponse.json(payrollRecords);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate payroll" }, { status: 500 });
  }
}
