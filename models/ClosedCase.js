const mongoose = require("mongoose")

const ClosedCase = new mongoose.Schema({
   openedCaseId:{type: String, required: true},
   mainTitle: {type: String, required: true},
   title: {type: String, required: true},
   price: {type: Number, required: true},
   depositSeller: {type: Number, required: true},
   depositCustomer: {type: Number, required: true},
   datec: {type: Date, default: Date.now},
   closedCaseId:{type: String, required: true},
   desc: {type:String, max: 500},
   closedCaseimg:{type:String},
   affirmseller:{type: Array, default:[]},
   affirmcustomer:{type: Array, default:[]}
},
   { timestamps: true}
);



module.exports = mongoose.model("ClosedCase",ClosedCase)