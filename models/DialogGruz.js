const mongoose = require("mongoose")

const DialogGruzSchema = new mongoose.Schema({
   answers: {type:Array, default:[{type: mongoose.Types.ObjectId, ref: 'User',unique: true}]},
   DialogGruzCreator: {type:Array, default:[{type: mongoose.Types.ObjectId, ref: 'User',unique: true}]},
   active: {type: Boolean, default: false},
   Title: {type: String, max: 20,  required: true},
   city: {type:String, max: 20, required: true},
   money: {type:String, max: 10, required: true},
   moneytype: {type:String, max: 20, required: true},
   desc: {type: String, max: 160, required: true},
},
   { timestamps: true}
);



module.exports = mongoose.model("DialogGruz",DialogGruzSchema)