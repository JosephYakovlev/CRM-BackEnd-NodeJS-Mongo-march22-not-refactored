const router = require("express").Router();
const Ticket = require ('../models/Ticket')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator');
const BuildingObject = require("../models/BuildingObject");
const BuildingProcess = require("../models/BuildingProcess");
const User = require("../models/User");



router.post("/registerprocess",  async (req,res) => {

    try{
        console.log(req.body)

        const salt = await bcrypt.genSalt(12);
        const hashedProcessPassword = await bcrypt.hash(req.body.password, salt)

            //create new BuildingObject
        const newBuildingProcess = new BuildingProcess({
            relatesToObject: req.body.relatesToObject,
            ownerId: req.body.ownerId,
            mainTitle: req.body.mainTitle,
            password: hashedProcessPassword,
            leader: req.body.leader,
            start: req.body.start,
            end: req.body.end,
            desc: req.body.desc,
        });

            //save BuildingObject and respond
        const SavedBuildingProcess = await newBuildingProcess.save();

        const object = await BuildingObject.findById(req.body.relatesToObject);
        
        const updatedObject = await object.updateOne({ $push: {processes: SavedBuildingProcess._id } });

        const user = await User.findById(req.body.ownerId);
        const updatedUser = await user.updateOne({ $push: {processes: SavedBuildingProcess._id } });

        res.status(200).json({object});
        
    } catch(err){
        res.status(500).json(err);
    }

});

router.post("/check", upload.single('image'), async (req,res) => {

    
    try{

        console.log(req.body)
        
        const {_id} = req.body
        console.log(req.body)
        console.log(_id)
        const workflow = await BuildingProcess.findOne({ _id })
       
        res.json({workflow})

    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getprocessbyid/:process", async(req,res)=>{
    try{
        const processId = req.params.process
        console.log(req.params)
        const process = await BuildingProcess.findOne({ _id: processId })
        console.log(process)
        res.status(200).json(process)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/getticketid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId
        console.log(userId)
        const ticket = await Ticket.findOne({ owners: [userId] })
        console.log("foound")
        const {_id,...other} = ticket._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/ticketFindById/:ticketId", async(req,res)=>{
    try{

        const ticketId = req.params.ticketId
        console.log(ticketId)
        const ticket = await Ticket.findOne({ _id: ticketId })
        console.log("foound")
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
        
        
        console.log(Filtered);
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
        console.log(currentTicket)
        
        
        res.status(200).json("user has been followed");
           
        } catch(err){
            res.status(500).json(err)
        }
    
});


router.post('/connecttoprocess', async (req, res) => {
    
    try {
        const {contractorId, processId, password} = req.body

    
        const processBefore = await BuildingProcess.findById(processId)
    
        if (!process) {
            return res.status(400).json({ message: 'Процесс не найден' })
        }
        console.log('processBefore')
        console.log(processBefore)

        const isMatch = await bcrypt.compare(password, processBefore.password)

        
    
        if (!isMatch) {
            return res.status(400).json({ message: 'верный пароль, попробуйте снова' })
        }

        const object = await BuildingObject.findById(processBefore.relatesToObject)
        
        
        
        const updatedProcess = await processBefore.updateOne({ $push: {contractors: contractorId } })
        processBefore._doc.contractors.push(contractorId)
        workflow = processBefore._doc

        

        console.log('updated process')
        console.log(workflow)

        
        res.status(200).json({workflow, object})
  
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }

    })



module.exports = router