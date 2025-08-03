import { HttpException, HttpStatus } from "@nestjs/common";
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
      let canStore = true;
      const extension = path.parse(file.originalname).ext;
      const userDir = `/files/${req.userName}`;

      if (req.url.endsWith("acpype")) {
        const acpypeFolder = `${userDir}/acpype`;
        const endFile = `${acpypeFolder}/ended`;

        if (fs.existsSync(acpypeFolder)) {
          if (fs.existsSync(endFile)) {
            fs.rmSync(acpypeFolder, { recursive: true, force: true });
          } else {
            canStore = false;

            cb(
              new HttpException("queued-or-running", HttpStatus.CONFLICT),
              null
            );
          }
        }
      }

      if (req.url.endsWith("apo")) {
        const apoFolder = `${userDir}/apo`;
        const endFile = `${apoFolder}/ended`;

        if (fs.existsSync(apoFolder)) {
          if (fs.existsSync(endFile)) {
            fs.rmSync(apoFolder, { recursive: true, force: true });
          } else {
            canStore = false;
            cb(
              new HttpException("queued-or-running", HttpStatus.CONFLICT),
              null
            );
          }
        }
      }

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }

      if (canStore) {
        cb(null, `${req.userName}/${normalizeString(fileName)}${extension}`);
      }
    },
  }),
};

export default multerConfig;
