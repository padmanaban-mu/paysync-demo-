import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { user: true },
      orderBy: { firstName: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: "password",
        role: "EMPLOYEE",
        Employee: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            department: data.department,
            designation: data.designation,
            baseSalary: parseFloat(data.baseSalary),
            joinDate: new Date(data.joinDate),
            bankAccount: data.bankAccount,
          },
        },
      },
      include: { Employee: true },
    });

    return NextResponse.json(user.Employee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.employee.delete({ where: { id } });
    await prisma.user.delete({ where: { id: employee.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
