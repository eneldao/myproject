"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LoadingPage = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userId = window.location.pathname.split("/").pop(); // Extract user ID from URL
        const response = await fetch(`/api/user/${userId}`);
        const data = await response.json();

        if (response.ok) {
          if (data.userType === "freelancer") {
            router.push(`/freelancers/${userId}`);
          } else if (data.userType === "client") {
            router.push(`/client/${userId}`);
          } else {
            router.push(`/user/${userId}`);
          }
        } else {
          console.error("Failed to fetch user role:", data.error);
          router.push("/error"); // Redirect to an error page if needed
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        router.push("/error"); // Redirect to an error page if needed
      }
    };

    fetchUserRole();
  }, [router]);

  return <div>Loading...</div>;
};

export default LoadingPage;
