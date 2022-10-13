const mongoose = require("mongoose")

const Transaction = new mongoose.Schema({
   Sender:{type: String, required: true},
   Reciever: {type: String, required: true},
   Summ: {type: Number, required: true},
   Context: {type: String, required: true},
   BelongsTo: {type: String, required: true},
   PayFor: {type: String, required: true},
   datec: {type: Date, default: Date.now}
},
   { timestamps: true}
);



module.exports = mongoose.model("Transaction",Transaction)