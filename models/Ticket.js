const mongoose = require("mongoose")


const imgSchema = new mongoose.Schema({
   imgUri: {type: String},
   imgTitle: {type: String},
   imgSroki: {type: String}
})


const offerSchema = new mongoose.Schema({
   offerOwnerId: {type: String},
   ticketOwnerId: {type: String},
   offerPrice: {type: String},
   offerComment: {type: String},
   checked: {type: String}
})



const TicketSchema = new mongoose.Schema({
   ownerId:{type: String},
   ownerUserName: {type: String},
   ownerAvatar: {type: String},
   mainTitle: {type: String, required: true},
   title: {type: String},
   price: {type: String, required: true},
   datec: {type: Date, default: Date.now},
   clicks: {type: Number, default:0},
   desc: {type:String, max: 500},
   mainimg:{type:String},
   otherImg: [imgSchema],
   offers: [offerSchema],
   cloudinary_id:{type: String},
   likes:{type: Array, default:[]},
   dislikes:{type: Array, default:[]},
   spec:{type: String},
   category:{type: String},
   okrug: {type: String}, 
   oblast: {type: String} ,
   city:  {type: String},
   paymentType:  {type: String},
   start: {type: Date, default: Date.now},
   finish: {type: Date},
   phoneNumber: {type: String},

   
},
   { timestamps: true}
);



module.exports = mongoose.model("Ticket",TicketSchema)