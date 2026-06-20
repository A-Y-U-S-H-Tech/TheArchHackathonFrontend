"use client";

import React, { useState } from "react";
import { Form, Input, Button, App, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmsApi } from "@/lib/api/ams";
import { ApiError } from "@/lib/apiClient";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { NAM: string; PAS: string; EMA: string }) => {
    setLoading(true);
    try {
      await AmsApi.signup({ ...values, ROL: "CUS" });
      message.success("Account created. Please sign in.");
      router.push("/login");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Signup failed.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
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
            marginBottom: 24,
          }}
        >
          FO
        </div>
        <Title level={2} className="font-display" style={{ color: COLORS.text, marginBottom: 4 }}>
          Create your account
        </Title>
        <Text style={{ color: COLORS.muted, marginBottom: 20, display: "block" }}>
          Customer accounts only — register to file and track complaints.
        </Text>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 20, background: "rgba(0,212,184,0.08)", border: `1px solid ${COLORS.accentDim}` }}
          message="Service Executive and Supervisor accounts are issued internally and can't self-register here."
        />

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item name="NAM" label="Username" rules={[{ required: true, message: "Username is required" }]}>
            <Input prefix={<UserOutlined style={{ color: COLORS.muted }} />} placeholder="your.username" />
          </Form.Item>
          <Form.Item
            name="EMA"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: COLORS.muted }} />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="PAS"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: COLORS.muted }} />} placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 8, height: 44, fontWeight: 700 }}>
            Create account
          </Button>
        </Form>

        <Text style={{ color: COLORS.muted, marginTop: 20, textAlign: "center", display: "block" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: COLORS.accent, fontWeight: 600 }}>
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
