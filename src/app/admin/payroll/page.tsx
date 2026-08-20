"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Download, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AppShell from "@/app/components/AppShell";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const fetchPayrolls = async () => {
    const res = await fetch(`/api/payroll?month=${month}&year=${year}`);
    const data = await res.json();
    setPayrolls(Array.isArray(data) ? data : []);
  };

  const generatePayroll = async () => {
    setLoading(true);
    setGenerated(false);
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });

    if (res.ok) {
      setGenerated(true);
      fetchPayrolls();
      setTimeout(() => setGenerated(false), 3000);
    }
    setLoading(false);
  };

  const downloadPayslip = (payroll: any) => {
    const doc = new jsPDF();

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYSLIP", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("PaySync — Advanced Payroll Management", 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 22);
    doc.text(`Period: ${payroll.month}/${payroll.year}`, 140, 32);

    // Employee Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text("Employee Details", 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${payroll.employee.firstName} ${payroll.employee.lastName}`, 14, 70);
    doc.text(`Designation: ${payroll.employee.designation}`, 14, 78);
    doc.text(`Department: ${payroll.employee.department}`, 14, 86);
    doc.text(`Bank Account: ${payroll.employee.bankAccount}`, 140, 70);

    // Salary Table
    const tableData = [
      ["Base Salary", `$${payroll.baseAmount.toFixed(2)}`],
      ["Bonuses", `+$${payroll.bonuses.toFixed(2)}`],
      ["Deductions (Tax + Absences)", `-$${payroll.deductions.toFixed(2)}`],
      ["", ""],
      ["NET SALARY", `$${payroll.netSalary.toFixed(2)}`],
    ];

    (doc as any).autoTable({
      startY: 100,
      head: [["Description", "Amount"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: function (data: any) {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 13;
          data.cell.styles.fillColor = [241, 245, 249];
        }
      },
    });

    // Anomaly Warning
    if (payroll.anomalyFlag) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(14, finalY, 182, 20, 3, 3, "F");
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(9);
      doc.text("⚠ ANOMALY FLAGGED: Deductions/bonuses exceed normal thresholds. Review recommended.", 20, finalY + 12);
    }

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text("This is a system-generated document. No signature required.", 14, 280);
    doc.text("PaySync Payroll Management System", 140, 280);

    doc.save(`Payslip_${payroll.employee.firstName}_${payroll.employee.lastName}_${payroll.month}_${payroll.year}.pdf`);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Payroll</h1>
          <p className="text-zinc-500 text-sm">Generate and manage monthly payroll</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              {monthNames.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-24 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            {generated && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-400">
                ✓ Payroll generated!
              </motion.span>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePayroll}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Calculator size={16} /> {loading ? "Generating..." : "Generate Payroll"}
            </motion.button>
          </div>
        </motion.div>

        {/* Payroll Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Base</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Bonuses</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Calculator size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No payroll records for {monthNames[month - 1]} {year}</p>
                    <p className="text-xs text-zinc-600 mt-1">Click &quot;Generate Payroll&quot; to create records</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((pr, i) => (
                  <motion.tr
                    key={pr.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-zinc-800/30 transition-colors ${pr.anomalyFlag ? "bg-red-500/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                          {pr.employee?.firstName?.[0]}{pr.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            {pr.employee?.firstName} {pr.employee?.lastName}
                            {pr.anomalyFlag && <AlertTriangle size={12} className="text-red-400" />}
                          </p>
                          <p className="text-xs text-zinc-500">{pr.employee?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">${pr.baseAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400">+${pr.bonuses.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-red-400">-${pr.deductions.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">${pr.netSalary.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                        pr.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadPayslip(pr)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/20"
                      >
                        <Download size={12} /> PDF
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AppShell>
  );
}
