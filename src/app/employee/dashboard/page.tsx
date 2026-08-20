"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, User as UserIcon, Calendar, DollarSign } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AppShell from "@/app/components/AppShell";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    fetch("/api/employee/me")
      .then((res) => res.json())
      .then((data) => { if (data && !data.error) setEmployee(data); });
  }, []);

  const downloadPayslip = (payroll: any) => {
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYSLIP", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("PaySync — Advanced Payroll Management", 14, 32);
    doc.text(`Period: ${payroll.month}/${payroll.year}`, 140, 22);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text("Employee Details", 14, 60);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${employee.firstName} ${employee.lastName}`, 14, 70);
    doc.text(`Designation: ${employee.designation}`, 14, 78);
    doc.text(`Department: ${employee.department}`, 14, 86);

    const tableData = [
      ["Base Salary", `$${payroll.baseAmount.toFixed(2)}`],
      ["Bonuses", `+$${payroll.bonuses.toFixed(2)}`],
      ["Deductions", `-$${payroll.deductions.toFixed(2)}`],
      ["", ""],
      ["NET SALARY", `$${payroll.netSalary.toFixed(2)}`],
    ];

    (doc as any).autoTable({
      startY: 100,
      head: [["Description", "Amount"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [59, 130, 246] },
      didParseCell: function (data: any) {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 13;
        }
      },
    });

    doc.save(`Payslip_${employee.firstName}_${payroll.month}_${payroll.year}.pdf`);
  };

  if (!employee) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-zinc-500 animate-pulse">Loading your profile...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">My Dashboard</h1>
          <p className="text-zinc-500 text-sm">Your personal payroll overview</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800/50 bg-gradient-to-r from-blue-500/10 via-zinc-900/50 to-purple-500/10 p-6 mb-8"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{employee.firstName} {employee.lastName}</h2>
              <p className="text-zinc-400 text-sm">{employee.designation} · {employee.department}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Calendar size={12} /> Joined {new Date(employee.joinDate).toLocaleDateString()}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <DollarSign size={12} /> Base: ${employee.baseSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payslips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-white mb-4">My Payslips</h2>
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Base</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Net Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {employee.payrolls?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                      No payslips available yet.
                    </td>
                  </tr>
                ) : (
                  employee.payrolls?.map((pr: any) => (
                    <tr key={pr.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{pr.month}/{pr.year}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">${pr.baseAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">${pr.netSalary.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                          pr.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => downloadPayslip(pr)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/20"
                        >
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Attendance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-white mb-4">Recent Attendance</h2>
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {employee.attendances?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-zinc-500">
                      No attendance records.
                    </td>
                  </tr>
                ) : (
                  employee.attendances?.map((att: any) => (
                    <tr key={att.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{new Date(att.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                          att.status === "PRESENT" ? "bg-emerald-500/20 text-emerald-400"
                          : att.status === "HALF_DAY" ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                        }`}>
                          {att.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{att.hoursWorked}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
