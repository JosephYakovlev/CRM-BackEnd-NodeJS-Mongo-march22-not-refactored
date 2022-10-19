const router = require("express").Router();
const DialogGruz = require ('../models/DialogGruz')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')



router.post("/newdialoggruz", upload.single('image'), async (req,res) => {

    try{


            //create new ticket
        const newDialogGruz = new DialogGruz({
            answers: req.body.answersId,
            messagername: req.body.messagername,
            active:req.body.active,
            Title: req.body.Title,
            desc: result.desc,
            city: req.body.city,
            moneytype: req.body.moneytype,
        });

            //save ticket and respond
        const dialoggruz = await newDialogGruz.save();
        res.status(200).json(dialoggruz);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get('/activemessages', async (req,res)=>{
    try{   
        const dialoggruz =  await DialogGruz.find({}).sort({datec: -1,active: true})
        res.json(dialoggruz)
    } catch (e){
        res.status(500).json({message: 'smth went wrong'})
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

router.put("/addOffer", async(req,res)=>{
    if(req.body.DialogGruzCreator !== req.body.userId){
        try{
            const user = await User.findById(req.body.userId);
            const DialogGruzMessage = await DialogGruz.findById(req.body.dgmId);
            if(!DialogGruz.answers.includes(req.body.userId)) {
                await user.updateOne({ $push: {dialoggruzanswers: req.body.dialoggruz } });
                await DialogGruz.updateOne({ $push: {answers: req.body.userId } });
                res.status(200).json("message has been followed");
            }else {
                res.status(403).json("you allready follow this message")
            }
        } catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you cant follow your own")
    }
});



module.exports = router