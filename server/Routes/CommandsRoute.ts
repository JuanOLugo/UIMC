import { Router } from "express";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from "path";
import fileup, { UploadedFile } from "express-fileupload";
const CommandRouter = Router();

let processMain: null | ChildProcessWithoutNullStreams = null;



const runBat = () => {
  return spawn("java", ['-Xms1G', '-Xmx2G', "-jar", path.join("C:/Users/Administrator/Desktop/mineserver/server.jar"), "nogui" ], {
    shell: false,
    detached:false,
    cwd: path.dirname("C:/Users/Administrator/Desktop/mineserver/server.jar"),
  
  });
};

CommandRouter.get("/goonline", (req, res): any => {
  if (processMain !== null) {
    return res.send({ msg: "El servidor ya esta en linea" });
  }

  try {
    processMain = runBat();
    res.send({ msg: "✅ Servidor iniciado", msgdata: processMain });
  } catch (error) {
    res.send({ msg: "Error al iniciar el servidor" });
  }
});

CommandRouter.get("/stop", (req, res): any => {
  if (processMain === null) {
    return res.send({ msg: "El servidor no está en línea" });
  }
  
  processMain.stdin.write("stop\n");
  processMain = null
  res.send({ msg: "✅ Servidor detenido (esperando cierre)" });
});

CommandRouter.get("/restart", (req, res): any => {
   if (processMain === null) {
    return res.send({ msg: "El servidor no está en línea" });
  }

  processMain.stdin.write("stop\n");
  processMain.once("exit", () => {
    processMain = runBat();
    res.send({ msg: "✅ Servidor reiniciado" });
  });
});

CommandRouter.post("/upload", fileup(), (req, res): any => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No se ha subido ningún archivo");
  }
  let files: UploadedFile[] | UploadedFile = req.files.file;
  if (files instanceof Array) {
    files.map((file) => {
      file.mv(
        path.join("C:/Users/Administrator/Desktop/mineserver/server.jar/mods/", file.name),
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
      path.join("C:/Users/Administrator/Desktop/mineserver/server.jar/mods/", files.name),
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
