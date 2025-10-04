const mongoose = require("mongoose");
const DBConnect = async () => {
  try {
    const Connection = await mongoose.connect("mongodb+srv://pankajgithubnew:8JHbfBsMSJoX5YrF@cluster0.v5clp2d.mongodb.net/");

    if (Connection) {
      console.log("Db Connected");
    }
  } catch (error) {
    console.log(error, ":Db Error");
  }
};


module.exports =DBConnect