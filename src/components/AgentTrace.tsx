import React from "react";
import { TriageResult } from "@/types";

export function AgentTrace({ result }: { result: TriageResult | null }) {
  if (!result) {
    return (
      <div className="agent-trace">
        <div className="agent-trace-line agent-trace-prompt">
          <span className="agent-trace-value" style={{ color: "var(--color-muted)" }}>
            awaiting triage analysis...
          </span>
        </div>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["category", result.category],
    ["severity", result.severity],
    ["department", result.department],
    ["recommended_action", result.recommended_action],
  ];

  return (
    <div className="agent-trace">
      <div className="agent-trace-line agent-trace-prompt" style={{ marginBottom: 6 }}>
        <span className="agent-trace-value">CTAS.analyze(complaint)</span>
      </div>
      {rows.map(([key, value]) => (
        <div className="agent-trace-line" key={key}>
          <span className="agent-trace-key">{key}:</span>
          <span className="agent-trace-value">{value}</span>
        </div>
      ))}
    </div>
  );
}
