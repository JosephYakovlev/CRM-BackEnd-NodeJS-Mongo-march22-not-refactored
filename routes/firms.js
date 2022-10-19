const router = require("express").Router();
const Firm = require ('../models/Firm')
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
            folder: 'firms',
            use_filename: true
           })
        
            //generate new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
            //create new firm
        const newFirm = new Firm({
            firmname: req.body.firmname,
            owners: req.body.owners,
            mainTitle: req.body.mainTitle,
            title: req.body.title,
            INN: req.body.INN,
            password: hashedPassword,
            mainimg: result.secure_url,
            cloudinary_id: result.public_id,
        });
            //save firm and respond
        const firm = await newFirm.save();
        res.status(200).json(firm);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getfirmid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId

        const firm = await Firm.findOne({ owners: [userId] })

        const {_id,...other} = firm._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/', async (req,res)=>{

try {
    const firms = await Firm.find({owners:null})
    res.json(firms)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})

router.get('/:id', async (req,res)=>{

try {
    const firms = await Firm.findById(req.params.id)
    res.json(firms)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})




module.exports = router