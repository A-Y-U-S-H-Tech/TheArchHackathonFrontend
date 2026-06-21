"use client";

import React from "react";
import { Row, Col, Card, Statistic, Typography, Table, Button, Skeleton } from "antd";
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { DasApi, UrssApi } from "@/lib/api/misc";
import { CmsApi } from "@/lib/api/cms";
import { ErrorBanner } from "@/components/StateBanners";
import { SeverityTag, StatusTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";
import { Complaint } from "@/types";

const { Title, Text } = Typography;

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <Card style={{ height: "100%" }} bodyStyle={{ padding: 20 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: 600 }}>{title}</Text>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${color}1F`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                fontSize: 16,
              }}
            >
              {icon}
            </div>
          </div>
          <Statistic value={value ?? 0} valueStyle={{ color: COLORS.text, fontWeight: 700, fontFamily: "var(--font-space-grotesk)" }} />
        </>
      )}
    </Card>
  );
}

function SupervisorDashboard() {
  const router = useRouter();
  const overview = useFetch(() => DasApi.overview(), []);
  const recent = useFetch(() => CmsApi.returnAll(0, 9), []);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <StatCard title="Total Complaints" value={overview.data?.total_complaints} icon={<FileSearchOutlined />} color={COLORS.accent} loading={overview.loading} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Resolved" value={overview.data?.resolved_complaints} icon={<CheckCircleOutlined />} color={COLORS.accent} loading={overview.loading} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Open" value={overview.data?.open_complaints} icon={<ClockCircleOutlined />} color={COLORS.warn} loading={overview.loading} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="High Severity" value={overview.data?.high_severity} icon={<WarningOutlined />} color={COLORS.alert} loading={overview.loading} />
        </Col>
      </Row>

      {overview.error && <ErrorBanner message={overview.error} onRetry={overview.refetch} />}

      <Card
        title="Recent Complaints"
        extra={
          <Button type="link" onClick={() => router.push("/complaints")} style={{ padding: 0 }}>
            View all
          </Button>
        }
      >
        {recent.error ? (
          <ErrorBanner message={recent.error} onRetry={recent.refetch} />
        ) : (
          <Table<Complaint>
            loading={recent.loading}
            dataSource={recent.data ?? []}
            rowKey="CID"
            pagination={false}
            scroll={{ x: "max-content" }}
            onRow={(record) => ({ onClick: () => router.push(`/complaints/${record.CID}`), style: { cursor: "pointer" } })}
            columns={[
              { title: "ID", dataIndex: "CID", key: "CID", render: (v) => <span className="mono">{v}</span> },
              { title: "Customer", dataIndex: "CUS", key: "CUS", responsive: ["sm"] as const },
              { title: "Product", dataIndex: "PID", key: "PID", responsive: ["md"] as const, render: (v) => <span className="mono">{v}</span> },
              { title: "Severity", dataIndex: "CSEV", key: "CSEV", render: (v) => <SeverityTag severity={v} /> },
              { title: "Status", dataIndex: "CST", key: "CST", render: (v) => <StatusTag status={v} /> },
            ]}
          />
        )}
      </Card>
    </>
  );
}

function CustomerDashboard() {
  const router = useRouter();
  const latest = useFetch(() => UrssApi.latestComplaint(), []);
  const all = useFetch(() => UrssApi.returnAllComplaints(0, 9), []);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Latest Complaint" style={{ height: "100%" }}>
            {latest.loading ? (
              <Skeleton active />
            ) : latest.error ? (
              <Text style={{ color: COLORS.muted }}>No complaints filed yet.</Text>
            ) : latest.data ? (
              <div style={{ cursor: "pointer" }} onClick={() => router.push(`/complaints/${latest.data!.CID}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="mono" style={{ color: COLORS.accent, fontWeight: 600 }}>
                    {latest.data.CID}
                  </span>
                  <StatusTag status={latest.data.CST} />
                </div>
                <Text style={{ color: COLORS.text }}>{latest.data.CDES}</Text>
                <div style={{ marginTop: 10 }}>
                  <SeverityTag severity={latest.data.CSEV} />
                </div>
              </div>
            ) : (
              <Text style={{ color: COLORS.muted }}>No complaints filed yet.</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="File a New Complaint"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}
          >
            <Text style={{ color: COLORS.muted, marginBottom: 16 }}>
              Had an issue with a product? File a complaint and our AI triage will route it instantly.
            </Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/complaints/new")}>
              New Complaint
            </Button>
          </Card>
        </Col>
      </Row>

      <Card title="Your Complaints">
        {all.error ? (
          <ErrorBanner message={all.error} onRetry={all.refetch} />
        ) : (
          <Table<Complaint>
            loading={all.loading}
            dataSource={all.data ?? []}
            rowKey="CID"
            pagination={false}
            scroll={{ x: "max-content" }}
            onRow={(record) => ({ onClick: () => router.push(`/complaints/${record.CID}`), style: { cursor: "pointer" } })}
            columns={[
              { title: "ID", dataIndex: "CID", key: "CID", render: (v) => <span className="mono">{v}</span> },
              { title: "Description", dataIndex: "CDES", key: "CDES", ellipsis: true, responsive: ["sm"] as const },
              { title: "Severity", dataIndex: "CSEV", key: "CSEV", render: (v) => <SeverityTag severity={v} /> },
              { title: "Status", dataIndex: "CST", key: "CST", render: (v) => <StatusTag status={v} /> },
              { title: "Date", dataIndex: "CDT", key: "CDT", responsive: ["md"] as const },
            ]}
          />
        )}
      </Card>
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedPage>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
          {user?.ROL === "CUS" ? `Welcome back, ${user?.NAM}` : "Operations Overview"}
        </Title>
        <Text style={{ color: COLORS.muted }}>
          {user?.ROL === "CUS"
            ? "Track your complaints and their resolution progress."
            : "Live snapshot of complaint volume, severity, and resolution."}
        </Text>
      </div>

      {user?.ROL === "CUS" ? <CustomerDashboard /> : <SupervisorDashboard />}
    </ProtectedPage>
  );
}
