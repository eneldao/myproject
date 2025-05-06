"use client";

export const dynamic = "force-dynamic"; // 👈 add this line

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mt-3 h-6 w-6 mx-auto animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p>Redirecting to registration page...</p>
      </div>
    </div>
  );
}
