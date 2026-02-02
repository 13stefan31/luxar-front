"use client";
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Login from "@/components/otherPages/Login";
import { adminLogin } from "@/lib/adminApi";

export default function AdminLoginSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (credentials) => {
    setIsLoading(true);
    try {
      await adminLogin(credentials);
      toast.success("Uspješno ste prijavljeni.");
      router.push(process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PATH);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nešto je pošlo po zlu. Pokušajte ponovo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Login
      onSignIn={handleSignIn}
      isLoading={isLoading}
      showRegister={false}
    />
  );
}
