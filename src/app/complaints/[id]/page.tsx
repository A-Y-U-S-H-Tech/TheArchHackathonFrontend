"use client";

import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Descriptions, App, Timeline, Tag, Skeleton } from "antd";
import { ThunderboltOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { CmsApi } from "@/lib/api/cms";
import { UrssApi, CtasApi } from "@/lib/api/misc";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { SeverityTag, StatusTag } from "@/components/StatusTags";
import { PipelineRail, PipelineStep } from "@/components/PipelineRail";
import { AgentTrace } from "@/components/AgentTrace";
import { COLORS } from "@/lib/theme";
import { TriageResult, Ticket } from "@/types";

const { Title, Text } = Typography;

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

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triaging, setTriaging] = useState(false);

  const isStaff = user?.ROL === "CSE" || user?.ROL === "SUP";

  const complaint = useFetch(() => CmsApi.getOne(params.id), [params.id]);
  const progress = useFetch(() => UrssApi.complaintProgress(params.id), [params.id]);

  const runTriage = async () => {
    setTriaging(true);
    try {
      const result = await CtasApi.analyze(params.id);
      setTriageResult(result);
      message.success("Triage analysis complete.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Triage analysis failed.";
      message.error(msg);
    } finally {
      setTriaging(false);
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
  const resolved = c.CST === true || c.CST === "true";
  const tickets = (progress.data ?? []) as Ticket[];
  const steps = buildPipelineSteps(tickets.length > 0, resolved);

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
          <Button type="primary" icon={<ThunderboltOutlined />} loading={triaging} onClick={runTriage}>
            Run AI Triage
          </Button>
        )}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <Title level={5} style={{ color: COLORS.text, marginTop: 0 }}>
          Pipeline Progress
        </Title>
        <PipelineRail steps={steps} />
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
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
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
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

        <Col xs={24} lg={10}>
          <Card title="AI Triage Trace">
            <AgentTrace result={triageResult} />
            {!triageResult && (
              <Text style={{ color: COLORS.muted, fontSize: 12, display: "block", marginTop: 10 }}>
                {isStaff ? "Run AI Triage to see category, severity, and routing reasoning." : "Triage results appear here once staff run analysis."}
              </Text>
            )}
          </Card>
        </Col>
      </Row>
    </ProtectedPage>
  );
}
