"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Command } from "cmdk";
import { Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && role === "ADMIN") {
      fetch("/api/employees")
        .then((res) => res.json())
        .then((data) => setEmployees(Array.isArray(data) ? data : []));
    }
  }, [open, role]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!session) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all duration-200"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            >
              <Command className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center px-4 border-b border-zinc-800">
                  <Search size={16} className="text-zinc-500 mr-2" />
                  <Command.Input
                    ref={inputRef}
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search employees, pages..."
                    className="w-full py-4 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                  />
                </div>
                <Command.List className="max-h-72 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    No results found.
                  </Command.Empty>

                  {role === "ADMIN" && (
                    <Command.Group heading="Employees" className="text-xs text-zinc-600 px-2 py-1.5">
                      {employees.map((emp: any) => (
                        <Command.Item
                          key={emp.id}
                          value={`${emp.firstName} ${emp.lastName}`}
                          onSelect={() => {
                            router.push(`/admin/employees`);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-300 hover:bg-zinc-800 data-[selected=true]:bg-zinc-800 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mr-3">
                            <User size={12} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-zinc-500">{emp.department} · {emp.designation}</p>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  <Command.Group heading="Quick Navigation" className="text-xs text-zinc-600 px-2 py-1.5">
                    {[
                      { label: "Dashboard", href: role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard" },
                      ...(role === "ADMIN"
                        ? [
                            { label: "Employees", href: "/admin/employees" },
                            { label: "Attendance", href: "/admin/attendance" },
                            { label: "Payroll", href: "/admin/payroll" },
                          ]
                        : [{ label: "Salary Simulator", href: "/employee/simulator" }]),
                    ].map((item) => (
                      <Command.Item
                        key={item.href}
                        value={item.label}
                        onSelect={() => {
                          router.push(item.href);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-300 hover:bg-zinc-800 data-[selected=true]:bg-zinc-800 transition-colors"
                      >
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
