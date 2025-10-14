"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useVerifyTokenQuery } from "@/lib/redux/features/auth/authApiSlice";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { Spinner } from "@/components/ui/spinner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Esegui solo sul client dopo l'hydration
  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const { isLoading, isError } = useVerifyTokenQuery(undefined, {
    skip: !isClient || !token || !!user,
  });

  useEffect(() => {
    if (isClient && !isLoading && (isError || !token)) {
      router.push("/login");
    }
  }, [isClient, isLoading, isError, token, router]);

  // Durante SSR o hydration mostra loading
  if (!isClient || isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bigster-background">
        <Spinner className="h-12 w-12 text-bigster-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
