const mongoose = require("mongoose")

const doneworkSchema = new mongoose.Schema({
    name: {type:String, required: true},
    quantity: {type:Number, required: true},
    unit: {type:String, required: true}   
  })

const wastedmaterialsSchema = new mongoose.Schema({
    date: {type: String, required: true},
    name: {type: String, required: true},
    quantity: {type:Number, required: true},
    unit: {type:String, required: true}  
 });

 const workerSchema = new mongoose.Schema({
    owner: {type: String, required: true},
    name: {type: String, required: true},
    surname: {type: Number, required: true},
    ot4estvo: {type: Number, required: true},
    enter: {type: Date, default: Date.now, required: true},
    leave:{type: String, required: true},
    done: {doneworkSchema}
 });

const workersbydateSchema = new mongoose.Schema({
    date: {type: String, required: true},
    workers: [workerSchema]
 });

const BrigadeSchema = new mongoose.Schema({
   relatesTo: {type: String, required: true},
   leader: {type: String},
   workedprocesses: {type:Array, default:[]},
   workedobjects: {type:Array, default:[]},
   workers: [workersbydateSchema],
   wastedmaterials:[wastedmaterialsSchema]
},
   { timestamps: true}
);



module.exports = mongoose.model("Brigade",BrigadeSchema)