const mongoose = require("mongoose")

const workSchema = new mongoose.Schema({
  name:{type:String, required: true},
  quantity:{type:Number, required: true},
  unit:{type:String, required: true}   
})

const materialSchema = new mongoose.Schema({
   name:{type:String, required: true},
   quantity:{type:Number, required: true},
   unit:{type:String, required: true}   
});

const workerSchema = new mongoose.Schema({
   owner: {type: String, required: true},
   name: {type: String, required: true},
   surname: {type: Number, required: true},
   ot4estvo: {type: Number, required: true},
   enter: {type: Date, default: Date.now, required: true},
   leave:{type: String, required: true},
   done:[workSchema]
});

 const brigadeSchema = new mongoose.Schema({
   leader:{type:String, required: true},
   workers:[workerSchema],
   name:{type:String, required: true}, 
 })

const budgetSchema = new mongoose.Schema({
   workKind: {type: String, required: true},
   workers: {type: Number, required: true},
   workersPrice: {type: Number, required: true},
   workersUnit:{type:String, required: true}, 
   materials: {type: Date, default: Date.now, required: true},
   materialsPrice:{type: String, required: true},
   materialsUnit:{type:String, required: true},
   done:[workSchema]
});

const BuildingProcessSchema = new mongoose.Schema({
   relatesToObject: {type: String, required: true},
   ownerId: {type: String},
   mainTitle:{type: String},
   leader: {type: String},
   password:{type:String,required: true,min: 6, },
   start: {type: String},
   end: {type: String},
   budgetsumm: {type: Number}, 
   budgetWasted: [budgetSchema],
   workPlan: {workSchema},
   workDone: [workSchema],
   materials:[materialSchema],
   materialsWasted:[materialSchema],
   completed:{type: String},
   contractorLeaders: {type:Array, default:[]},
   spent: {type: String},
   contractors:[mongoose.Schema.Types.ObjectId],
   workers:[workerSchema],
   desc: {type:String, max: 500},
   objectimg:{type:String}
},
   { timestamps: true}
);



module.exports = mongoose.model("BuildingProcess",BuildingProcessSchema)