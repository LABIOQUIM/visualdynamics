import { describe, expect, it } from "vitest";

import { normalizeString } from "./normalizeString.js";

describe("normalizeString", () => {
  it("lowercases, trims, strips accents, and removes punctuation", () => {
    expect(normalizeString("  Ácido Ribo-Nucléico!  ")).toBe(
      "acidoribonucleico",
    );
  });

  it("keeps numbers while removing separators", () => {
    expect(normalizeString("Ligand 01 / Chain A")).toBe("ligand01chaina");
  });
});
