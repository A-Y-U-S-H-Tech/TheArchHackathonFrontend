"use client";

import React, { useEffect, useState } from "react";
import { Card, Collapse, Tag, Divider } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { TriageResult } from "@/types";
import { COLORS } from "@/lib/theme";

const THINKING_PHASES = [
  "Reading the complaint record...",
  "Looking up product details...",
  "Searching SOPs and quality guidelines...",
  "Comparing with similar past complaints...",
  "Weighing severity and risk...",
  "Drafting a recommendation...",
];

function ThinkingLive() {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIdx((p) => (p + 1) % THINKING_PHASES.length);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="agent-trace">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ color: COLORS.accent, fontWeight: 700 }}>Thinking</span>
        <span className="thinking-dot" style={{ color: COLORS.accent }}>
          •
        </span>
        <span className="thinking-dot" style={{ color: COLORS.accent }}>
          •
        </span>
        <span className="thinking-dot" style={{ color: COLORS.accent }}>
          •
        </span>
      </div>
      <div style={{ color: COLORS.muted, fontSize: 13 }}>
        {THINKING_PHASES[phaseIdx]}
        <span className="thinking-cursor" />
      </div>
    </div>
  );
}

function riskColor(risk: string) {
  const r = (risk || "").toLowerCase();
  if (r.includes("high") || r.includes("critical")) return COLORS.alert;
  if (r.includes("medium")) return COLORS.warn;
  return COLORS.accent;
}

export function ThinkingTrace({ loading, result }: { loading: boolean; result: TriageResult | null }) {
  if (loading) {
    return (
      <Card style={{ background: "#0a0d13", borderColor: COLORS.border }} bodyStyle={{ padding: 16 }}>
        <ThinkingLive />
      </Card>
    );
  }

  if (!result) return null;

  const analysis = result.triage_analysis;
  const steps = result.tool_trace ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Collapsible reasoning trace — collapsed by default, like Claude/ChatGPT's "Thought for Ns" */}
      {steps.length > 0 && (
        <Card style={{ background: "#0a0d13", borderColor: COLORS.border }} bodyStyle={{ padding: 0 }}>
          <Collapse
            ghost
            expandIcon={({ isActive }) => (
              <CaretRightOutlined
                style={{
                  color: COLORS.accent,
                  transform: isActive ? "rotate(90deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            )}
            items={[
              {
                key: "trace",
                label: (
                  <span style={{ color: COLORS.muted, fontWeight: 600, fontSize: 13 }}>
                    Thought for {steps.length} step{steps.length === 1 ? "" : "s"}
                  </span>
                ),
                children: (
                  <div className="agent-trace" style={{ paddingTop: 2 }}>
                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="step-reveal"
                        style={{ animationDelay: `${idx * 70}ms`, marginBottom: idx < steps.length - 1 ? 12 : 0 }}
                      >
                        <div className="agent-trace-line" style={{ marginBottom: 4 }}>
                          <span className="agent-trace-key" style={{ minWidth: 90, color: COLORS.accent }}>
                            step {step.step}
                          </span>
                          <span className="agent-trace-value" style={{ fontWeight: 600 }}>
                            {step.tool}
                          </span>
                        </div>
                        <div style={{ marginLeft: 14, color: COLORS.muted, fontSize: 12, marginBottom: 2 }}>
                          {step.reason}
                        </div>
                        <div style={{ marginLeft: 14, color: "#5B6478", fontSize: 12 }}>→ {step.observation}</div>
                        {idx < steps.length - 1 && <Divider style={{ margin: "10px 0", borderColor: COLORS.border }} />}
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Conclusion — always visible, like the model's final answer after thinking */}
      <Card
        style={{ background: COLORS.panel2, borderColor: COLORS.border }}
        bodyStyle={{ padding: 14 }}
        title={
          <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>
            {analysis.classification}
          </span>
        }
      >
        <div className="agent-trace">
          <div className="agent-trace-line" style={{ marginBottom: 8 }}>
            <span className="agent-trace-key">product:</span>
            <span className="agent-trace-value">{analysis.product_name}</span>
          </div>
          <div className="agent-trace-line" style={{ marginBottom: 8 }}>
            <span className="agent-trace-key">issue:</span>
            <span className="agent-trace-value">{analysis.issue_summary}</span>
          </div>
          <div className="agent-trace-line" style={{ marginBottom: 8, alignItems: "center" }}>
            <span className="agent-trace-key">risk_level:</span>
            <Tag
              style={{
                background: `${riskColor(analysis.risk_level)}1F`,
                color: riskColor(analysis.risk_level),
                border: "none",
                fontWeight: 600,
              }}
            >
              {analysis.risk_level}
            </Tag>
          </div>
          <Divider style={{ margin: "10px 0", borderColor: COLORS.border }} />
          <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>
            {analysis.reasoning}
          </div>
        </div>
      </Card>
    </div>
  );
}
