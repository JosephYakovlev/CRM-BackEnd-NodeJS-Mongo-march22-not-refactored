const router = require("express").Router();
const Ticket = require ('../models/Ticket')
const User = require("../models/User");
const OpenedCase = require("../models/OpenedCase")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')



router.post("/register", upload.single('image'), async (req,res) => {

    try{

        const fileStr = req.body.avatar;
        const result = fileStr ? await cloudinary.uploader.upload(`data:image/jpeg;base64,${fileStr}`) : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'
        
        const realresult = fileStr ? result.url : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'

        const newTicket = new Ticket({
            ownerId: req.body.ownerId,
            ownerUserName: req.body.ownerUserName,
            ownerAvatar: req.body.ownerAvatar,
            mainTitle: req.body.mainTitle,
            price:req.body.price,
            mainimg: realresult,
            city: req.body.city,
            phoneNumber: req.body.phoneNumber,
            start: req.body.start,
            otherImg: req.body.otherImg,
            category: req.body.category
        });

        
            //save ticket and respond
        const ticket = await newTicket.save();

        const user = await User.findById(req.body.ownerId);
        
        
        const updatedUser = await user.updateOne({ $push: {tickets: ticket._id } });


        res.status(200).json(ticket);

        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getticketid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId
   
        const ticket = await Ticket.findOne({ owners: [userId] })
   
        const {_id,...other} = ticket._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})



router.get("/getTicketById/:ticketId", async(req,res)=>{
    try{

        const ticketId = req.params.ticketId

        const ticket = await Ticket.findOne({ _id: ticketId })
       
        res.status(200).json(ticket)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/', async (req,res)=>{

try {
    const tickets = await Ticket.find({owners:null})
    res.json(tickets)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})


router.get('/ticketFind', async (req,res)=>{
    
    try{ 
        
        const filter = {
            category: 4 || undefined,
            spec: undefined,
            city: undefined
        }
       
        const Filtered = JSON.stringify(filter).replace(/"(\w+)"\s*:/g, '$1:').replace(/"/g, '\'')
        
      
        const ticket =  await Ticket.find(Filtered).sort({datec: -1})
        res.json(ticket)
    } catch (e){
        res.status(500).json({message: 'smth went wrong'})
    }
})



router.get('/ticketFindOne', async (req,res)=>{
    try{   
        const ticket =  await Ticket.find({}).sort({datec: -1})
        res.json(ticket)
    } catch (e){
        res.status(500).json({message: 'smth went wrong'})
    }
})



router.get('/:id', async (req,res)=>{

try {
    const tickets = await Ticket.findById(req.params.id)
    res.json(tickets)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})


router.put("/:id/addOffer", async(req,res)=>{
    
    
     try{


        console.log("ADDOFFER")
       
        const updatedTicketOwner = await User.updateOne({_id: `${req.body.ticketOwnerId}`},{ $push: {offers: req.body } });
        

        const updatedOfferOwner = await User.updateOne({_id: `${req.body.offerOwnerId}`},{ $push: {outgoingOffers: req.body } });
        
        
        
        
        res.status(200).json({sender: req.body.offerOwnerId, reciever: req.body.ticketOwnerId})
           
        } catch(err){
            res.status(500).json(err)
        }
    
});

router.post("/approved", async(req,res)=>{
    
    const approveData = req.body
    console.log('APPROVED')
    console.log(approveData)
   

    
    try{

        console.log("HELLO 3")

        const concludingCase = {
            status: 'CONCLUDING',
            caseTicket: approveData.currentTicket._id,
            caseOwner: approveData.currentTicket.ownerId,
            caseOwnerUserName: approveData.currentTicket.ownerUserName,
            caseOwnerAvatar: approveData.currentTicket.ownerAvatar,
            caseContractor: approveData.offerOwner._id,
            caseContractorUserName: approveData.offerOwner.username,
            caseContractorAvatar: approveData.offerOwner.avatar,
            title: approveData.currentTicket.mainTitle,
            category: '',
            adress: approveData.currentTicket.city,
            desc: approveData.currentTicket.title,
            price: approveData.currentTicket.price,
            terms: [{
                acceptedByContractor: "NULL",
                acceptedByOwner: "NULL",
                author: approveData.currentTicket.ownerId,
                mainTitle: approveData.currentTicket.start,
                title: approveData.currentTicket.start,
              },
              {
                acceptedByContractor: "NULL",
                acceptedByOwner: "NULL",
                author: approveData.currentTicket.ownerId,
                mainTitle: approveData.currentTicket.price,
                title:0
              }], 
            depositSeller: 0,
            depositCustomer: 0,
            openedCaseimg: approveData.currentTicket.mainimg,
            averageAffirm: [],
        };

       
       
        console.log("HELLO 18")

        const newmessage = {
            messageSender: 'BOT BUILDER',
            messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
            messageSenderUsername: 'BOT BUILDER',
            messageReciever: '',
            title: 'Вы прошли на этап заключения сделки',
            theme: 'CONCLUDING CONTRACT',
            belongs: '',
            seen: 'UNSEEN'   
        }

        const DialogForSender = {
            companion: approveData.currentTicket._id ,
            type: 'CONCLUDING CONTRACT',
            companionName: approveData.currentTicket.mainTitle.substring(0,15),
            avaimage: approveData.currentTicket.mainimg,
            contractor: approveData.offerOwner._id,
            contractorUserName: approveData.offerOwner.username,
            contractorAvatar: approveData.offerOwner.avatar,
            owner: approveData.currentTicket.ownerId,
            ownerUserName: approveData.currentTicket.ownerUserName,
            ownerAvatar: approveData.currentTicket.ownerAvatar,
            appliesTo: '',
            messages: [newmessage],
         }

         const updateSender = await User.updateOne({
            _id: `${approveData.currentTicket.ownerId}`,
        },
        {
            $push: { dialogs: DialogForSender} 
        });


        console.log("HELLO 12")

         const DialogForReciever = {
            companion: approveData.currentTicket._id ,
            type: 'CONCLUDING CONTRACT',
            companionName: approveData.currentTicket.mainTitle.substring(0,15),
            avaimage: approveData.currentTicket.mainimg,
            contractor: approveData.offerOwner._id,
            contractorUserName: approveData.offerOwner.username,
            contractorAvatar: approveData.offerOwner.avatar,
            owner: approveData.currentTicket.ownerId,
            ownerUserName: approveData.currentTicket.ownerUserName,
            ownerAvatar: approveData.currentTicket.ownerAvatar,
            appliesTo: '',
            messages: [newmessage],
         }

         const updateReciever = await User.updateOne({
            _id: `${approveData.offerOwner._id}`,
        },
        {
            $push: { dialogs: DialogForReciever} 
        });
        

        console.log("HELLO 2") 
       
        const updatedTicketOwner = await User.updateOne({
            _id: `${approveData.currentTicket.ownerId}`,
            "offers.offerOwnerId": approveData.offerOwner._id,
            "offers.offerTicketId": approveData.currentTicket._id
        },
        {
            $set: {"offers.$.checked": true}
        });

        console.log("HELLO 1")

        const updatedTicketOwnerO = await User.updateOne({
            _id: `${approveData.currentTicket.ownerId}`
        },
        {
            $push: {concludingContracts: concludingCase},
        });

        console.log("HELLO")
       
        const user = await User.findById(approveData.currentTicket.ownerId)
        
        const indexInOwner = user.concludingContracts.findIndex(conContr => {
                return conContr.price === 70000;
              })
        
            
     

        const updatedOfferOwner = await User.updateOne({
            _id: `${approveData.offerOwner._id}`,
            "outgoingOffers.offerOwnerId": approveData.offerOwner._id,
            "outgoingOffers.offerTicketId": approveData.currentTicket._id
        },
        {
            $set: {"outgoingOffers.$.checked": true}
        });

        console.log("HELLO 5" )
        const conContractOut = {
            caseTicket: user.concludingContracts[indexInOwner].caseTicket,
            caseOwner: user.concludingContracts[indexInOwner].caseOwner,
            caseContractor: user.concludingContracts[indexInOwner].caseContractor,
            idInOwner: user.concludingContracts[indexInOwner]._id
        }

        const updatedOfferOwnerO = await User.updateOne({
            _id: `${approveData.offerOwner._id}`,
        },
        {
            $push: {conContractOut: conContractOut }
        });
        

        
        
        const contractor = await User.findById(approveData.currentTicket.ownerId)
        const ConCase = contractor.concludingContracts.find(i => {
            return i.caseTicket == approveData.currentTicket._id,
            i.caseContractor == approveData.offerOwner._id
          })
       
        console.log("HELLO 6")
        console.log(ConCase)


    
    
       res.status(200).json(ConCase);
          
       } catch(err){
           res.status(500).json(err)
       }
   
});



module.exports = router
