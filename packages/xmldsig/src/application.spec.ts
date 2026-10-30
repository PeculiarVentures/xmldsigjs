import { describe, expect, it, vi } from "vitest";

describe("Application", () => {
  it("uses the built-in WebCrypto in Node.js by default", async () => {
    vi.resetModules();
    const { Application } = await import("./application.js");

    expect(Application.isNodePlugin()).toBe(true);
    expect(Application.crypto).toBe(globalThis.crypto);
    expect(Application.crypto.name).toBe("NodeJS");
  });
});
