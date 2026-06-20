"use client";

import React, { useMemo, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Tag, Grid } from "antd";
import {
  DashboardOutlined,
  FileSearchOutlined,
  ShoppingOutlined,
  BookOutlined,
  TagsOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, roleLabel } from "@/context/AuthContext";
import { COLORS } from "@/lib/theme";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: Array<"CUS" | "CSE" | "SUP">;
}

const NAV_ITEMS: NavItem[] = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard", roles: ["CUS", "CSE", "SUP"] },
  { key: "/complaints", icon: <FileSearchOutlined />, label: "Complaints", roles: ["CUS", "CSE", "SUP"] },
  { key: "/tickets", icon: <TagsOutlined />, label: "Tickets", roles: ["CSE", "SUP"] },
  { key: "/knowledge", icon: <BookOutlined />, label: "Knowledge Base", roles: ["SUP"] },
  { key: "/products", icon: <ShoppingOutlined />, label: "Products", roles: ["SUP"] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.ROL) : false)),
    [user]
  );

  const isMobile = !screens.md;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={isMobile ? true : collapsed}
        collapsible
        trigger={null}
        width={232}
        collapsedWidth={isMobile ? 0 : 80}
        style={{ borderRight: `1px solid ${COLORS.border}` }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "#06120F",
            }}
          >
            FO
          </div>
          {!collapsed && (
            <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>
              Ops Copilot
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={visibleItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          onClick={(e) => router.push(e.key)}
          style={{ borderRight: "none", padding: "12px 8px", background: "transparent" }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: "pointer", fontSize: 18, color: COLORS.muted, display: isMobile ? "none" : "block" }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ flex: 1 }} />
          {user && (
            <Dropdown
              menu={{
                items: [
                  { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: logout },
                ],
              }}
              placement="bottomRight"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Tag
                  style={{
                    background: "rgba(0,212,184,0.1)",
                    color: COLORS.accent,
                    border: "none",
                    fontWeight: 600,
                    fontSize: 11,
                    borderRadius: 6,
                  }}
                >
                  {roleLabel(user.ROL)}
                </Tag>
                <Avatar size={32} icon={<UserOutlined />} style={{ background: COLORS.panel2, color: COLORS.text }} />
                <span style={{ fontWeight: 600, color: COLORS.text }}>{user.NAM}</span>
              </div>
            </Dropdown>
          )}
        </Header>
        <Content
          style={{
            padding: isMobile ? 16 : 28,
            background: COLORS.base,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
