const router = require("express").Router();
const BuildingObject = require ('../models/BuildingObject')
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')



router.post("/registerobject",  async (req,res) => {

    try{

            //create new BuildingObject
        const newBuildingObject = new BuildingObject({
            ownerId: req.body.ownerId,
            mainTitle: req.body.mainTitle,
            start: req.body.start,
            end: req.body.end,
            budget: req.body.budget || null,
            adress: req.body.adress || null,
            desc: req.body.desc,
        });

            //save BuildingObject and respond
        const SavedBuildingObject = await newBuildingObject.save();


        const user = await User.findById(req.body.ownerId);
        
        const updatedUser = await user.updateOne({ $push: {objects: SavedBuildingObject._id } });


        res.status(200).json({SavedBuildingObject});
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.post("/check", upload.single('image'), async (req,res) => {

    
    try{
        
        const {_id} = req.body
        const object = await BuildingObject.findOne({ _id })
       
        
        res.json({object})

    } catch(err){
        res.status(500).json(err);
    }

});

router.get("/getobjectbyid/:objectId", async(req,res)=>{
    try{
        const objectId = req.params.objectId

        const object = await BuildingObject.findOne({ _id: objectId })

        res.status(200).json(object)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/ticketFindById/:ticketId", async(req,res)=>{
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
        const currentTicket = await Ticket.updateOne({_id: `${req.params.id}`},{ $push: {offers: req.body } });

        
        
        res.status(200).json("user has been followed");
           
        } catch(err){
            res.status(500).json(err)
        }
    
});



module.exports = router