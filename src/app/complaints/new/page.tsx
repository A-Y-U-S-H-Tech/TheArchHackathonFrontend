"use client";

import React, { useState } from "react";
import { Card, Form, Input, Select, Button, Typography, App, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/lib/useFetch";
import { PmsApi } from "@/lib/api/pms";
import { CmsApi } from "@/lib/api/cms";
import { ApiError } from "@/lib/apiClient";
import { COLORS } from "@/lib/theme";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function NewComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const products = useFetch(() => PmsApi.getAll(-1, -1), []);

  const onFinish = async (values: { PID: string; CDES: string }) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const result = await CmsApi.create({ CUS: user.NAM, PID: values.PID, CDES: values.CDES });
      message.success("Complaint filed. Our AI triage is reviewing it now.");
      const cid = (result as { CID?: string })?.CID;
      router.push(cid ? `/complaints/${cid}` : "/complaints");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to file complaint. Please try again.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedPage allowedRoles={["CUS"]}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ color: COLORS.text, marginBottom: 2 }}>
          File a Complaint
        </Title>
        <Text style={{ color: COLORS.muted }}>
          Describe the issue clearly — our triage agent uses this to find the right SOP and route it
          to the right team.
        </Text>
      </div>

      <Card style={{ maxWidth: 640 }}>
        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item name="PID" label="Product" rules={[{ required: true, message: "Select the product" }]}>
            {products.loading ? (
              <Spin size="small" />
            ) : (
              <Select
                placeholder="Search for a product..."
                showSearch
                optionFilterProp="label"
                options={(products.data ?? []).map((p) => ({
                  value: p.PID,
                  label: `${p.PNM} — ${p.PCAT}`,
                }))}
                notFoundContent={products.error ? "Couldn't load products" : "No products found"}
              />
            )}
          </Form.Item>

          <Form.Item
            name="CDES"
            label="Describe the issue"
            rules={[{ required: true, message: "Please describe the issue" }]}
          >
            <TextArea
              rows={6}
              placeholder="e.g. The shampoo bottle was leaking from the cap when I received it, and the seal looked tampered..."
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} style={{ height: 42, fontWeight: 700 }}>
            Submit Complaint
          </Button>
        </Form>
      </Card>
    </ProtectedPage>
  );
}
