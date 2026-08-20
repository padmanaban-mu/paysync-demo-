"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders, DollarSign, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AppShell from "@/app/components/AppShell";

export default function SalarySimulator() {
  const [employee, setEmployee] = useState<any>(null);
  const [voluntaryDeduction, setVoluntaryDeduction] = useState(5); // percentage
  const [overtimeHours, setOvertimeHours] = useState(0);

  useEffect(() => {
    fetch("/api/employee/me")
      .then((res) => res.json())
      .then((data) => { if (data && !data.error) setEmployee(data); });
  }, []);

  const projections = useMemo(() => {
    if (!employee) return null;

    const base = employee.baseSalary;
    const taxDeduction = base * 0.1; // 10% tax
    const voluntaryAmt = base * (voluntaryDeduction / 100);
    const overtimePay = overtimeHours * (base / 30 / 8) * 1.5; // 1.5x hourly rate
    const totalDeductions = taxDeduction + voluntaryAmt;
    const grossPay = base + overtimePay;
    const netPay = grossPay - totalDeductions;

    return {
      base,
      taxDeduction: Math.round(taxDeduction * 100) / 100,
      voluntaryAmt: Math.round(voluntaryAmt * 100) / 100,
      overtimePay: Math.round(overtimePay * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      grossPay: Math.round(grossPay * 100) / 100,
      netPay: Math.round(netPay * 100) / 100,
    };
  }, [employee, voluntaryDeduction, overtimeHours]);

  if (!employee) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-zinc-500 animate-pulse">Loading simulator...</div>
        </div>
      </AppShell>
    );
  }

  const chartData = projections
    ? [
        { name: "Base Salary", value: projections.base, color: "#3b82f6" },
        { name: "Overtime", value: projections.overtimePay, color: "#22c55e" },
        { name: "Tax (10%)", value: -projections.taxDeduction, color: "#ef4444" },
        { name: "Voluntary", value: -projections.voluntaryAmt, color: "#f59e0b" },
        { name: "Net Pay", value: projections.netPay, color: "#8b5cf6" },
      ]
    : [];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Salary Simulator</h1>
          <p className="text-zinc-500 text-sm">Adjust sliders to see how changes affect your projected net pay</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Voluntary Deductions Slider */}
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <DollarSign size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Voluntary Deductions</h3>
                  <p className="text-xs text-zinc-500">401(k) / Provident Fund contribution</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-500">0%</span>
                  <span className="text-sm font-bold text-amber-400">{voluntaryDeduction}%</span>
                  <span className="text-xs text-zinc-500">30%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={voluntaryDeduction}
                  onChange={(e) => setVoluntaryDeduction(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-amber-500"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Monthly contribution: <span className="text-amber-400 font-medium">${projections?.voluntaryAmt.toFixed(2)}</span>
              </p>
            </div>

            {/* Overtime Slider */}
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Clock size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Expected Overtime Hours</h3>
                  <p className="text-xs text-zinc-500">Paid at 1.5x hourly rate</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-500">0h</span>
                  <span className="text-sm font-bold text-emerald-400">{overtimeHours}h</span>
                  <span className="text-xs text-zinc-500">40h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-emerald-500"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Overtime pay: <span className="text-emerald-400 font-medium">+${projections?.overtimePay.toFixed(2)}</span>
              </p>
            </div>

            {/* Summary Cards */}
            {projections && (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Gross Pay</p>
                  <p className="text-xl font-bold text-white">${projections.grossPay.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Total Deductions</p>
                  <p className="text-xl font-bold text-red-400">-${projections.totalDeductions.toFixed(2)}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Chart & Net Pay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Net Pay Hero */}
            <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-purple-500/10 via-zinc-900/50 to-blue-500/10 p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={16} className="text-purple-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Projected Net Pay</p>
              </div>
              <motion.p
                key={projections?.netPay}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold text-white"
              >
                ${projections?.netPay.toFixed(2)}
              </motion.p>
              <p className="text-xs text-zinc-500 mt-2">per month</p>
            </div>

            {/* Bar Chart */}
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Salary Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [`$${Math.abs(Number(value)).toFixed(2)}`, ""]}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
