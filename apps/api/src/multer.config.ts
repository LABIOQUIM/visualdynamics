import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";

const multerConfig = {
  limits: {
    fileSize: 8000000, // Compliant: 8MB
  },
  storage: diskStorage({
    destination: "/files",
    filename: (req, file, cb) => {
      const extension = path.parse(file.originalname).ext;
      const userDir = `/files/${req.session.user.username}`;
      const runningFile = `${userDir}/running`;
      let runningFileContent = "";

      if (fs.existsSync(runningFile)) {
        runningFileContent = fs.readFileSync(runningFile, "utf-8");
      }

      if (req.url.endsWith("acpype") && runningFileContent !== "acpype") {
        const acpypeFolder = `${userDir}/acpype`;

        if (fs.existsSync(acpypeFolder)) {
          fs.rmSync(acpypeFolder, { recursive: true, force: true });
        }
      }

      if (req.url.endsWith("apo") && runningFileContent !== "apo") {
        const apoFolder = `${userDir}/apo`;

        if (fs.existsSync(apoFolder)) {
          fs.rmSync(apoFolder, { recursive: true, force: true });
        }
      }

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }

      const filename =
        file.fieldname === "filePDB"
          ? "originalMacromolecule"
          : "originalLigand";

      cb(null, `${req.session.user.username}/${filename}${extension}`);
    },
  }),
};

export default multerConfig;
