"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Calendar } from "lucide-react";
import AppShell from "@/app/components/AppShell";

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ABSENT: "bg-red-500/20 text-red-400 border-red-500/30",
  HALF_DAY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  LEAVE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; hours: number }>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    const emps = Array.isArray(data) ? data : [];
    setEmployees(emps);

    const initial: any = {};
    emps.forEach((emp: any) => {
      initial[emp.id] = { status: "PRESENT", hours: 8 };
    });
    setAttendance(initial);
  };

  const handleStatusChange = (empId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status,
        hours: status === "PRESENT" ? 8 : status === "HALF_DAY" ? 4 : 0,
      },
    }));
  };

  const handleHoursChange = (empId: string, hours: number) => {
    setAttendance((prev) => ({ ...prev, [empId]: { ...prev[empId], hours } }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    setSaved(false);

    const payload = employees.map((emp: any) => ({
      employeeId: emp.id,
      date,
      status: attendance[emp.id]?.status || "PRESENT",
      hoursWorked: attendance[emp.id]?.hours ?? 8,
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Attendance</h1>
          <p className="text-zinc-500 text-sm">Mark daily attendance for all employees</p>
        </motion.div>

        {/* Date Picker & Save */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-zinc-500" />
            <input
              type="date"
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-emerald-400 flex items-center gap-1"
              >
                <Check size={14} /> Saved!
              </motion.span>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveAttendance}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Check size={16} /> {loading ? "Saving..." : "Save All"}
            </motion.button>
          </div>
        </motion.div>

        {/* Attendance Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {employees.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-sm font-bold text-blue-400">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-zinc-500">{emp.designation}</p>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(emp.id, status)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      attendance[emp.id]?.status === status
                        ? STATUS_COLORS[status]
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Hours */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-500">Hours Worked</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="w-20 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={attendance[emp.id]?.hours ?? 8}
                  onChange={(e) => handleHoursChange(emp.id, parseFloat(e.target.value))}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppShell>
  );
}
