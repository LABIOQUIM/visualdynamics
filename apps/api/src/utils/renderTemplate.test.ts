import { describe, expect, it } from "vitest";

import { renderTemplate } from "./renderTemplate.js";

describe("renderTemplate", () => {
  it("replaces known placeholders", () => {
    expect(
      renderTemplate("gmx {{command}} -f {{input}}", {
        command: "mdrun",
        input: "topol.tpr",
      }),
    ).toBe("gmx mdrun -f topol.tpr");
  });

  it("leaves unknown placeholders unchanged", () => {
    expect(
      renderTemplate("sed 's/{{keep}}/{{value}}/'", { value: "done" }),
    ).toBe("sed 's/{{keep}}/done/'");
  });
});
