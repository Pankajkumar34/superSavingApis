const mongoose = require("mongoose");

const getRoleBaseFilter = (user) => {
  const { userId, role } = user;
  switch (role) {

    case "SUPER_ADMIN":
      return {}; 

    case "FRANCHISE_ADMIN":
      return { franchiseId: new mongoose.Types.ObjectId(userId) };

    case "WAREHOUSE_ADMIN":
      return {role: "FRANCHISE_ADMIN"};

    default:
      return { _id: new mongoose.Types.ObjectId(userId) }; 
  }
};

module.exports = { getRoleBaseFilter };