"use client";

import React, { useState } from "react";
import { Table, Card, Typography, Button, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { CmsApi } from "@/lib/api/cms";
import { UrssApi } from "@/lib/api/misc";
import { ErrorBanner } from "@/components/StateBanners";
import { SeverityTag, StatusTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";
import { Complaint } from "@/types";

const { Title, Text } = Typography;

export default function ComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const isCustomer = user?.ROL === "CUS";

  const complaints = useFetch(
    () => (isCustomer ? UrssApi.returnAllComplaints(-1, -1) : CmsApi.returnAll(-1, -1)),
    [isCustomer]
  );

  const filtered = (complaints.data ?? []).filter(
    (c) =>
      !search ||
      c.CID.toLowerCase().includes(search.toLowerCase()) ||
      c.CDES.toLowerCase().includes(search.toLowerCase()) ||
      c.CUS.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedPage>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
            Complaints
          </Title>
          <Text style={{ color: COLORS.muted }}>
            {isCustomer ? "Complaints you've filed" : "All complaints across the system"}
          </Text>
        </div>
        {isCustomer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/complaints/new")}>
            New Complaint
          </Button>
        )}
      </div>

      <Card>
        <Input
          placeholder="Search by complaint ID, customer, or description..."
          prefix={<SearchOutlined style={{ color: COLORS.muted }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 420 }}
        />

        {complaints.error ? (
          <ErrorBanner message={complaints.error} onRetry={complaints.refetch} />
        ) : (
          <Table<Complaint>
            loading={complaints.loading}
            dataSource={filtered}
            rowKey="CID"
            scroll={{ x: "max-content" }}
            onRow={(record) => ({ onClick: () => router.push(`/complaints/${record.CID}`), style: { cursor: "pointer" } })}
            columns={[
              { title: "ID", dataIndex: "CID", key: "CID", render: (v) => <span className="mono">{v}</span> },
              ...(isCustomer ? [] : [{ title: "Customer", dataIndex: "CUS", key: "CUS", responsive: ["md"] as const }]),
              { title: "Product", dataIndex: "PID", key: "PID", responsive: ["md"] as const, render: (v: string) => <span className="mono">{v}</span> },
              { title: "Description", dataIndex: "CDES", key: "CDES", ellipsis: true, responsive: ["sm"] as const },
              { title: "Severity", dataIndex: "CSEV", key: "CSEV", render: (v) => <SeverityTag severity={v} /> },
              { title: "Status", dataIndex: "CST", key: "CST", render: (v) => <StatusTag status={v} /> },
              { title: "Date", dataIndex: "CDT", key: "CDT", responsive: ["md"] as const },
            ]}
          />
        )}
      </Card>
    </ProtectedPage>
  );
}
