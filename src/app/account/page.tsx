"use client";

import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, App } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth, roleLabel } from "@/context/AuthContext";
import { AmsApi } from "@/lib/api/ams";
import { ApiError } from "@/lib/apiClient";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { EMA?: string; PAS?: string }) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await AmsApi.update(user.NAM, {
        EMA: values.EMA && values.EMA.trim() ? values.EMA.trim() : false,
        PAS: values.PAS && values.PAS.trim() ? values.PAS.trim() : false,
      });
      message.success("Account updated.");
      form.resetFields();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to update account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedPage>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
          Account Settings
        </Title>
        <Text style={{ color: COLORS.muted }}>
          Signed in as <span className="mono">{user?.NAM}</span> · {user ? roleLabel(user.ROL) : ""}
        </Text>
      </div>

      <Card style={{ maxWidth: 480 }}>
        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item name="EMA" label="New Email" extra="Leave blank to keep your current email.">
            <Input prefix={<MailOutlined style={{ color: COLORS.muted }} />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="PAS" label="New Password" extra="Leave blank to keep your current password.">
            <Input.Password prefix={<LockOutlined style={{ color: COLORS.muted }} />} placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ height: 42, fontWeight: 700 }}>
            Save Changes
          </Button>
        </Form>
      </Card>
    </ProtectedPage>
  );
}
