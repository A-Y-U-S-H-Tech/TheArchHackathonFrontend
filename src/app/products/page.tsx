"use client";

import React, { useState } from "react";
import { Card, Typography, Table, Button, Modal, Form, Input, Select, App, Tag, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useFetch } from "@/lib/useFetch";
import { PmsApi } from "@/lib/api/pms";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { COLORS } from "@/lib/theme";
import { Product, ProductStatus } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

function statusColor(status: ProductStatus) {
  if (status === "Active") return COLORS.accent;
  if (status === "Deactive") return COLORS.warn;
  return COLORS.muted;
}

export default function ProductsPage() {
  const { message } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const products = useFetch(() => PmsApi.getAll(-1, -1), []);

  const onCreate = async (values: { PNM: string; PCAT: string; PDES: string; PSTA: ProductStatus }) => {
    setSubmitting(true);
    try {
      await PmsApi.create(values);
      message.success("Product created.");
      setCreateOpen(false);
      createForm.resetFields();
      products.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async (values: { PSTA: ProductStatus; PDES: string }) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await PmsApi.update(editTarget.PID, { PSTA: values.PSTA || false, PDES: values.PDES || false });
      message.success("Product updated.");
      setEditTarget(null);
      products.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pid: string) => {
    try {
      await PmsApi.delete(pid);
      message.success("Product deleted.");
      products.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to delete product.");
    }
  };

  return (
    <ProtectedPage allowedRoles={["SUP"]}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
            Products
          </Title>
          <Text style={{ color: COLORS.muted }}>Manage the product catalog complaints are filed against.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Add Product
        </Button>
      </div>

      <Card>
        {products.error ? (
          <ErrorBanner message={products.error} onRetry={products.refetch} />
        ) : (
          <Table<Product>
            loading={products.loading}
            dataSource={products.data ?? []}
            rowKey="PID"
            columns={[
              { title: "ID", dataIndex: "PID", key: "PID", render: (v) => <span className="mono">{v}</span> },
              { title: "Name", dataIndex: "PNM", key: "PNM" },
              { title: "Category", dataIndex: "PCAT", key: "PCAT" },
              { title: "Description", dataIndex: "PDES", key: "PDES", ellipsis: true },
              {
                title: "Status",
                dataIndex: "PSTA",
                key: "PSTA",
                render: (v: ProductStatus) => (
                  <Tag style={{ background: `${statusColor(v)}1F`, color: statusColor(v), border: "none", fontWeight: 600 }}>{v}</Tag>
                ),
              },
              {
                title: "",
                key: "actions",
                width: 100,
                render: (_, record) => (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditTarget(record);
                        editForm.setFieldsValue({ PSTA: record.PSTA, PDES: record.PDES });
                      }}
                    />
                    <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record.PID)} okText="Delete" okButtonProps={{ danger: true }}>
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal title="Add Product" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} destroyOnClose>
        <Form layout="vertical" form={createForm} onFinish={onCreate} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="PNM" label="Product Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Silk Shine Shampoo 250ml" />
          </Form.Item>
          <Form.Item name="PCAT" label="Category" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Hair Care" />
          </Form.Item>
          <Form.Item name="PDES" label="Description" rules={[{ required: true, message: "Required" }]}>
            <TextArea rows={3} placeholder="Short product description" />
          </Form.Item>
          <Form.Item name="PSTA" label="Status" rules={[{ required: true, message: "Required" }]} initialValue="Active">
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "Deactive", label: "Deactive" },
                { value: "Archived", label: "Archived" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 42, fontWeight: 700 }}>
            Create Product
          </Button>
        </Form>
      </Modal>

      <Modal title={`Edit ${editTarget?.PID ?? ""}`} open={!!editTarget} onCancel={() => setEditTarget(null)} footer={null} destroyOnClose>
        <Form layout="vertical" form={editForm} onFinish={onEdit} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="PDES" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="PSTA" label="Status">
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "Deactive", label: "Deactive" },
                { value: "Archived", label: "Archived" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 42, fontWeight: 700 }}>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </ProtectedPage>
  );
}
