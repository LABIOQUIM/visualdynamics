import { describe, expect, it, vi } from "vitest";

const cpu = vi.fn();
const mem = vi.fn();
const fsSize = vi.fn();
const currentLoad = vi.fn();

vi.mock("systeminformation", () => ({
  cpu,
  mem,
  fsSize,
  currentLoad,
}));

describe("SystemInfoService", () => {
  it("returns normalized system information for the root filesystem", async () => {
    vi.resetModules();
    cpu.mockResolvedValue({
      brand: "Ryzen",
      vendor: "AMD",
      cores: 16,
      physicalCores: 8,
    });
    mem.mockResolvedValue({
      total: 64,
      used: 12,
    });
    fsSize.mockResolvedValue([
      { mount: "/data", size: 10, used: 1, available: 9 },
      { mount: "/", size: 100, used: 40, available: 60 },
    ]);
    currentLoad.mockResolvedValue({
      currentLoad: 23,
      avgLoad: 1.5,
    });

    const { SystemInfoService } = await import("./systeminfo.service.js");
    const service = new SystemInfoService();

    await expect(service.getSystemInfo()).resolves.toEqual({
      cpu: {
        brand: "Ryzen",
        vendor: "AMD",
        cores: 16,
        physicalCores: 8,
      },
      load: {
        current: 23,
        average: 1.5,
      },
      mem: {
        total: 64,
        used: 12,
      },
      fs: {
        size: 100,
        used: 40,
        available: 60,
      },
    });
  });

  it("throws when the root filesystem cannot be found", async () => {
    vi.resetModules();
    cpu.mockResolvedValue({
      brand: "Ryzen",
      vendor: "AMD",
      cores: 16,
      physicalCores: 8,
    });
    mem.mockResolvedValue({
      total: 64,
      used: 12,
    });
    fsSize.mockResolvedValue([
      { mount: "/data", size: 10, used: 1, available: 9 },
    ]);
    currentLoad.mockResolvedValue({
      currentLoad: 23,
      avgLoad: 1.5,
    });

    const { SystemInfoService } = await import("./systeminfo.service.js");
    const service = new SystemInfoService();

    await expect(service.getSystemInfo()).rejects.toThrow(
      "Root filesystem not found",
    );
  });
});
