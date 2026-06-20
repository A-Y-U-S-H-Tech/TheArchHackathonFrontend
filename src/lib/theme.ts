import type { ThemeConfig } from "antd";

// Color system:
// base   #0B0E14  near-black canvas
// panel  #141925  card/panel surface
// panel2 #1A2030  elevated surface (hover, modals)
// border #1E2433  hairlines
// accent #00D4B8  signature teal-green — "verified / quality" signal
// alert  #FF6B5B  coral — high severity / destructive
// warn   #F5A623  amber — medium severity / pending
// muted  #8B93A7  secondary text

export const COLORS = {
  base: "#0B0E14",
  panel: "#141925",
  panel2: "#1A2030",
  border: "#1E2433",
  accent: "#00D4B8",
  accentDim: "#0A8F7C",
  alert: "#FF6B5B",
  warn: "#F5A623",
  muted: "#8B93A7",
  text: "#E7EBF3",
};

export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.accent,
    colorBgBase: COLORS.base,
    colorBgContainer: COLORS.panel,
    colorBgElevated: COLORS.panel2,
    colorBorder: COLORS.border,
    colorBorderSecondary: COLORS.border,
    colorText: COLORS.text,
    colorTextSecondary: COLORS.muted,
    colorTextTertiary: "#5B6478",
    colorSuccess: COLORS.accent,
    colorWarning: COLORS.warn,
    colorError: COLORS.alert,
    colorLink: COLORS.accent,
    borderRadius: 10,
    fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: COLORS.panel,
      bodyBg: COLORS.base,
      siderBg: COLORS.panel,
      headerHeight: 64,
    },
    Menu: {
      darkItemBg: COLORS.panel,
      darkItemSelectedBg: "rgba(0, 212, 184, 0.12)",
      darkItemSelectedColor: COLORS.accent,
      darkItemHoverBg: "rgba(255,255,255,0.04)",
    },
    Card: {
      colorBgContainer: COLORS.panel,
      headerBg: "transparent",
    },
    Table: {
      headerBg: COLORS.panel2,
      headerColor: COLORS.muted,
      rowHoverBg: "rgba(255,255,255,0.03)",
      borderColor: COLORS.border,
    },
    Tag: {
      defaultBg: COLORS.panel2,
    },
    Button: {
      primaryShadow: "none",
      fontWeight: 600,
    },
    Input: {
      colorBgContainer: COLORS.panel2,
      activeBorderColor: COLORS.accent,
      hoverBorderColor: COLORS.accentDim,
    },
    Select: {
      colorBgContainer: COLORS.panel2,
      colorBgElevated: COLORS.panel2,
      optionSelectedBg: "rgba(0, 212, 184, 0.12)",
    },
    Modal: {
      contentBg: COLORS.panel,
      headerBg: COLORS.panel,
    },
    Statistic: {
      contentFontSize: 30,
    },
  },
};
