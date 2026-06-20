"use client";

import React from "react";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0E14" }}>
      <Result
        status="404"
        title="Page not found"
        subTitle="That page doesn't exist."
        extra={
          <Button type="primary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        }
      />
    </div>
  );
}
