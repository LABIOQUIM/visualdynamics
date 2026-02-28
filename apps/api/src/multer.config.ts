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
