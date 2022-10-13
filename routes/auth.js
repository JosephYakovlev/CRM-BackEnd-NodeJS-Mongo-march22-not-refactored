const router = require("express").Router();
const User = require("../models/User");
const OpenedCase = require("../models/OpenedCase");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')


router.post("/register", upload.single('image'), async (req,res) => {

    
    try{
      console.log(req.body)

      const fileStr = req.body.avatar;
      const result = fileStr ? await cloudinary.uploader.upload(`data:image/jpeg;base64,${fileStr}`) : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'
      const realresult = fileStr ? result.url : https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png
      
      console.log(result)
            //generate new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
            //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: realresult,
            isZakaz4ik: req.body.isZakaz4ik,
            isPodryader: req.body.isPodryader,
            phoneNumber: req.body.phoneNumber, 
            dialogs: [{
              companion: 'BUILDER',
              type: 'PERSONAL MESSAGE',
              companionName: 'BUILDER',
              contractor: 'BUILDER',
              contractorUserName: 'BUILDER',
              contractorAvatar: 'BUILDER',
              owner: 'BUILDER',
              ownerUserName: 'BUILDER',
              ownerAvatar: 'BUILDER',
              avaimage: 'BUILDER',
              appliesTo: 'BUILDER',
              messages: [{
                messageSender: 'BOT BUILDER',
                messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                messageSenderUsername: 'BOT BUILDER',
                messageReciever: '',
                title: 'Добро пожаловать в строительный мир Builder! Развивайте ваше дело и успех незаставит себя ждать!',
                theme: 'PERSONAL MESSAGE',
                belongs: '',
                seen: 'UNSEEN' 
              }]
            }]                                  
            
        });

        

            //save user and respond
        const user = await newUser.save();

       
        

        const getToken = (user) => jwt.sign(
            {id: user._id, roles: user.role},
            process.env.JWTSECRET,
            {expiresIn: '1h'}
        )
        
            res.json({user, token: getToken(user)})

    } catch(err){
        res.status(500).json(err);
    }

});


// LOGIN

router.post(
    '/login',
    [
      check('email', 'Введите корректный email').normalizeEmail().isEmail(),
      check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(200).json({ message: 400 })
      }
  
      const {email, password} = req.body

     
  
      const user = await User.findOne({ email })
  
      if (!user) {
        return res.status(200).json({ message: 400 })
      }
      
      
      const isMatch = (password == user.password ? true : false )

      console.log('ISMATCH')
      console.log(isMatch)
  
      if (password != user.password) {
        return res.status(200).json({ message: 400 })
      }
  
      const getToken = (user) => jwt.sign(
        {id: user._id, roles: user.role},
        process.env.JWTSECRET,
        {expiresIn: '1h'}
    ) 

        const conContracts = user.concludingContracts
        const conOutContracts =  Promise.all( user.conContractOut.map(async outCon =>{
            const CCOwner =await User.findById(outCon.caseOwner)
            const outConId = outCon.idInOwner
           
            const ccindex = CCOwner.concludingContracts.findIndex( i => {
                return i._id == outConId;
              }) 
            
            const OwnerContract = CCOwner.concludingContracts[ccindex]
            
            return OwnerContract

        })).then(async (conOutContracts) => { 
            
          console.log('RELOAD 1')
       

          const conContrs = conContracts.concat(conOutContracts)

          const fullRunContrs = Promise.all ( user.runningContracts.map(async id =>{
            
            const runCon = await OpenedCase.findById(String(id))

            return runCon

             
          })).then((fullRunContrs) =>{
            console.log(fullRunContrs.length)
            console.log("CONCOTNRS")
            console.log(conContrs.length)

            

            res.status(200).json({user,conContrs,fullRunContrs, token: getToken(user)}) 
          })
        })


    
  
    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  })
  


  //Check

  router.post("/check", upload.single('image'), async (req,res) => {

    
    try{

      
        const {email} = req.body
  
        const user = await User.findOne({ email })


        //save user and respond
            
           
       
        

        const getToken = (user) => jwt.sign(
            {id: user._id, roles: user.role},
            process.env.JWTSECRET,
            {expiresIn: '1h'}
        )
        
            res.json({user, token: getToken(user)})

    } catch(err){
        res.status(500).json(err);
    }

});

router.get("/reload/:id", async(req,res) => {
  try {
    
    const _id = req.params.id
    
    
    const user = await User.findOne({ _id })
    

    const conContracts = user.concludingContracts

    const conOutContracts = Promise.all( user.conContractOut.map(async outCon =>{
            const CCOwner =await User.findById(outCon.caseOwner)
            const outConId = outCon.idInOwner
           
            const ccindex = CCOwner.concludingContracts.findIndex( i => {
                return i._id == outConId;
              }) 
            
            
            const OwnerContract = CCOwner.concludingContracts[ccindex]
            
            
                return OwnerContract
        })).then(async (conOutContracts) => { 
            
              console.log('RELOAD 1')
           

              const conContrs = conContracts.concat(conOutContracts)

              const fullRunContrs = Promise.all ( user.runningContracts.map(async id =>{
                
                const runCon = await OpenedCase.findById(String(id))

                return runCon

                 
              })).then((fullRunContrs) =>{
                console.log(fullRunContrs.length)
                console.log("CONCOTNRS")
                console.log(conContrs.length)
  
                
  
                res.status(200).json({user,conContrs,fullRunContrs}) 
              })
                
          
            })

  } catch (error) {
    res.status(500).json(err);
  }
}
)

module.exports = router
