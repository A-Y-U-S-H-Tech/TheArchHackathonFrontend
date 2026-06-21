"use client";

import React, { useState } from "react";
import { Table, Card, Typography, Input, Tag, Button, Modal, Form, Select, App, Checkbox } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useFetch } from "@/lib/useFetch";
import { TgsApi } from "@/lib/api/tgs";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { StatusTag, SeverityTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";
import { Ticket } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function TicketsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const tickets = useFetch(() => TgsApi.returnAll(-1, -1), []);

  const filtered = (tickets.data ?? []).filter(
    (t) =>
      !search ||
      t.TID.toLowerCase().includes(search.toLowerCase()) ||
      t.CID.toLowerCase().includes(search.toLowerCase()) ||
      t.DEP.toLowerCase().includes(search.toLowerCase())
  );

  const onCreate = async (values: { CID: string; PRI: string; DEP: string; DES: string; ITO?: boolean }) => {
    setSubmitting(true);
    try {
      await TgsApi.create(values);
      message.success("Ticket created.");
      setModalOpen(false);
      form.resetFields();
      tickets.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedPage allowedRoles={["CSE", "SUP"]}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
            Tickets
          </Title>
          <Text style={{ color: COLORS.muted }}>All support tickets generated from complaints.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New Ticket
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Search by ticket ID, complaint ID, or department..."
          prefix={<SearchOutlined style={{ color: COLORS.muted }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 420 }}
        />

        {tickets.error ? (
          <ErrorBanner message={tickets.error} onRetry={tickets.refetch} />
        ) : (
          <Table<Ticket>
            loading={tickets.loading}
            dataSource={filtered}
            rowKey="TID"
            scroll={{ x: "max-content" }}
            onRow={(record) => ({ onClick: () => router.push(`/tickets/${record.TID}`), style: { cursor: "pointer" } })}
            columns={[
              { title: "Ticket ID", dataIndex: "TID", key: "TID", render: (v) => <span className="mono">{v}</span> },
              { title: "Complaint", dataIndex: "CID", key: "CID", render: (v) => <span className="mono">{v}</span> },
              {
                title: "Department",
                dataIndex: "DEP",
                key: "DEP",
                responsive: ["md"] as const,
                render: (v) => <Tag style={{ background: COLORS.panel2, color: COLORS.muted, border: "none" }}>{v}</Tag>,
              },
              { title: "Priority", dataIndex: "PRI", key: "PRI", render: (v) => <SeverityTag severity={v} /> },
              { title: "Status", dataIndex: "STA", key: "STA", render: (v) => <StatusTag status={v} /> },
              { title: "Created", dataIndex: "CRT", key: "CRT", responsive: ["md"] as const },
            ]}
          />
        )}
      </Card>

      <Modal title="Create Ticket" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={onCreate} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="CID" label="Complaint ID" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. 9" className="mono" />
          </Form.Item>
          <Form.Item name="DEP" label="Department" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Quality Control" />
          </Form.Item>
          <Form.Item name="PRI" label="Priority" rules={[{ required: true, message: "Required" }]}>
            <Select
              placeholder="Select priority"
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Critical", label: "Critical" },
              ]}
            />
          </Form.Item>
          <Form.Item name="DES" label="Description" rules={[{ required: true, message: "Required" }]}>
            <TextArea rows={4} placeholder="Describe the action needed..." />
          </Form.Item>
          <Form.Item name="ITO" valuePropName="checked" initialValue={false}>
            <Checkbox>Internal Only (visible to staff only)</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 42, fontWeight: 700 }}>
            Create Ticket
          </Button>
        </Form>
      </Modal>
    </ProtectedPage>
  );
}
