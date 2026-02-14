import { useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { ToolResult } from "../types";

export function useToolResult() {
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);

  useApp({
    appInfo: { name: "Ask Aneeq", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (params) => {
        console.log("[AskAneeq] Tool result received:", params);
        setToolResult(params as unknown as ToolResult);
      };
    },
  });

  return toolResult;
}
