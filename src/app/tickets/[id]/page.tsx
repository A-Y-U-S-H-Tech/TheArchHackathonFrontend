"use client";

import React, { useState } from "react";
import { Card, Typography, Button, Descriptions, App, Space, Skeleton, Popconfirm } from "antd";
import { ArrowLeftOutlined, RiseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useFetch } from "@/lib/useFetch";
import { TgsApi } from "@/lib/api/tgs";
import { ApiError } from "@/lib/apiClient";
import { ErrorBanner } from "@/components/StateBanners";
import { StatusTag, SeverityTag } from "@/components/StatusTags";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { message } = App.useApp();
  const [actioning, setActioning] = useState(false);

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Title level={3} className="font-display" style={{ color: COLORS.text, margin: 0 }}>
              <span className="mono">{t.TID}</span>
            </Title>
            <StatusTag status={t.STA} />
            <SeverityTag severity={t.PRI} />
          </div>
          <Text style={{ color: COLORS.muted }}>
            Linked to complaint{" "}
            <span className="mono" style={{ color: COLORS.accent, cursor: "pointer" }} onClick={() => router.push(`/complaints/${t.CID}`)}>
              {t.CID}
            </span>
          </Text>
        </div>
        {!isClosed && (
          <Space>
            <Button icon={<RiseOutlined />} loading={actioning} onClick={handleEscalate}>
              Escalate
            </Button>
            <Popconfirm title="Close this ticket?" onConfirm={handleClose} okText="Close" cancelText="Cancel">
              <Button type="primary" icon={<CheckCircleOutlined />} loading={actioning}>
                Close Ticket
              </Button>
            </Popconfirm>
          </Space>
        )}
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
          <Descriptions.Item label="Created">{t.CRT}</Descriptions.Item>
          <Descriptions.Item label="Description">{t.DES}</Descriptions.Item>
        </Descriptions>
      </Card>
    </ProtectedPage>
  );
}
