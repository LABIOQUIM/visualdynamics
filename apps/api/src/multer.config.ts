import { randomUUID } from "crypto";
import type { Request } from "express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";

const ALLOWED_EXTENSIONS = new Set([".pdb", ".itp"]);
type SessionRequest = Request & {
  session?: {
    user?: {
      username?: string | null;
    };
  };
};

const multerConfig = {
  limits: {
    fileSize: 8000000, // Compliant: 8MB
  },
  storage: diskStorage({
    destination: "/files",
    filename: (req: SessionRequest, file, cb) => {
      const extension = path.parse(file.originalname).ext.toLowerCase();

      if (!req.session?.user) {
        return cb(new Error("Unauthorized"), "");
      }

      const userDir = `/files/${req.session.user.username}`;

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return cb(new Error(`File type not allowed: ${extension}`), "");
      }

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }

      const filename =
        file.fieldname === "filePDB"
          ? "originalMacromolecule"
          : `ligand_${randomUUID()}`;

      cb(null, `${req.session.user.username}/${filename}${extension}`);
    },
  }),
};

export default multerConfig;
