"use client";

import React, { useState } from "react";
import { Card, Typography, Button, Descriptions, App, Space, Skeleton, Popconfirm, Modal, Form, Input, Select, Checkbox, Tag } from "antd";
import { ArrowLeftOutlined, RiseOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { TgsApi } from "@/lib/api/tgs";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { StatusTag, SeverityTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;
const { TextArea } = Input;

const TICKET_STATUS_OPTIONS = ["Open", "In Progress", "Escalated", "Closed"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [actioning, setActioning] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm] = Form.useForm();

  const isSupervisor = user?.ROL === "SUP";

  const ticket = useFetch(() => TgsApi.getOne(params.id), [params.id]);

  const handleEscalate = async () => {
    setActioning(true);
    try {
      await TgsApi.escalate(params.id);
      message.success("Ticket escalated.");
      ticket.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to escalate ticket.");
    } finally {
      setActioning(false);
    }
  };

  const handleClose = async () => {
    setActioning(true);
    try {
      await TgsApi.close(params.id);
      message.success("Ticket closed.");
      ticket.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to close ticket.");
    } finally {
      setActioning(false);
    }
  };

  const openEditModal = () => {
    if (!ticket.data) return;
    editForm.setFieldsValue({
      DEP: ticket.data.DEP,
      PRI: ticket.data.PRI,
      STA: ticket.data.STA,
      DES: ticket.data.DES,
      ITO: ticket.data.ITO ?? false,
    });
    setEditModalOpen(true);
  };

  const submitEdit = async (values: { DEP: string; PRI: string; STA: string; DES: string; ITO?: boolean }) => {
    setSaving(true);
    try {
      await TgsApi.update(params.id, values);
      message.success("Ticket updated.");
      setEditModalOpen(false);
      ticket.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  if (ticket.loading) {
    return (
      <ProtectedPage allowedRoles={["CSE", "SUP"]}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </ProtectedPage>
    );
  }

  if (ticket.error || !ticket.data) {
    return (
      <ProtectedPage allowedRoles={["CSE", "SUP"]}>
        <ErrorBanner message={ticket.error ?? "Ticket not found."} onRetry={ticket.refetch} />
      </ProtectedPage>
    );
  }

  const t = ticket.data;
  const isClosed = t.STA === "Closed";

  return (
    <ProtectedPage allowedRoles={["CSE", "SUP"]}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 12, color: COLORS.muted, paddingLeft: 0 }}>
        Back
      </Button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <Title level={3} className="font-display" style={{ color: COLORS.text, margin: 0 }}>
              <span className="mono">{t.TID}</span>
            </Title>
            <StatusTag status={t.STA} />
            <SeverityTag severity={t.PRI} />
            {t.ITO && (
              <Tag style={{ background: COLORS.panel2, color: COLORS.muted, border: "none", fontWeight: 600 }}>
                Internal Only
              </Tag>
            )}
          </div>
          <Text style={{ color: COLORS.muted }}>
            Linked to complaint{" "}
            <span className="mono" style={{ color: COLORS.accent, cursor: "pointer" }} onClick={() => router.push(`/complaints/${t.CID}`)}>
              {t.CID}
            </span>
          </Text>
        </div>
        <Space wrap>
          {isSupervisor && (
            <Button icon={<EditOutlined />} onClick={openEditModal}>
              Edit Ticket
            </Button>
          )}
          {!isClosed && (
            <>
              <Button icon={<RiseOutlined />} loading={actioning} onClick={handleEscalate}>
                Escalate
              </Button>
              <Popconfirm title="Close this ticket?" onConfirm={handleClose} okText="Close" cancelText="Cancel">
                <Button type="primary" icon={<CheckCircleOutlined />} loading={actioning}>
                  Close Ticket
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      </div>

      <Card title="Ticket Details">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Department">{t.DEP}</Descriptions.Item>
          <Descriptions.Item label="Priority">
            <SeverityTag severity={t.PRI} />
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag status={t.STA} />
          </Descriptions.Item>
          <Descriptions.Item label="Visibility">{t.ITO ? "Internal only" : "Visible to customer"}</Descriptions.Item>
          <Descriptions.Item label="Created">{t.CRT}</Descriptions.Item>
          <Descriptions.Item label="Description">{t.DES}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Edit Ticket"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={submitEdit} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="DEP" label="Department" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Quality Control" />
          </Form.Item>
          <Form.Item name="PRI" label="Priority" rules={[{ required: true, message: "Required" }]}>
            <Select options={PRIORITY_OPTIONS.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="STA" label="Status" rules={[{ required: true, message: "Required" }]}>
            <Select options={TICKET_STATUS_OPTIONS.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="DES" label="Description" rules={[{ required: true, message: "Required" }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="ITO" valuePropName="checked">
            <Checkbox>Internal Only (visible to staff only)</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block style={{ height: 42, fontWeight: 700 }}>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </ProtectedPage>
  );
}
