const mongoose = require("mongoose")

const imgSchema = new mongoose.Schema({
    imgUri: {type: String},
    imgTitle: {type: String},
    imgSroki: {type: String}
 })

 const offerSchema = new mongoose.Schema({
    offerTicketId: {type: String},
    offerOwnerId: {type: String},
    offerOwnerUserName: {type: String},
    offerOwnerAvatar: {type: String},
    ticketOwnerId: {type: String},
    offerPrice: {type: String},
    offerComment: {type: String},
    checked: {type: Boolean}
 })

 const termitos = new mongoose.Schema({
    author: {type: String, required: true},
    mainTitle: {type: String},
    title: {type: String},
    acceptedByOwner: {type: String, default: "NULL"},
    acceptedByContractor: {type: String, default: "NULL"},
    indx: {type: String}
 })

 const conContractOutSchema = new mongoose.Schema({
   caseTicket: {type: String},
   caseOwner: {type: String},
   caseContractor: {type: String},
   idInOwner:{type: String}
 })



 const messageSchema = new mongoose.Schema({
   messageSender: {type: String},
   messageSenderAvatar: {type: String},
   messageSenderUsername: {type: String},
   messageReciever: {type: String},
   title: {type: String},
   theme: {type: String},
   belongs: {type: String},
   seen: {type: String},
   unseen: {type: String, default: "YES"},
   datec: {type: Date, default: Date.now},
 })

 const concludingCaseSchema = new mongoose.Schema({
    status: {type: String},
    caseTicket: {type: String},
    caseOwner: {type: String},
    caseOwnerUserName: {type: String},
    caseOwnerAvatar: {type: String},
    caseContractor: {type: String},
    caseContractorUserName: {type: String},
    caseContractorAvatar: {type: String},
    title: {type: String, required: true},
    category: {type: String},
    adress: {type: String},
    desc: {type:String, max: 500},
    price: {type: Number, required: true},
    datec: {type: Date, default: Date.now},
    terms: [termitos], 
    depositSeller: {type: Number},
    depositCustomer: {type: Number},
    openedCaseimg: {type:String},
    averageAffirm: {type: Array, default:[]},
    transactions: {type:Array, default:[]}
 })

 const outOfferSchema = new mongoose.Schema({
    offerTicketId: {type: String},
    offerOwnerId: {type: String},
    offerOwnerUserName: {type: String},
    offerOwnerAvatar: {type: String},
    ticketOwnerId: {type: String},
    offerPrice: {type: String},
    offerComment: {type: String},
    checked: {type: Boolean}
 })

 const DialogSchema = new mongoose.Schema({
   companion: {type: String},
   companionName: {type: String},
   type: {type: String},
   contractor: {type: String},
   contractorUserName: {type: String},
   contractorAvatar: {type: String},
   owner: {type: String},
   ownerUserName: {type: String},
   ownerAvatar: {type: String},
   avaimage: {type: String},
   appliesTo: {type: String},
   messages: [messageSchema],
})

const UserSchema = new mongoose.Schema ({
    username:{type:String,required: true,min: 3,max: 20,unique: true,},
    email:{type:String,required: true,max: 50,unique: true,},
    cloudinary_id:{type: String},
    avatar: {type: String},
    dialogs: [DialogSchema],
    tickets: [mongoose.Schema.Types.ObjectId],
    buildingObjects: [mongoose.Schema.Types.ObjectId],
    futureObjects: [mongoose.Schema.Types.ObjectId],
    ContractObjects: [mongoose.Schema.Types.ObjectId],
    objects: [mongoose.Schema.Types.ObjectId],
    sklads: [mongoose.Schema.Types.ObjectId],
    finishedContracts: [mongoose.Schema.Types.ObjectId],
    concludingContracts: [concludingCaseSchema],
    conContractOut: [conContractOutSchema],
    runningContracts: [mongoose.Schema.Types.ObjectId],
    futureContracts: [mongoose.Schema.Types.ObjectId],
    incommingContracts: [mongoose.Schema.Types.ObjectId],
    outgoingContracts: [mongoose.Schema.Types.ObjectId],
    processes: [mongoose.Schema.Types.ObjectId],
    password:{type:String,required: true,min: 6, },
    profilePicture:{type:String,default: "",},
    coverPicture:{type:String,default: "",},
    dialoggruzanswers:{type: Array,default: []},
    followers:{type: Array,default: []},
    followings:{type: Array,default: []},
    isAdmin:{type: Boolean,default:false,},
    portfolioImg: [imgSchema],
    desc:{type:String,max:50},
    city:{type:String,max:50}, 
    from:{type:String,max:50}, 
    proffesion:{type:String,max:50},
    firms:{type:Array, default:[]},
    role: {type:String,default: "USER",},
    education: {type:String,default: "Не указано",},
    orgForm: {type:String,default: "обычный пользователь",},
    rating: {type: Number},
    isZakaz4ik: {type: Boolean , default: false},
    isPodryader: {type: Boolean , default: false},
    phoneNumber: {type:String,max:50},
    datec: {type: Date, default: Date.now},
    wallet: {type: Number,default: 0},
    offers: [offerSchema],
    outgoingOffers: [outOfferSchema],
    transactions: {type:Array, default:[]}
    
},
    {timestamps:true}
);

module.exports = mongoose.model("User", UserSchema);
