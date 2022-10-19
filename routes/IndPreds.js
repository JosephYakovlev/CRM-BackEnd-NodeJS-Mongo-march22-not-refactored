const router = require("express").Router();
const IndPred = require ('../models/IndPred')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')

router.post("/register", upload.single('image'), async (req,res) => {

    try{
        const fileStr = req.body.data;
        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'indpreds',
            use_filename: true
           })
        
            //generate new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
            //create new indPred
        const newIndPred = new IndPred({
            indPredname: req.body.indPredname,
            mainTitle: req.body.mainTitle,
            title: req.body.title,
            INN: req.body.INN,
            password: hashedPassword,
            mainimg: result.secure_url,
            cloudinary_id: result.public_id,
        });
            //save indPred and respond
        const indPred = await newIndPred.save();
        res.status(200).json(indPred);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getindPredid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId

        const indPred = await IndPred.findOne({ owners: [userId] })

        const {_id,...other} = indPred._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/', async (req,res)=>{

try {
    const indPreds = await IndPred.find({owners:null})
    res.json(indPreds)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})

router.get('/:id', async (req,res)=>{

try {
    const indPreds = await IndPred.findById(req.params.id)
    res.json(indPreds)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})




module.exports = router