import express from "express";
import cors from "cors";
import CommandRouter from "./Routes/CommandsRoute";
import path from "path";
const app = express();

const dirPublic = path.join(__dirname, "public", "Frontend", "browser")
app.use(express.static(dirPublic));
app.get("/", (req, res) => {
  res.sendFile(path.join(dirPublic, "index.html"));
});
app.use(cors());
app.use("/commands", CommandRouter);




app.listen(3000, () => {
  console.log("Server running on port 3000");
});
