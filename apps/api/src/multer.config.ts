import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";

const ALLOWED_EXTENSIONS = new Set([".pdb", ".itp"]);

const multerConfig = {
  limits: {
    fileSize: 8000000, // Compliant: 8MB
  },
  storage: diskStorage({
    destination: "/files",
    filename: (req, file, cb) => {
      const username = req.session?.user?.username;

      if (!username) {
        return cb(new Error("User session not found"), "");
      }

      const extension = path.parse(file.originalname).ext.toLowerCase();
      const userDir = `/files/${username}`;

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return cb(new Error(`File type not allowed: ${extension}`), "");
      }

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }

      const filename =
        file.fieldname === "filePDB"
          ? "originalMacromolecule"
          : "originalLigand";

      cb(null, `${username}/${filename}${extension}`);
    },
  }),
};

export default multerConfig;
