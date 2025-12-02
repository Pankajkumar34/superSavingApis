const mongoose = require("mongoose");
const DBConnect = async () => {
  try {
    const Connection = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (Connection) {
      console.log("Db Connected");
    }
  } catch (error) {
    console.log(error, ":Db Error");
  }
};


module.exports =DBConnect