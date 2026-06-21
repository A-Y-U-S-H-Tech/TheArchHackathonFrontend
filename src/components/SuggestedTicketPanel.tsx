"use client";

import React, { useState } from "react";
import { Card, Input, Select, Checkbox, Button, Space, App, Typography } from "antd";
import { CheckOutlined, EditOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { TgsApi } from "@/lib/api/tgs";
import { ApiError } from "@/lib/apiClient";
import { SampleTicket, Ticket } from "@/types";
import { COLORS } from "@/lib/theme";

const { TextArea } = Input;
const { Text } = Typography;

type Mode = "view" | "edit" | "created";

export function SuggestedTicketPanel({
  ticket,
  complaintId,
  onCreated,
}: {
  ticket: SampleTicket;
  complaintId: string;
  onCreated?: () => void;
}) {
  const { message } = App.useApp();
  const [mode, setMode] = useState<Mode>("view");
  const [submitting, setSubmitting] = useState(false);
  const [createdTid, setCreatedTid] = useState<string | null>(null);
  const [dep, setDep] = useState(ticket.DEP);
  const [pri, setPri] = useState(ticket.PRI);
  const [des, setDes] = useState(ticket.DES);
  const [ito, setIto] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await TgsApi.create({ CID: complaintId, DEP: dep, PRI: pri, DES: des, ITO: ito });
      const tid = (result as Partial<Ticket>)?.TID;
      setCreatedTid(tid ?? null);
      setMode("created");
      message.success("Ticket created.");
      onCreated?.();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "created") {
    return (
      <Card style={{ background: "rgba(0,212,184,0.06)", borderColor: COLORS.accentDim }} bodyStyle={{ padding: 14 }}>
        <Space>
          <CheckOutlined style={{ color: COLORS.accent }} />
          <Text style={{ color: COLORS.text, fontWeight: 600 }}>
            Ticket{createdTid ? <span className="mono" style={{ marginLeft: 4 }}>{createdTid}</span> : ""} created
            {ito ? " · internal only" : ""}
          </Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      title={<span style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>AI Suggested Ticket</span>}
      style={{ background: COLORS.panel2, borderColor: COLORS.border }}
      bodyStyle={{ padding: 14 }}
    >
      {mode === "view" ? (
        <div className="agent-trace" style={{ marginBottom: 14 }}>
          <div className="agent-trace-line" style={{ marginBottom: 6 }}>
            <span className="agent-trace-key">department:</span>
            <span className="agent-trace-value">{dep}</span>
          </div>
          <div className="agent-trace-line" style={{ marginBottom: 6 }}>
            <span className="agent-trace-key">priority:</span>
            <span className="agent-trace-value">{pri}</span>
          </div>
          <div className="agent-trace-line" style={{ marginBottom: 6 }}>
            <span className="agent-trace-key">description:</span>
            <span className="agent-trace-value">{des}</span>
          </div>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: "100%", marginBottom: 14 }} size={10}>
          <div>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>Department</Text>
            <Input value={dep} onChange={(e) => setDep(e.target.value)} style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>Priority</Text>
            <Select
              value={pri}
              onChange={setPri}
              style={{ width: "100%", marginTop: 4 }}
              options={["Low", "Medium", "High", "Critical"].map((v) => ({ value: v, label: v }))}
            />
          </div>
          <div>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>Description</Text>
            <TextArea value={des} onChange={(e) => setDes(e.target.value)} rows={3} style={{ marginTop: 4 }} />
          </div>
        </Space>
      )}

      <Checkbox checked={ito} onChange={(e) => setIto(e.target.checked)} style={{ marginBottom: 14, color: COLORS.muted }}>
        Internal only (visible to staff only)
      </Checkbox>

      <Space wrap style={{ display: "flex" }}>
        {mode === "view" ? (
          <>
            <Button type="primary" icon={<CheckOutlined />} loading={submitting} onClick={submit}>
              Accept &amp; Create
            </Button>
            <Button icon={<EditOutlined />} onClick={() => setMode("edit")}>
              Edit
            </Button>
          </>
        ) : (
          <>
            <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={submit}>
              Send Ticket
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setDep(ticket.DEP);
                setPri(ticket.PRI);
                setDes(ticket.DES);
                setMode("view");
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
}
