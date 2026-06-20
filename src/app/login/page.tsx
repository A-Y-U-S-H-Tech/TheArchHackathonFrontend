"use client";

import React, { useState } from "react";
import { Form, Input, Button, Segmented, App, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import { UserRole } from "@/types";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("CUS");

  const onFinish = async (values: { NAM: string; PAS: string }) => {
    setLoading(true);
    try {
      await login(values, role);
      message.success("Welcome back.");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed. Check your credentials.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left brand panel */}
      <div
        className="bg-grid hidden-mobile-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: `radial-gradient(circle at 20% 20%, rgba(0,212,184,0.08), transparent 50%), ${COLORS.base}`,
          borderRight: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18,
            color: "#06120F",
            marginBottom: 28,
          }}
        >
          FO
        </div>
        <Title className="font-display" style={{ color: COLORS.text, fontSize: 42, marginBottom: 12, maxWidth: 520 }}>
          FMCG Operations Copilot
        </Title>
        <Text style={{ color: COLORS.muted, fontSize: 16, maxWidth: 480, lineHeight: 1.7 }}>
          AI-triaged complaint intake, knowledge retrieval, and ticket automation for consumer
          product operations — from leaking bottles to label mismatches, routed and resolved.
        </Text>
        <div style={{ display: "flex", gap: 28, marginTop: 48 }}>
          {[
            ["RAG-grounded triage", "Severity + dept routing from SOPs"],
            ["Live pipeline", "Track every complaint stage"],
          ].map(([h, sub]) => (
            <div key={h} style={{ borderLeft: `2px solid ${COLORS.accent}`, paddingLeft: 14 }}>
              <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{h}</div>
              <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 56px",
        }}
      >
        <Title level={2} className="font-display" style={{ color: COLORS.text, marginBottom: 4 }}>
          Sign in
        </Title>
        <Text style={{ color: COLORS.muted, marginBottom: 28, display: "block" }}>
          Enter your credentials to access the copilot.
        </Text>

        <div style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
            SIGNING IN AS
          </Text>
          <Segmented
            block
            value={role}
            onChange={(v) => setRole(v as UserRole)}
            options={[
              { label: "Customer", value: "CUS" },
              { label: "Service Exec.", value: "CSE" },
              { label: "Supervisor", value: "SUP" },
            ]}
          />
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item name="NAM" label="Username" rules={[{ required: true, message: "Username is required" }]}>
            <Input prefix={<UserOutlined style={{ color: COLORS.muted }} />} placeholder="your.username" />
          </Form.Item>
          <Form.Item name="PAS" label="Password" rules={[{ required: true, message: "Password is required" }]}>
            <Input.Password prefix={<LockOutlined style={{ color: COLORS.muted }} />} placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 8, height: 44, fontWeight: 700 }}>
            Sign in
          </Button>
        </Form>

        <Text style={{ color: COLORS.muted, marginTop: 24, textAlign: "center", display: "block" }}>
          New customer?{" "}
          <Link href="/signup" style={{ color: COLORS.accent, fontWeight: 600 }}>
            Create an account
          </Link>
        </Text>
      </div>
    </div>
  );
}
