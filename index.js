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
  origin: ["http://localhost:3000", "http://localhost:5173","http://localhost:4000","https://supersavingapis.onrender.com","https://supersavingmarket.vercel.app"],
  credentials: true,
}));
app.use(
  "/upload",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("upload")
);


app.use(cookieParser())
app.use("/", express.static(path.join(__dirname, "public")))

app.post("/api/upload", (req, res) => {
  const destination = Number(req.query.destination) || 1
  const allowedImages = ["image/jpeg", "image/png", "image/gif"];
  const allowedVideos = ["video/mp4", "video/quicktime"]; // mov = quicktime
  const destCode = {
    1: "userimg",
    2: "productimg",
    3: "brandlogo",
    4: "banners"
  }
  console.log("File upload request received.", destCode[destination]);

  const busboy = Busboy({ headers: req.headers })
  

  let savedPath = ""
  const uploadedFiles = []
  busboy.on("file", (fieldname, file, info) => {
 const { filename, mimeType } = info;
        let folder = "";
        if (allowedImages.includes(mimeType)) {
            folder = "images";
            publicPath = "images";
        } else if (allowedVideos.includes(mimeType)) {
            folder = "videos";
            publicPath = "videos";
        } else {
            file.resume(); // ❌ reject file
            return;
        }

const uploadDir = path.join(__dirname, "./public/upload",folder)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
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
      url: `https://supersavingapis.onrender.com/uploads/${folder}/${safeFilename}`
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


app.use(require('./routes/mainRoutes'));

// build render
app.use(
  "/assets",
  express.static(path.join(__dirname, "dist/assets"))
);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.use((req, res) => {
  try {
    return res.status(404).json({ message: 'Not Found' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

DBConnect()
app.listen(port, () => console.log("running server " + port)) 