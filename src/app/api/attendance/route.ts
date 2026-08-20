import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");

    const where: any = {};
    if (dateStr) where.date = new Date(dateStr);
    if (employeeId) where.employeeId = employeeId;

    const attendance = await prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // data is an array of { employeeId, date, status, hoursWorked }
    const records = Array.isArray(data) ? data : [data];

    const operations = records.map((record: any) =>
      prisma.attendance.create({
        data: {
          employeeId: record.employeeId,
          date: new Date(record.date),
          status: record.status,
          hoursWorked: parseFloat(record.hoursWorked || "0"),
        },
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
