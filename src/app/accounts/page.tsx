"use client";

import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, App, Switch, Divider, Alert, Tag, Tooltip } from "antd";
import { UserAddOutlined, MailOutlined, LockOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { ProtectedPage } from "@/components/ProtectedPage";
import { AmsApi } from "@/lib/api/ams";
import { ApiError } from "@/lib/apiClient";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;

function CreateCseCard() {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { NAM: string; PAS: string; EMA: string }) => {
    setSubmitting(true);
    try {
      await AmsApi.signup({ ...values, ROL: "CSE" });
      message.success(`Service Executive account "${values.NAM}" created.`);
      form.resetFields();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={<span style={{ color: COLORS.text, fontWeight: 700 }}>Create Service Executive Account</span>}>
      <Text style={{ color: COLORS.muted, display: "block", marginBottom: 16 }}>
        Only supervisors can create Customer Service Executive accounts. Supervisor accounts themselves
        must be provisioned directly on the backend — there&apos;s no self-service route for that, by design.
      </Text>
      <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false}>
        <Form.Item name="NAM" label="Username" rules={[{ required: true, message: "Required" }]}>
          <Input prefix={<UserOutlined style={{ color: COLORS.muted }} />} placeholder="e.g. priya.cse" />
        </Form.Item>
        <Form.Item
          name="EMA"
          label="Email"
          rules={[
            { required: true, message: "Required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: COLORS.muted }} />} placeholder="priya@company.com" />
        </Form.Item>
        <Form.Item name="PAS" label="Temporary Password" rules={[{ required: true, message: "Required" }]}>
          <Input.Password prefix={<LockOutlined style={{ color: COLORS.muted }} />} placeholder="••••••••" />
        </Form.Item>
        <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} loading={submitting} style={{ height: 42, fontWeight: 700 }}>
          Create Account
        </Button>
      </Form>
    </Card>
  );
}

function ManageAccountCard() {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [promote, setPromote] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { NAM: string; EMA?: string; PAS?: string }) => {
    setSubmitting(true);
    try {
      await AmsApi.update(values.NAM, {
        EMA: values.EMA && values.EMA.trim() ? values.EMA.trim() : false,
        PAS: values.PAS && values.PAS.trim() ? values.PAS.trim() : false,
        ROL: promote,
      });
      message.success(`Account "${values.NAM}" updated${promote ? " and promoted to Supervisor" : ""}.`);
      form.resetFields();
      setPromote(false);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to update account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={<span style={{ color: COLORS.text, fontWeight: 700 }}>Manage a Service Executive Account</span>}>
      <Text style={{ color: COLORS.muted, display: "block", marginBottom: 16 }}>
        The backend doesn&apos;t expose a way to list existing accounts, so enter the exact username of
        the Service Executive you want to update.
      </Text>
      <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false}>
        <Form.Item name="NAM" label="Username" rules={[{ required: true, message: "Required" }]}>
          <Input prefix={<UserOutlined style={{ color: COLORS.muted }} />} placeholder="e.g. priya.cse" />
        </Form.Item>
        <Form.Item name="EMA" label="New Email" extra="Leave blank to keep unchanged.">
          <Input prefix={<MailOutlined style={{ color: COLORS.muted }} />} placeholder="updated@company.com" />
        </Form.Item>
        <Form.Item name="PAS" label="New Password" extra="Leave blank to keep unchanged.">
          <Input.Password prefix={<LockOutlined style={{ color: COLORS.muted }} />} placeholder="••••••••" />
        </Form.Item>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <Switch checked={promote} onChange={setPromote} />
          <Text style={{ color: COLORS.text }}>Promote to Supervisor</Text>
          {promote && (
            <Tag style={{ background: "rgba(245,166,35,0.12)", color: COLORS.warn, border: "none" }}>
              Can&apos;t be undone from this screen
            </Tag>
          )}
        </div>
        <Button type="primary" htmlType="submit" loading={submitting} style={{ height: 42, fontWeight: 700 }}>
          Save Changes
        </Button>
      </Form>

      <Divider style={{ borderColor: COLORS.border }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Text style={{ color: COLORS.text, fontWeight: 600, display: "block" }}>Delete Account</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>
            Not available — no account-deletion route is exposed by the backend yet.
          </Text>
        </div>
        <Tooltip title="Backend doesn't expose an account-deletion route yet">
          <Button danger icon={<DeleteOutlined />} disabled>
            Delete
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}

export default function AccountManagementPage() {
  return (
    <ProtectedPage allowedRoles={["SUP"]}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
          Account Management
        </Title>
        <Text style={{ color: COLORS.muted }}>Create and manage Customer Service Executive accounts.</Text>
      </div>

      <Alert
        type="info"
        showIcon
        message="No account directory yet"
        description="The backend doesn't currently expose a way to list all accounts, so account management here is username-driven rather than browsed from a table."
        style={{ marginBottom: 20, background: "rgba(0,212,184,0.08)", border: `1px solid ${COLORS.accentDim}` }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
        <CreateCseCard />
        <ManageAccountCard />
      </div>
    </ProtectedPage>
  );
}
