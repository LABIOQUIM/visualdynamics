import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { SystemInfoController } from "./systeminfo.controller.js";
import { SystemInfoModule } from "./systeminfo.module.js";
import { SystemInfoService } from "./systeminfo.service.js";

describe("SystemInfoModule", () => {
  it("registers the controller and service", async () => {
    const module = await Test.createTestingModule({
      imports: [SystemInfoModule],
    }).compile();

    expect(module.get(SystemInfoController)).toBeInstanceOf(
      SystemInfoController,
    );
    expect(module.get(SystemInfoService)).toBeInstanceOf(SystemInfoService);
  });
});
