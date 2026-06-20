"use client";

import React, { useState } from "react";
import { Table, Card, Typography, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useFetch } from "@/lib/useFetch";
import { TgsApi } from "@/lib/api/tgs";
import { ErrorBanner } from "@/components/StateBanners";
import { StatusTag, SeverityTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";
import { Ticket } from "@/types";

const { Title, Text } = Typography;

export default function TicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const tickets = useFetch(() => TgsApi.returnAll(-1, -1), []);

  const filtered = (tickets.data ?? []).filter(
    (t) =>
      !search ||
      t.TID.toLowerCase().includes(search.toLowerCase()) ||
      t.CID.toLowerCase().includes(search.toLowerCase()) ||
      t.DEP.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedPage allowedRoles={["CSE", "SUP"]}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
          Tickets
        </Title>
        <Text style={{ color: COLORS.muted }}>All support tickets generated from complaints.</Text>
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
            onRow={(record) => ({ onClick: () => router.push(`/tickets/${record.TID}`), style: { cursor: "pointer" } })}
            columns={[
              { title: "Ticket ID", dataIndex: "TID", key: "TID", render: (v) => <span className="mono">{v}</span> },
              { title: "Complaint", dataIndex: "CID", key: "CID", render: (v) => <span className="mono">{v}</span> },
              { title: "Department", dataIndex: "DEP", key: "DEP", render: (v) => <Tag style={{ background: COLORS.panel2, color: COLORS.muted, border: "none" }}>{v}</Tag> },
              { title: "Priority", dataIndex: "PRI", key: "PRI", render: (v) => <SeverityTag severity={v} /> },
              { title: "Status", dataIndex: "STA", key: "STA", render: (v) => <StatusTag status={v} /> },
              { title: "Created", dataIndex: "CRT", key: "CRT" },
            ]}
          />
        )}
      </Card>
    </ProtectedPage>
  );
}
