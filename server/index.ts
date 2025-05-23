import express from "express"
import cors from "cors"
import CommandRouter from "./Routes/CommandsRoute"
const app = express()
app.use(cors())

app.use("/commands", CommandRouter)

app.listen(3000, () => {
  console.log("Server running on port 3000")
})