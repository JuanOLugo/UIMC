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

CommandRouter.get("/isserveron", (req, res): any => {
  if (processMain !== null) {
    return res.send({ msg: "El servidor ya esta en linea" });
  }else {
    return res.send({ msg: "El servidor no esta en linea "});
  }

});

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

CommandRouter.post("/upload", fileup(), async (req, res): Promise<any> => {
if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No se ha subido ningún archivo" });
  }

  let files: UploadedFile[] | UploadedFile = req.files.file;
  const uploadDir = "C:/Users/Administrator/Desktop/mineserver/mods";

  try {
    if (Array.isArray(files)) {
      // Procesar múltiples archivos
      const results = await Promise.all(
        files.map(file => new Promise((resolve, reject) => {
          const savePath = path.join(uploadDir, file.name);
          file.mv(savePath, err => {
            if (err) {
              console.error("Error al mover archivo:", err);
              return reject(err);
            }
            resolve("ok");
          });
        }))
      );
      return res.json({ msg: "Todos los archivos se subieron correctamente", results });
    } else {
      // Procesar un solo archivo
      const savePath = path.join(uploadDir, files.name);
      files.mv(savePath, (err: any) => {
        if (err) {
          console.error("Error al mover archivo:", err);
          return res.status(500).json({ msg: "Error al subir el archivo" });
        }
        return res.json({ msg: "Archivo subido correctamente" });
      });
    }
  } catch (error) {
    console.error("Error durante la carga de archivos:", error);
    return res.status(500).json({ msg: "Ocurrió un error al subir los archivos" });
  }
});

export default CommandRouter;
