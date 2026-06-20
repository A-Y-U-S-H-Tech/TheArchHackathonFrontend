import React from "react";
import { Tag } from "antd";
import { COLORS } from "@/lib/theme";

export function SeverityTag({ severity }: { severity: string }) {
  const s = (severity || "").toLowerCase();
  let color = COLORS.muted;
  let bg = "rgba(139,147,167,0.12)";

  if (s.includes("critical") || s.includes("high")) {
    color = COLORS.alert;
    bg = "rgba(255,107,91,0.12)";
  } else if (s.includes("medium")) {
    color = COLORS.warn;
    bg = "rgba(245,166,35,0.12)";
  } else if (s.includes("low")) {
    color = COLORS.accent;
    bg = "rgba(0,212,184,0.12)";
  }

  return (
    <Tag
      style={{
        color,
        background: bg,
        border: "none",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        padding: "2px 10px",
      }}
    >
      {severity || "Unknown"}
    </Tag>
  );
}

export function StatusTag({ status }: { status: string | boolean }) {
  const resolved = status === true || status === "true" || status === "Resolved" || status === "Closed";
  const color = resolved ? COLORS.accent : COLORS.warn;
  const bg = resolved ? "rgba(0,212,184,0.12)" : "rgba(245,166,35,0.12)";
  const label = typeof status === "boolean" ? (status ? "Resolved" : "Pending") : status;

  return (
    <Tag
      style={{
        color,
        background: bg,
        border: "none",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        padding: "2px 10px",
      }}
    >
      {label}
    </Tag>
  );
}
