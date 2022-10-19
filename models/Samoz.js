const mongoose = require("mongoose")

const SamozSchema = new mongoose.Schema({
   samozname:{type: String, required: true},
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
   firms:{type: Array,default: []},
   city:{type:String,max:50}, 
   proffesion:{type:String,max:50}

},
   { timestamps: true}
);



module.exports = mongoose.model("Samoz",SamozSchema)