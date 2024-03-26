import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";

import { normalizeString } from "./utils/normalizeString";

const multerConfig = {
  limits: {
    fileSize: 8000000, // Compliant: 8MB
  },
  storage: diskStorage({
    destination: "/files",
    filename: (req, file, cb) => {
      const fileName = path.parse(file.originalname).name.replace(/\s/g, "");

      const extension = path.parse(file.originalname).ext;
      const userDir = `/files/${req.userName}`;

      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }

      cb(null, `${req.userName}/${normalizeString(fileName)}${extension}`);
    },
  }),
};

export default multerConfig;
