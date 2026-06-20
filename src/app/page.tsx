"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isLoading, isAuthenticated, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0E14" }}>
      <Spin size="large" />
    </div>
  );
}
