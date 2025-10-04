const express = require("express")
const app = express()
const port = 4000
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()
const DBConnect=require("./DB/db")
app.use(cors())
app.use(cookieParser())
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
app.listen(port,()=>console.log("running server "+port)) 