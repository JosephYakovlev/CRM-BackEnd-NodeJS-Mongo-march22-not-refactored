const mongoose = require("mongoose")
  

const termitos = new mongoose.Schema({
   author: {type: String, required: true},
   mainTitle: {type: String},
   title: {type: String},
   acceptedByOwner: {type: String, default: "NULL"},
   acceptedByContractor: {type: String, default: "NULL"},
})

 

const WorkDoneSchema = new mongoose.Schema({
   name:{type:String, required: true},
   unit:{type:String, required: true},
   quantity:{type:Number, required: true},
   price: {type:Number, required: true, default: 1},
   approved: {type: String, default: "NO"},
   paid: {type: Number, default: 0}, 
   img: {type: String, default: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'}
})

const MaterialsWastedSchema = new mongoose.Schema({
   name:{type:String, required: true},
   unit:{type:String, required: true},
   quantity:{type:Number, required: true},
   price: {type:Number, required: true},
   approved: {type: Array, default: []},
   approved: {type: String, default: "NO"},
   paid: {type: Number, default: 0}, 
})

const WorkerSchema = new mongoose.Schema({
   name: {type: String, required: true},
   surname:{type:String, required: true},
   enter: {type: String,  required: true},
   leave:{type: String, required: true},
   done: [WorkDoneSchema],
   price: {type:Number, required: true},
   approved: {type: String, default: "NO"},
   paid: {type: Number, default: 0}, 
   img: {type: String, default: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'}
});

const WorkDaySchema = new mongoose.Schema({
   day: {type: Number},
   date: {type: Date},
   workDone: [WorkDoneSchema],
   materialsWasted: [MaterialsWastedSchema],
   price: {type:Number, required: true},
   approved: {type: String, default: "NO"},
   paid: {type: Number},
   workers: [WorkerSchema],
})


const OpenedCase = new mongoose.Schema({
   fromConContr: {type: String},
   status: {type: String},
   caseTicket: {type: String},
   caseOwner: {type: String},
   caseOwnerUserName: {type: String},
   caseOwnerAvatar: {type: String},
   voteEndOwner: {type: Boolean, default: false},
   caseContractor: {type: String},
   caseContractorUserName: {type: String},
   caseContractorAvatar: {type: String},
   voteEndContractor: {type: Boolean, default: false},
   workStart: {type: Date},
   workEnd: {type: Date},
   title: {type: String, required: true},
   category: {type: String},
   adress: {type: String},
   desc: {type:String, max: 500},
   price: {type: Number, required: true},
   datec: {type: Date, default: Date.now},
   terms: [termitos], 
   depositOwner: {type: Number},
   depositContractor: {type: Number},
   openedCaseimg: {type:String},
   averageAffirm: {type: Array, default:[]},
   workDays: [WorkDaySchema],
   transactions: {type:Array, default:[]},
   caseClosed: {type: Boolean, default: false},
},
   { timestamps: true}
);



module.exports = mongoose.model("OpenedCase",OpenedCase)