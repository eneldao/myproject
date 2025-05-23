"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaExchangeAlt,
  FaSignOutAlt,
  FaInfoCircle,
  FaEnvelope,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/dashboard")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaHome className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/profile")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/transactions")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaExchangeAlt className="w-5 h-5" />
          <span>Transactions</span>
        </Link>

        <Link
          href="/services"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/services")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaCog className="w-5 h-5" />
          <span>Services</span>
        </Link>

        <Link
          href="/about"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/about")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaInfoCircle className="w-5 h-5" />
          <span>About</span>
        </Link>

        <Link
          href="/contact"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/contact")
              ? "bg-[#00BFFF] text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <FaEnvelope className="w-5 h-5" />
          <span>Contact</span>
        </Link>

        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors w-full">
          <FaSignOutAlt className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
