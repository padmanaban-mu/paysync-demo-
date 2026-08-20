"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  LogOut,
  Search,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!session || pathname === "/login") return null;

  const role = (session.user as any)?.role;

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: Calendar },
    { href: "/admin/payroll", label: "Payroll", icon: DollarSign },
  ];

  const employeeLinks = [
    { href: "/employee/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/employee/simulator", label: "Salary Simulator", icon: Sliders },
  ];

  const links = role === "ADMIN" ? adminLinks : employeeLinks;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`${collapsed ? "w-20" : "w-64"} transition-all duration-300 flex flex-col border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DollarSign size={16} className="text-blue-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PaySync</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} className={`${collapsed ? "" : "mr-3"} flex-shrink-0`} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-zinc-800/50">
        <div className={`flex items-center ${collapsed ? "justify-center" : ""} mb-3`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-zinc-300 truncate">{session.user?.name || session.user?.email}</p>
              <p className="text-xs text-zinc-600 capitalize">{role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`w-full flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200`}
        >
          <LogOut size={16} className={collapsed ? "" : "mr-2"} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </motion.div>
  );
}
