import { describe, expect, it, vi } from "vitest";
import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "pkijs";

async function importApplication() {
  vi.resetModules();
  return (await import("./application.js")).Application;
}

describe("Application", () => {
  it("uses the global WebCrypto by default", async () => {
    const Application = await importApplication();

    expect(Application.crypto).toBe(globalThis.crypto);
    expect(Application.crypto.subtle).toBe(globalThis.crypto.subtle);
  });

  it("doesn't change the global WebCrypto or the pkijs engine on import", async () => {
    const crypto = new Crypto();
    pkijs.setEngine("custom", new pkijs.CryptoEngine({ name: "custom", crypto }));

    await importApplication();

    expect(Object.keys(globalThis.crypto)).not.toContain("name");
    expect(pkijs.getEngine().name).toBe("custom");
  });

  it("uses the engine set by setEngine", async () => {
    const Application = await importApplication();
    const crypto = new Crypto();

    Application.setEngine("peculiar", crypto);

    expect(Application.crypto).toBe(crypto);
    expect(Application.crypto.name).toBe("peculiar");
    expect(pkijs.getEngine().name).toBe("peculiar");
  });
});
