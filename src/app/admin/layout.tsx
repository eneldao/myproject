import { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Users, DollarSign, Settings } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 border-r bg-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="px-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className="flex items-center rounded-md px-3 py-2 hover:bg-slate-100"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center rounded-md px-3 py-2 hover:bg-slate-100"
              >
                <Users className="mr-2 h-5 w-5" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/admin/transactions"
                className="flex items-center rounded-md px-3 py-2 hover:bg-slate-100"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Transactions
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center rounded-md px-3 py-2 hover:bg-slate-100"
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
