const fs = require("fs")
const path = require("path")


const uploadFileInChunks = (file, destination = "userimg") => {
   
  return new Promise((resolve, reject) => {
    try {
      if (!file ) {
        return reject("File stream not found")
      }

      const uploadDir = path.join(__dirname, "../public", destination)

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const fileName = Date.now() + "-" + file.originalname
      const filePath = path.join(uploadDir, fileName)

      const writeStream = fs.createWriteStream(filePath, {
        highWaterMark: 1024 * 1024 // 1 MB
      })

      file.stream.pipe(writeStream)

      writeStream.on("finish", () => {
        resolve({
          success: true,
          fileName,
          filePath: `/public/${destination}/${fileName}`
        })
      })

      writeStream.on("error", reject)

    } catch (err) {
      reject(err)
    }
  })
}


const uploadFile = ( file, destination = "userimg") => {
   
    try {
        const uploadPath = path.join(__dirname, "../public", destination)
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }
            const fileName = Date.now() + "-" + file.originalname
            const filePath = path.join(uploadPath, fileName)
            fs.writeFileSync(filePath, file.buffer)
            return {
                success: true,
                filePath: `../public/${destination}/${fileName}`,
            }

    } catch (error) {

        console.error("File upload failed:", error)
        return error
    }
}
const DEST_MAP = {
  1: "userimg",
  2: "productimg",
  3: "brandlogo",
  4: "banners"
}

const deleteFile = (req, res) => {
  try {
    const { fileName, destination } = req.query

    if (!fileName) {
      return res.status(400).json({ message: "fileName is required" })
    }

    const folder = DEST_MAP[Number(destination)]

    if (!folder) {
      return res.status(400).json({ message: "Invalid destination" })
    }

    const filePath = path.join(
      __dirname,
      "..",
      "public",
      folder,
      fileName
    )

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    fs.unlinkSync(filePath)

    return res.json({
      success: true,
      message: "File deleted successfully"
    })
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


module.exports = { uploadFile,uploadFileInChunks,deleteFile }