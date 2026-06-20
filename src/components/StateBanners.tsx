import React from "react";
import { Alert, Button, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      type="error"
      showIcon
      message="Couldn't load this data"
      description={message}
      style={{ marginBottom: 20 }}
      action={
        onRetry ? (
          <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    />
  );
}

export function EmptyState({ description = "Nothing here yet." }: { description?: string }) {
  return <Empty description={description} style={{ padding: "48px 0" }} />;
}
