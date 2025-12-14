const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware');
const authController = require("../controller/authController/auth.controller")
const { uploadFile,uploadFileInChunks } = require('../helpers/fileUploader');
const Busboy = require("busboy")
const fs = require("fs")
const path = require("path")

// role 1 = superAdmin
router.post("/fileUpload",async(req,res)=>{
   try {
    const busboy = Busboy({ headers: req.headers })

  const uploadDir = path.join(__dirname, "../public/userimg")
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  let savedFilePath = ""

  busboy.on("file", (fieldname, file, filename) => {
    const fileName = Date.now() + "-" + filename
    savedFilePath = path.join(uploadDir, fileName)

    const writeStream = fs.createWriteStream(savedFilePath, {
      highWaterMark: 1024 * 1024 // 1 MB chunks
    })

    file.pipe(writeStream)
  })

  busboy.on("finish", () => {
    res.status(200).json({
      success: true,
      filePath: savedFilePath
    })
  })

  busboy.on("error", err => {
    console.error(err)
    res.status(500).json({ error: "Upload failed" })
  })

  // 🔑 THIS LINE IS REQUIRED
  req.pipe(busboy)
   } catch (error) {
    return res.status(500).json({ message: "File upload failed", msg:error.message } );
   }
} ); 

router.post('/signup',authController.signup);
router.post('/send-otp',authController.sendOtp);
router.post('/verify-otp',authController.verifyOtp);
router.post('/complete-profile/:userId',verifyToken, authController.completeProfile);
router.post("/refresh-token", authController.refreshToken);
router.get("/me",verifyToken, authController.me);
router.post("/logout",verifyToken,authController.logout)

module.exports = router;
