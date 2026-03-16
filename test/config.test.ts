/**
 * Tests for PowerMem plugin config parsing and resolvers.
 */
import { describe, it, expect } from "vitest";
import {
  powerMemConfigSchema,
  resolveUserId,
  resolveAgentId,
  DEFAULT_USER_ID,
  DEFAULT_AGENT_ID,
  type PowerMemConfig,
} from "../config.js";

describe("powerMemConfigSchema", () => {
  it("parses valid http config with required fields", () => {
    const cfg = powerMemConfigSchema.parse({
      mode: "http",
      baseUrl: "http://localhost:8000",
      autoCapture: true,
      autoRecall: true,
      inferOnAdd: true,
    }) as PowerMemConfig;
    expect(cfg.mode).toBe("http");
    expect(cfg.baseUrl).toBe("http://localhost:8000");
    expect(cfg.autoCapture).toBe(true);
    expect(cfg.autoRecall).toBe(true);
    expect(cfg.inferOnAdd).toBe(true);
    expect(cfg.recallLimit).toBe(5);
    expect(cfg.recallScoreThreshold).toBe(0);
  });

  it("parses valid cli config", () => {
    const cfg = powerMemConfigSchema.parse({
      mode: "cli",
      baseUrl: "",
      autoCapture: false,
      autoRecall: true,
      inferOnAdd: false,
    }) as PowerMemConfig;
    expect(cfg.mode).toBe("cli");
    expect(cfg.pmemPath).toBe("pmem");
  });

  it("rejects non-object config", () => {
    expect(() => powerMemConfigSchema.parse(null)).toThrow("memory-powermem config required");
    expect(() => powerMemConfigSchema.parse("")).toThrow();
  });

  it("rejects http mode without baseUrl", () => {
    expect(() =>
      powerMemConfigSchema.parse({
        mode: "http",
        baseUrl: "",
        autoCapture: true,
        autoRecall: true,
        inferOnAdd: true,
      }),
    ).toThrow("baseUrl is required when mode is http");
  });
});

describe("resolveUserId / resolveAgentId", () => {
  it("returns default user/agent when not set", () => {
    const cfg = { userId: undefined, agentId: undefined } as PowerMemConfig;
    expect(resolveUserId(cfg)).toBe(DEFAULT_USER_ID);
    expect(resolveAgentId(cfg)).toBe(DEFAULT_AGENT_ID);
  });

  it("returns configured user/agent when set", () => {
    const cfg = {
      userId: "user-1",
      agentId: "agent-1",
    } as PowerMemConfig;
    expect(resolveUserId(cfg)).toBe("user-1");
    expect(resolveAgentId(cfg)).toBe("agent-1");
  });
});
