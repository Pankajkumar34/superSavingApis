const mongoose =require("mongoose")

const attributeSchema = new mongoose.Schema({
   product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    type:{
        
    }
   

})