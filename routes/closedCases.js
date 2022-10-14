const router = require("express").Router();
const ClosedCase = require ('../models/ClosedCase')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')

router.post("/register", upload.single('image'), async (req,res) => {

    try{
        const fileStr = req.body.data;
        const result = await cloudinary.uploader.upload(fileStr)
        
            //generate new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
            //create new closedCase
        const newClosedCase = new ClosedCase({
            closedCasename: req.body.closedCasename,
            owners: req.body.owners,
            mainTitle: req.body.mainTitle,
            title: req.body.title,
            INN: req.body.INN,
            password: hashedPassword,
            mainimg: result.secure_url,
            cloudinary_id: result.public_id,
        });
            //save closedCase and respond
        const closedCase = await newClosedCase.save();
        res.status(200).json(closedCase);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getclosedCaseid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId

        const closedCase = await ClosedCase.findOne({ owners: [userId] })

        const {_id,...other} = closedCase._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/', async (req,res)=>{

try {
    const closedCases = await ClosedCase.find({owners:null})
    res.json(closedCases)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})

router.get('/:id', async (req,res)=>{

try {
    const closedCases = await ClosedCase.findById(req.params.id)
    res.json(closedCases)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})




module.exports = router