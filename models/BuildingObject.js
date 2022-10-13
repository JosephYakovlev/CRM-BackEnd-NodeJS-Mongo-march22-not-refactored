const mongoose = require("mongoose")

const BuildingObjectSchema = new mongoose.Schema({
    ownerId:{type: String, required: true},
    mainTitle: {type: String, required: true},
    start: {type: String, required: true},
    adress: {type: String, required: true}, 
    end: {type: String, required: true},
    budget: {type: String},
    spent: {type: String},
    desc: {type:String, max: 500},
    processes:[mongoose.Schema.Types.ObjectId],
    objectimg:{type:String}
},
   { timestamps: true}
);



module.exports = mongoose.model("BuildingObject",BuildingObjectSchema)