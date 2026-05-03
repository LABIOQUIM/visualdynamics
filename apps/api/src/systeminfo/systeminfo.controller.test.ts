import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";

import { SystemInfoController } from "./systeminfo.controller.js";
import { SystemInfoService } from "./systeminfo.service.js";

describe("SystemInfoController", () => {
  it("returns the system info from the service", async () => {
    const systemInfo = {
      cpu: { brand: "cpu" },
      load: { current: 12 },
      mem: { total: 1 },
      fs: { size: 2 },
    };

    const module = await Test.createTestingModule({
      controllers: [SystemInfoController],
      providers: [
        {
          provide: SystemInfoService,
          useValue: {
            getSystemInfo: vi.fn().mockResolvedValue(systemInfo),
          },
        },
      ],
    }).compile();

    const controller = module.get(SystemInfoController);

    await expect(controller.getCPUInfo()).resolves.toEqual(systemInfo);
  });
});
