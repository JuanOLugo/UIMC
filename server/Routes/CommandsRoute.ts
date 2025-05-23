import { Router } from "express";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from "path";
import fileup, { UploadedFile } from "express-fileupload";
const CommandRouter = Router();

let processMain: null | ChildProcessWithoutNullStreams = null;

const dirExe = path.join(__dirname, "../public/mcServer/server.bat");

const runBat = (dirExe: string) => {
  return spawn("cmd", [dirExe], {
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
};

CommandRouter.get("/goonline", (req, res): any => {
  if (processMain !== null) {
    return res.send({ msg: "El servidor ya esta en linea" });
  }

  try {
    processMain = runBat(dirExe);
    res.send({ msg: "✅ Servidor iniciado" });
  } catch (error) {
    res.send({ msg: "Error al iniciar el servidor" });
  }
});

CommandRouter.get("/stop", (req, res) => {
  if (processMain === null) {
    res.send({ msg: "El servidor no esta en linea" });
    return;
  }

  processMain.kill("SIGINT");
  processMain = null;
  res.send({ msg: "✅ Servidor detenido" });
});

CommandRouter.get("/restart", (req, res) => {
  if (processMain === null) {
    res.send({ msg: "El servidor no esta en linea" });
    return;
  }

  processMain.kill("SIGINT");
  processMain = null;

  setTimeout(() => {}, 1000);

  try {
    processMain = runBat(dirExe);
    res.send({ msg: "✅ Servidor reiniciado" });
  } catch (error) {
    res.send({ msg: "Error al reiniciar el servidor" });
  }
});

CommandRouter.post("/upload", fileup(), (req, res): any => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No se ha subido ningún archivo");
  }
  let files: UploadedFile[] | UploadedFile = req.files.file;
  if (files instanceof Array) {
    files.map((file) => {
      file.mv(
        path.join(__dirname, "../Public/mcServer/mods", file.name),
        (err: any) => {
          if (err) {
            return console.log(err)
          }
          console.log("Archivo subido correctamente")
        }
      );
    });
  } else {
    files.mv(
      path.join(__dirname, "../Public/mcServer/mods", files.name),
      (err: any) => {
        if (err) {
          console.log(err)
        }
        res.send("Archivo subido correctamente");
      }
    );
  }
});

export default CommandRouter;
