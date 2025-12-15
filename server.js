const express = require("express")
const app = express()
const port = 4000
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const fileUpload = require("express-fileupload")
const fs = require("fs")
const path = require("path")
const Busboy = require("busboy")
require("dotenv").config()
const DBConnect = require("./DB/db")
const { deleteFile } = require("./helpers/fileUploader")
// app.use(fileUpload({
//   limits: { fileSize: 50 * 1024 * 1024 },
// }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser())
app.use("/",express.static(path.join(__dirname,"public")))

app.post("/api/upload", (req, res) => {
const destination =Number(req.query.destination) || 1
const destCode = {
  1: "userimg",
  2: "productimg",
  3: "brandlogo",
  4: "banners"
}
console.log("File upload request received.",destCode[destination]);

  const busboy = Busboy({ headers: req.headers })
    const uploadDir = path.join(__dirname, "public", destCode[destination])
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  let savedPath = ""
const uploadedFiles = []
  busboy.on("file", (fieldname, file, info) => {

    const filename =
      typeof info === "object" && info.filename
        ? info.filename
        : "unknown.jpg"

    const safeFilename = Date.now() + "-" + String(filename)
    savedPath = path.join(uploadDir, safeFilename)

    const writeStream = fs.createWriteStream(savedPath, {
      highWaterMark: 1024 * 1024 // 1MB
    })
    file.pipe(writeStream)
     uploadedFiles.push({
      fieldname,
      fileName: safeFilename,
      path: savedPath,
      url: `http://localhost:4000/${destCode[destination]}/${safeFilename}`
    })
  })

  busboy.on("finish", () => {
    res.status(200).json({
      success: true,
      filePath: uploadedFiles
    })
  })

  busboy.on("error", err => {
    console.error(err)
    res.status(500).json({ error: err.message })
  })

  req.pipe(busboy)
})
app.delete("/api/file/delete", deleteFile)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/super-admin', require('./routes/superAdmin.routes'));
app.use('/api/franchise', require('./routes/franchise.routes'));
app.use('/api/sub-admin', require('./routes/subAdmin.routes'));
app.use('/api/warehouse', require('./routes/warehouse.routes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

DBConnect()
app.listen(port, () => console.log("running server " + port)) 