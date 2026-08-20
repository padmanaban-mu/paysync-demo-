"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Clock, AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react";
import AppShell from "@/app/components/AppShell";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    pendingCount: 0,
    anomalies: [] as any[],
  });

  useEffect(() => {
    async function fetchData() {
      const empRes = await fetch("/api/employees");
      const emps = await empRes.json();

      const now = new Date();
      const prRes = await fetch(`/api/payroll?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      const prs = await prRes.json();

      const payrolls = Array.isArray(prs) ? prs : [];
      const totalPayroll = payrolls.reduce((acc: number, curr: any) => acc + curr.netSalary, 0);
      const pendingCount = payrolls.filter((p: any) => p.status === "PENDING").length;
      const anomalies = payrolls.filter((p: any) => p.anomalyFlag);

      setStats({
        totalEmployees: Array.isArray(emps) ? emps.length : 0,
        totalPayroll,
        pendingCount,
        anomalies,
      });
    }
    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "blue",
      gradient: "from-blue-500/20 to-blue-600/5",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Payroll This Month",
      value: `$${stats.totalPayroll.toFixed(2)}`,
      icon: DollarSign,
      color: "green",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingCount,
      icon: Clock,
      color: "yellow",
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-zinc-500 text-sm">Overview of your payroll operations</p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-br ${card.gradient} p-6`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.iconBg}`}>
                    <Icon size={20} className={card.iconColor} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs text-zinc-500">
                  <ArrowUpRight size={12} className="text-emerald-400 mr-1" />
                  <span className="text-emerald-400">+2.5%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Anomaly Insights</h3>
                <p className="text-xs text-zinc-500">Flagged payroll records requiring review</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {stats.anomalies.length} flagged
            </span>
          </div>
          <div className="p-6">
            {stats.anomalies.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No anomalies detected. All payroll records look healthy.</p>
                <p className="text-xs text-zinc-600 mt-1">Generate payroll to see AI insights.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.anomalies.map((a: any, i: number) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {a.employee?.firstName} {a.employee?.lastName}
                        </p>
                        <p className="text-xs text-zinc-500">{a.employee?.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-400 font-medium">
                        Deductions: ${a.deductions.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {((a.deductions / a.baseAmount) * 100).toFixed(1)}% of base
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
