"use client";

import React, { useMemo, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Tag, Grid, Drawer, Button } from "antd";
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
  MenuOutlined,
  TeamOutlined,
  SettingOutlined,
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
  { key: "/accounts", icon: <TeamOutlined />, label: "Account Management", roles: ["SUP"] },
];

function BrandMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? 0 : "0 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        gap: 10,
        flexShrink: 0,
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
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.ROL) : false)),
    [user]
  );

  const isMobile = !screens.md;

  const menu = (onNavigate?: () => void) => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[pathname]}
      items={visibleItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }))}
      onClick={(e) => {
        router.push(e.key);
        onNavigate?.();
      }}
      style={{ borderRight: "none", padding: "12px 8px", background: "transparent" }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          collapsed={collapsed}
          collapsible
          trigger={null}
          width={232}
          collapsedWidth={80}
          style={{ borderRight: `1px solid ${COLORS.border}` }}
        >
          <BrandMark collapsed={collapsed} />
          {menu()}
        </Sider>
      )}

      {/* Mobile nav: off-canvas drawer, opened via hamburger in the header.
          The old approach collapsed the Sider to 0px width on mobile with
          no visible trigger to reopen it — this replaces that dead end. */}
      <Drawer
        placement="left"
        open={isMobile && mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        closable={false}
        width={232}
        styles={{ body: { padding: 0, background: COLORS.panel }, content: { background: COLORS.panel } }}
      >
        <BrandMark />
        {menu(() => setMobileNavOpen(false))}
      </Drawer>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: `1px solid ${COLORS.border}`,
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {isMobile ? (
              <>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileNavOpen(true)}
                  style={{ color: COLORS.muted, fontSize: 18, padding: 4 }}
                />
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "#06120F",
                  }}
                >
                  FO
                </div>
              </>
            ) : (
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{ cursor: "pointer", fontSize: 18, color: COLORS.muted, display: "flex" }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            )}
          </div>

          {user && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: (
                      <div style={{ padding: "2px 0" }}>
                        <div style={{ fontWeight: 600 }}>{user.NAM}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{roleLabel(user.ROL)}</div>
                      </div>
                    ),
                    disabled: true,
                  },
                  { type: "divider" },
                  {
                    key: "account-settings",
                    icon: <SettingOutlined />,
                    label: "Account Settings",
                    onClick: () => router.push("/account"),
                  },
                  { type: "divider" },
                  { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: logout },
                ],
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", minWidth: 0 }}>
                {!isMobile && (
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
                )}
                <Avatar size={32} icon={<UserOutlined />} style={{ background: COLORS.panel2, color: COLORS.text, flexShrink: 0 }} />
                {!isMobile && (
                  <span
                    style={{
                      fontWeight: 600,
                      color: COLORS.text,
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.NAM}
                  </span>
                )}
              </div>
            </Dropdown>
          )}
        </Header>
        <Content
          style={{
            padding: isMobile ? 16 : 28,
            background: COLORS.base,
            minHeight: "calc(100vh - 64px)",
            overflowX: "hidden",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
