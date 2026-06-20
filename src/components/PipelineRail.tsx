import React from "react";

export interface PipelineStep {
  label: string;
  status: "done" | "active" | "pending";
}

export function PipelineRail({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="pipeline-rail">
      {steps.map((step, idx) => (
        <div key={idx} className={`pipeline-node ${step.status}`}>
          <div className="pipeline-line" />
          <div className="pipeline-dot" />
          <div className="pipeline-label">{step.label}</div>
        </div>
      ))}
    </div>
  );
}

export const DEFAULT_PIPELINE_LABELS = [
  "Complaint Received",
  "Knowledge Retrieval",
  "Triage Analysis",
  "Ticket Generated",
  "Assigned To Team",
];
