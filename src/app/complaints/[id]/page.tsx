"use client";

import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Descriptions, App, Timeline, Tag, Skeleton, Modal, Form, Input, Select, Space, Checkbox } from "antd";
import { ThunderboltOutlined, ArrowLeftOutlined, PlusOutlined, EditOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { CmsApi } from "@/lib/api/cms";
import { UrssApi, CtasApi } from "@/lib/api/misc";
import { TgsApi } from "@/lib/api/tgs";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { SeverityTag, StatusTag } from "@/components/StatusTags";
import { PipelineRail, PipelineStep } from "@/components/PipelineRail";
import { ThinkingTrace } from "@/components/ThinkingTrace";
import { SuggestedTicketPanel } from "@/components/SuggestedTicketPanel";
import { COLORS } from "@/lib/theme";
import { TriageResult, Ticket } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

const COMPLAINT_STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Closed"];

function buildPipelineSteps(hasTickets: boolean, resolved: boolean): PipelineStep[] {
  const labels = ["Complaint Received", "Knowledge Retrieval", "Triage Analysis", "Ticket Generated", "Resolved"];
  return labels.map((label, idx) => {
    if (idx === 0) return { label, status: "done" };
    if (idx === 4) return { label, status: resolved ? "done" : "pending" };
    if (idx <= 2) return { label, status: hasTickets ? "done" : "active" };
    if (idx === 3) return { label, status: hasTickets ? "done" : "pending" };
    return { label, status: "pending" };
  });
}

// Treats both possible backend shapes for CST (boolean per the URSS doc,
// or a status string per the CMS/Update doc) as "set" once a CSE has
// explicitly assigned a value — null/undefined/empty/false all read as
// "no status decision recorded yet".
function hasExplicitStatus(cst: unknown): boolean {
  return cst !== null && cst !== undefined && cst !== "" && cst !== false;
}

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triaging, setTriaging] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [ticketForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  const isCustomer = user?.ROL === "CUS";
  const isStaff = user?.ROL === "CSE" || user?.ROL === "SUP";

  const complaint = useFetch(() => CmsApi.getOne(params.id), [params.id]);
  const progress = useFetch(() => UrssApi.complaintProgress(params.id), [params.id]);

  const runTriage = async () => {
    setTriaging(true);
    setTriageResult(null);
    try {
      const result = await CtasApi.analyze(params.id);
      setTriageResult(result);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Triage analysis failed.";
      message.error(msg);
    } finally {
      setTriaging(false);
    }
  };

  const openTicketModal = () => {
    ticketForm.resetFields();
    setTicketModalOpen(true);
  };

  const submitTicket = async (values: { PRI: string; DEP: string; DES: string; ITO?: boolean }) => {
    setCreatingTicket(true);
    try {
      await TgsApi.create({ CID: params.id, PRI: values.PRI, DEP: values.DEP, DES: values.DES, ITO: values.ITO });
      message.success("Ticket created.");
      setTicketModalOpen(false);
      ticketForm.resetFields();
      progress.refetch();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create ticket.";
      message.error(msg);
    } finally {
      setCreatingTicket(false);
    }
  };

  const openStatusModal = () => {
    statusForm.setFieldsValue({ CST: undefined, CDES: complaint.data?.CDES });
    setStatusModalOpen(true);
  };

  const submitStatus = async (values: { CST: string; CDES: string }) => {
    setUpdatingStatus(true);
    try {
      await CmsApi.update(params.id, { CST: values.CST, CDES: values.CDES });
      message.success("Complaint status updated. The customer will now see this as the final update.");
      setStatusModalOpen(false);
      complaint.refetch();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update complaint status.";
      message.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (complaint.loading) {
    return (
      <ProtectedPage>
        <Skeleton active paragraph={{ rows: 6 }} />
      </ProtectedPage>
    );
  }

  if (complaint.error || !complaint.data) {
    return (
      <ProtectedPage>
        <ErrorBanner message={complaint.error ?? "Complaint not found."} onRetry={complaint.refetch} />
      </ProtectedPage>
    );
  }

  const c = complaint.data;
  const resolved = c.CST === true || c.CST === "true" || c.CST === "Resolved" || c.CST === "Closed";
  const tickets = (progress.data ?? []) as Ticket[];
  const steps = buildPipelineSteps(tickets.length > 0, resolved);

  // Per the URSS doc, tickets are returned in order where an increasing
  // ticket ID means the next action — so the last item is the most recent
  // action taken on this complaint.
  const lastTicket = tickets.length > 0 ? tickets[tickets.length - 1] : null;
  const statusFinalized = hasExplicitStatus(c.CST);

  return (
    <ProtectedPage>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 12, color: COLORS.muted, paddingLeft: 0 }}>
        Back
      </Button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Title level={3} className="font-display" style={{ color: COLORS.text, margin: 0 }}>
              <span className="mono">{c.CID}</span>
            </Title>
            <StatusTag status={c.CST} />
            <SeverityTag severity={c.CSEV} />
          </div>
          <Text style={{ color: COLORS.muted }}>Filed by {c.CUS} on {c.CDT}</Text>
        </div>
        {isStaff && (
          <Space wrap>
            <Button icon={<ThunderboltOutlined />} loading={triaging} onClick={runTriage}>
              Run AI Triage
            </Button>
            <Button icon={<PlusOutlined />} onClick={openTicketModal}>
              Create Ticket Manually
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={openStatusModal}>
              Update Status
            </Button>
          </Space>
        )}
      </div>

      {/* Final Update — once staff have set an explicit complaint status,
          the customer sees the most recent ticket surfaced as the closing
          word on their complaint, instead of having to read the full
          operational ticket history. */}
      {isCustomer && statusFinalized && lastTicket && (
        <Card
          style={{ marginBottom: 20, background: "rgba(0,212,184,0.06)", borderColor: COLORS.accentDim }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CheckCircleFilled style={{ color: COLORS.accent, fontSize: 16 }} />
            <Title level={5} style={{ color: COLORS.text, margin: 0 }}>
              Final Update
            </Title>
            <StatusTag status={c.CST} />
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Handled by">{lastTicket.DEP}</Descriptions.Item>
            <Descriptions.Item label="Outcome">{lastTicket.DES}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Pipeline rail — customer-facing tracking only. Staff work the queue,
          they don't need a progress-bar metaphor for their own work. */}
      {isCustomer && (
        <Card style={{ marginBottom: 20 }}>
          <Title level={5} style={{ color: COLORS.text, marginTop: 0 }}>
            Pipeline Progress
          </Title>
          <PipelineRail steps={steps} />
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={isStaff ? 14 : 24}>
          <Card title="Complaint Details" style={{ marginBottom: 20 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Product ID">
                <span className="mono">{c.PID}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Description">{c.CDES}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Linked Tickets">
            {progress.error ? (
              <ErrorBanner message={progress.error} onRetry={progress.refetch} />
            ) : progress.loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : tickets.length === 0 ? (
              <Text style={{ color: COLORS.muted }}>No tickets generated yet.</Text>
            ) : (
              <Timeline
                items={tickets.map((t) => ({
                  color: COLORS.accent,
                  children: (
                    <div
                      key={t.TID}
                      onClick={() => router.push(`/tickets/${t.TID}`)}
                      style={{ cursor: "pointer", marginBottom: 8 }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2, flexWrap: "wrap" }}>
                        <span className="mono" style={{ color: COLORS.accent, fontWeight: 600 }}>
                          {t.TID}
                        </span>
                        <Tag style={{ background: COLORS.panel2, color: COLORS.muted, border: "none" }}>{t.DEP}</Tag>
                        <StatusTag status={t.STA} />
                      </div>
                      <Text style={{ color: COLORS.muted, fontSize: 13 }}>{t.DES}</Text>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>

        {isStaff && (
          <Col xs={24} lg={10}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(triaging || triageResult) && <ThinkingTrace loading={triaging} result={triageResult} />}

              {!triaging && triageResult?.sample_ticket && (
                <SuggestedTicketPanel
                  ticket={triageResult.sample_ticket}
                  complaintId={params.id}
                  onCreated={() => progress.refetch()}
                />
              )}

              {!triaging && !triageResult && (
                <Card style={{ background: COLORS.panel2, borderColor: COLORS.border }}>
                  <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                    Run AI Triage to see the reasoning trace, a classification, and a suggested ticket you can
                    accept or edit.
                  </Text>
                </Card>
              )}
            </div>
          </Col>
        )}
      </Row>

      <Modal
        title="Create Ticket"
        open={ticketModalOpen}
        onCancel={() => setTicketModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={ticketForm} onFinish={submitTicket} requiredMark={false} style={{ marginTop: 16 }}>
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
          <Button type="primary" htmlType="submit" loading={creatingTicket} block style={{ height: 42, fontWeight: 700 }}>
            Create Ticket
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Update Complaint Status"
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={statusForm} onFinish={submitStatus} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="CST" label="Status" rules={[{ required: true, message: "Select a status" }]}>
            <Select placeholder="Select status" options={COMPLAINT_STATUS_OPTIONS.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="CDES" label="Description" rules={[{ required: true, message: "Required" }]} extra="Pre-filled with the current description — edit if needed.">
            <TextArea rows={4} />
          </Form.Item>
          <Text style={{ color: COLORS.muted, fontSize: 12, display: "block", marginBottom: 16 }}>
            Once a status is set, the customer will see the most recent ticket on this complaint as their
            final update.
          </Text>
          <Button type="primary" htmlType="submit" loading={updatingStatus} block style={{ height: 42, fontWeight: 700 }}>
            Save Status
          </Button>
        </Form>
      </Modal>
    </ProtectedPage>
  );
}
