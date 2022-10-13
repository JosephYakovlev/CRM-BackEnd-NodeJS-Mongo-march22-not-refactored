const mongoose = require("mongoose")

const workerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: Number, required: true},
    ot4estvo: {type: Number, required: true},
    enter: {type: Date, default: Date.now, required: true},
    leave:{type: String, required: true},
    done:[doneworkSchema]
 });


const ContractorLeaderSchema = new mongoose.Schema({
    companiesWorked: {type:Array, default:[]},
    objectsWorked: {type:Array, default:[]},
    name: {type: String, required: true},
    surname: {type: Number, required: true},
    ot4estvo: {type: Number, required: true},
    enter: {type: Date, default: Date.now, required: true},
    leave:{type: String, required: true},
    workers:[workerSchema],
},
   { timestamps: true}
);



module.exports = mongoose.model("ContractorLeader",ContractorLeaderSchema)