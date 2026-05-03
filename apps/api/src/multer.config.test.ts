import { beforeEach, describe, expect, it, vi } from "vitest";

const mkdirSync = vi.fn();
const existsSync = vi.fn();
const randomUUID = vi.fn();
const diskStorage = vi.fn((options) => options);

vi.mock("fs", () => ({
  default: {
    mkdirSync,
    existsSync,
  },
  mkdirSync,
  existsSync,
}));

vi.mock("crypto", () => ({
  randomUUID,
}));

vi.mock("multer", () => ({
  diskStorage,
}));

describe("multerConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    existsSync.mockReturnValue(true);
    randomUUID.mockReturnValue("uuid-123");
  });

  it("rejects requests without a session user", async () => {
    await import("./multer.config.js");

    const filename = diskStorage.mock.calls[0][0].filename;
    const cb = vi.fn();

    filename({} as any, { originalname: "file.pdb", fieldname: "filePDB" }, cb);

    expect(cb).toHaveBeenCalledWith(expect.any(Error), "");
    expect(cb.mock.calls[0][0]?.message).toBe("Unauthorized");
  });

  it("rejects unsupported extensions", async () => {
    await import("./multer.config.js");

    const filename = diskStorage.mock.calls[0][0].filename;
    const cb = vi.fn();

    filename(
      { session: { user: { username: "owner" } } } as any,
      { originalname: "file.txt", fieldname: "filePDB" },
      cb,
    );

    expect(cb).toHaveBeenCalledWith(expect.any(Error), "");
    expect(cb.mock.calls[0][0]?.message).toBe("File type not allowed: .txt");
  });

  it("creates missing user directories and uses the canonical macromolecule filename", async () => {
    existsSync.mockReturnValue(false);
    const { default: multerConfig } = await import("./multer.config.js");

    const cb = vi.fn();

    (multerConfig.storage as any).filename(
      { session: { user: { username: "owner" } } },
      { originalname: "protein.PDB", fieldname: "filePDB" },
      cb,
    );

    expect(mkdirSync).toHaveBeenCalledWith("/files/owner");
    expect(cb).toHaveBeenCalledWith(null, "owner/originalMacromolecule.pdb");
  });

  it("uses generated ligand filenames for non-macromolecule files", async () => {
    const { default: multerConfig } = await import("./multer.config.js");

    const cb = vi.fn();

    (multerConfig.storage as any).filename(
      { session: { user: { username: "owner" } } },
      { originalname: "ligand.itp", fieldname: "fileLigandITP" },
      cb,
    );

    expect(randomUUID).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, "owner/ligand_uuid-123.itp");
  });
});
