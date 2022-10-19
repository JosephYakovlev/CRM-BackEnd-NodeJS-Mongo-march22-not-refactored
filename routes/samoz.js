const router = require("express").Router();
const Samoz = require ('../models/Samoz')
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
            folder: 'samoz',
            use_filename: true
           })
        
            //generate new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
            //create new samoz
        const newSamoz = new Samoz({
            samozname: req.body.samozname,
            owners: req.body.owners,
            mainTitle: req.body.mainTitle,
            title: req.body.title,
            INN: req.body.INN,
            password: hashedPassword,
            mainimg: result.secure_url,
            cloudinary_id: result.public_id,
        });
            //save samoz and respond
        const samoz = await newSamoz.save();
        res.status(200).json(samoz);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getsamozid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId

        const samoz = await Samoz.findOne({ owners: [userId] })

        const {_id,...other} = samoz._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/', async (req,res)=>{

try {
    const samozs = await Samoz.find({owners:null})
    res.json(samozs)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})

router.get('/:id', async (req,res)=>{

try {
    const samozs = await Samoz.findById(req.params.id)
    res.json(samozs)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})




module.exports = router