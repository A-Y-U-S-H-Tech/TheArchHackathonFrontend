"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin, Result, Button } from "antd";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import AppShell from "./AppShell";

export function ProtectedPage({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0E14" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.ROL)) {
    return (
      <AppShell>
        <Result
          status="403"
          title="Restricted"
          subTitle="Your role doesn't have access to this section."
          extra={
            <Button type="primary" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          }
        />
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
