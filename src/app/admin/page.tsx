"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in the effect
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#00BFFF] mb-2">Users</h2>
              <p className="text-white">Manage user accounts</p>
              <button className="mt-4 bg-[#00BFFF] text-white py-2 px-4 rounded hover:bg-[#0099CC]">
                View Users
              </button>
            </div>

            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#00BFFF] mb-2">
                Freelancers
              </h2>
              <p className="text-white">Manage freelancer profiles</p>
              <button className="mt-4 bg-[#00BFFF] text-white py-2 px-4 rounded hover:bg-[#0099CC]">
                View Freelancers
              </button>
            </div>

            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#00BFFF] mb-2">
                Transactions
              </h2>
              <p className="text-white">View and manage transactions</p>
              <button className="mt-4 bg-[#00BFFF] text-white py-2 px-4 rounded hover:bg-[#0099CC]">
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
