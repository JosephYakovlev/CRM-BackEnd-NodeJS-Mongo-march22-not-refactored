const mongoose = require("mongoose")

const ScheduleWorkers = new mongoose.Schema({
   userId:{type: String, required: true},
   mainTitle: {type: String, required: true},
   start: {type: Number, required: true},
   end: {type: Number, required: true},
   budget: {type: Number, required: true},
   spent: {type: Date, default: Date.now},
   completed:{type: String, required: true},
   desc: {type:String, max: 500},
   objectimg:{type:String}
},
   { timestamps: true}
);



module.exports = mongoose.model("ScheduleWorkers",ScheduleWorkers)