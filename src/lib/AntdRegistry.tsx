"use client";

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, App as AntApp, theme as antdTheme } from "antd";
import { antTheme } from "./theme";

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo<ReturnType<typeof createCache>>(() => createCache(), []);
  const isServerInserted = React.useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInserted.current) return;
    isServerInserted.current = true;
    return (
      <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
    );
  });

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider theme={{ ...antTheme, algorithm: antdTheme.darkAlgorithm }}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
