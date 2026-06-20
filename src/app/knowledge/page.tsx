"use client";

import React, { useState } from "react";
import { Card, Typography, Table, Button, Modal, Form, Input, Upload, App, Tag, Popconfirm } from "antd";
import { UploadOutlined, InboxOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useFetch } from "@/lib/useFetch";
import { PkmsApi } from "@/lib/api/pkms";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { COLORS } from "@/lib/theme";
import { KnowledgeDocument } from "@/types";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function KnowledgePage() {
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const docs = useFetch(() => PkmsApi.allDocuments(), []);

  const onFinish = async (values: { DID: string; DNM: string; DTYPE: string }) => {
    const file = fileList[0]?.originFileObj as File | undefined;
    if (!file) {
      message.error("Please attach a file.");
      return;
    }
    let dtype = values.DTYPE.trim();
    if (!dtype.endsWith("/")) dtype += "/";

    setSubmitting(true);
    try {
      await PkmsApi.upload(file, { DID: values.DID, DNM: values.DNM, DTYPE: dtype });
      message.success("Document uploaded and sent for processing.");
      setModalOpen(false);
      form.resetFields();
      setFileList([]);
      docs.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await PkmsApi.delete(docId);
      message.success("Document deleted.");
      docs.refetch();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to delete document.");
    }
  };

  return (
    <ProtectedPage allowedRoles={["SUP"]}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
            Knowledge Base
          </Title>
          <Text style={{ color: COLORS.muted }}>
            SOPs, catalogs, and quality guidelines that ground the AI triage agent.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      <Card>
        {docs.error ? (
          <ErrorBanner message={docs.error} onRetry={docs.refetch} />
        ) : (
          <Table<KnowledgeDocument>
            loading={docs.loading}
            dataSource={docs.data ?? []}
            rowKey="DID"
            columns={[
              { title: "ID", dataIndex: "DID", key: "DID", render: (v) => <span className="mono">{v}</span> },
              { title: "Name", dataIndex: "DNM", key: "DNM" },
              {
                title: "Type",
                dataIndex: "DTYPE",
                key: "DTYPE",
                render: (v) => <Tag style={{ background: COLORS.panel2, color: COLORS.accent, border: "none" }} className="mono">{v}</Tag>,
              },
              {
                title: "",
                key: "actions",
                width: 60,
                render: (_, record) => (
                  <Popconfirm title="Delete this document?" onConfirm={() => handleDelete(record.DID)} okText="Delete" okButtonProps={{ danger: true }}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        title="Upload Knowledge Document"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="DID" label="Document ID" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. DOC-2031" />
          </Form.Item>
          <Form.Item name="DNM" label="Document Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Shampoo Bottle Leakage SOP" />
          </Form.Item>
          <Form.Item
            name="DTYPE"
            label="Document Type / Path"
            rules={[{ required: true, message: "Required" }]}
            extra="Format: category/subcategory/ (trailing slash added automatically)"
          >
            <Input placeholder="e.g. sop/packaging" />
          </Form.Item>
          <Form.Item label="File" required>
            <Dragger
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              maxCount={1}
            >
              <p style={{ fontSize: 28, color: COLORS.accent }}>
                <InboxOutlined />
              </p>
              <p style={{ color: COLORS.text }}>Click or drag a file to upload</p>
              <p style={{ color: COLORS.muted, fontSize: 12 }}>PDF, DOCX, or text documents</p>
            </Dragger>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<UploadOutlined />} loading={submitting} block style={{ height: 42, fontWeight: 700 }}>
            Upload
          </Button>
        </Form>
      </Modal>
    </ProtectedPage>
  );
}
