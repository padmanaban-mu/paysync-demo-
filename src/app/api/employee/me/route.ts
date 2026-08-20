import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employeeId = (session.user as any).employeeId;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        payrolls: { orderBy: { createdAt: "desc" } },
        attendances: { orderBy: { date: "desc" }, take: 10 },
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
