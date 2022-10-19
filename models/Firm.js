const mongoose = require("mongoose")

const FirmSchema = new mongoose.Schema({
   owners:{type:Array, default:[{type: mongoose.Types.ObjectId, ref: 'User',unique: true}]},
   firmname:{type:String,require: true,min: 3,max: 20},
   mainTitle: {type: String, required: true},
   title: {type: String, required: true},
   INN: {type: Number, required: true},
   datec: {type: Date, default: Date.now},
   desc: {type:String, max: 500},
   mainimg:{type:String},
   cloudinary_id:{type: String},
   rating:{type: Number, required: true},
   feedback:{type: Array, default:[]},
   casesOpen:{type: Array, default:[]},
   casesClosed:{type: Array, default:[]},
   turnover:{type: Array, default:[]},
   followers:{type: Array,default: []},
   followings:{type: Array,default: []}, 
   password:{type:String,required: true,min: 6, }
},
   { timestamps: true}
);



module.exports = mongoose.model("Firm",FirmSchema)