const User = require("../models/User");
const Transaction = require("../models/Transaction")
const router = require("express").Router();
const bcrypt = require("bcrypt");
const events = require('events')
const role = require('../middleware/role.middleware');
const OpenedCase = require("../models/OpenedCase");
const Ticket = require("../models/Ticket");


const emitter = new events.EventEmitter();


//update user

router.post("/addmoney", async(req,res) => {
            try{
                
                console.log("HELLO 11")

        

        console.log("HELLO 12")
        console.log(req.body)
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })

        

        const newTansaction = await newTrans.save()

        console.log(newTansaction)

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Reciever}`,
            "dialogs.companion": "BUILDER",
        },
        { 
            $inc: {
                wallet: newTansaction.Summ,
            },
            $push: { transactions: newTansaction,
            "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title:`Пополнение счета на сумму ${newTansaction.Summ} р.`,
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                } }
            
        });

        console.log("HELLO 15")
        console.log(transToReciever)

        
        
        res.status(200).json(req.body.Reciever)
            }catch (err){
                return res.status(507).json(err);
            }
})

router.put("/:id", async(req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                    const salt = await bcrypt.genSalt(12)
                    req.body.password = await bcrypt.hash(req.body.password, salt);
                }
                
                catch(err) {
                    return res.status(502).json(err);
                }
            }

            try{
                const user = await User.findByIdAndUpdate(req.params.id, {
                     $set: req.body,
                });
                res.status(200).json("acc has been updated")
            }catch (err){
                return res.status(507).json(err);
            }



    } else{
        return res.status(403).json("you can upadate only your account")
    }
})

//delete user

router.delete("/:id", async(req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                    const salt = await bcrypt.genSalt(12)
                    req.body.password = await bcrypt.hash(req.body.password, salt);
                }
                
                catch(err) {
                    return res.status(502).json(err);
                }
            }

            try{
                const user = await User.findByIdAndDelete(req.params.id);
                res.status(200).json("acc has been deleted")
            }catch (err){
                return res.status(507).json(err);
            }



    } else{
        return res.status(403).json("you can delete only your account")
    }
})



//get a user

router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        const {password,updatedAt, ...other} = user._doc
        res.status(200).json(other)  
    }catch(err){
        res.status(500).json(err)
    }
})

//get all users

router.get('/userFindOne', async (req,res)=>{
    try{   
        const users =  await User.find({}).sort({datec: -1})
        res.json(users)
    } catch (e){
        res.status(500).json({message: 'smth went wrong'})
    }
})

router.get("/", async(req,res)=>{
    try{
        const users = await User.find({isPodryader: true}).sort({datec: -1});
        console.log("UUSSSERS")
        res.status(200).json(users)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/contractors", async(req,res)=>{
    try{
        const users = await User.find({});
        console.log(users)
        res.status(200).json(users)  
    }catch(err){
        res.status(500).json(err)
    }
})

router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        const {password,updatedAt, ...other} = user._doc
        res.status(200).json(other)  
    }catch(err){
        res.status(500).json(err)
    }
})

//follow user

router.put("/:id/follow", async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: {followers: req.body.userId } });
                await currentUser.updateOne({ $push: {followings: req.params.id } });
                res.status(200).json("user has been followed");
            }else {
                res.status(403).json("you allready follow this user")
            }
        } catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you cant follow yourself")
    }
});

//unfollow user

router.put("/:id/unfollow", async(req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: {followers: req.body.userId } });
                await currentUser.updateOne({ $pull: {followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            }else {
                res.status(403).json("you are not following user")
            }
        } catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you cant unfollow yourself")
    }
});


router.put("/addfirm/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user.firms.includes(req.body.firmId)) {
        await user.updateOne({ $push: { firms: req.body.firmId } });
        res.status(200).json("The post has been liked");
      } 
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // Concluding contracts

//   router.post("/:id", async(req,res)=>{
//     try{
//         const user = await User.findById(req.params.id);
//         const {password,updatedAt, ...other} = user._doc
//         res.status(200).json(other)  
//     }catch(err){
//         res.status(500).json(err)
//     }
// })

    router.post('/newterm/:id/:caseId',  async (req, res) => {
      
    
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.id}`,
            "concludingContracts._id": req.params.caseId,
        },
        {
             $push: { "concludingContracts.$.terms": req.body} 
        });
        

       const user = await User.findById(req.params.id)

       const currentConcContractInex = user.concludingContracts.findIndex(i => i._id == req.params.caseId)
        
        
        const updatedConcContract = user.concludingContracts[currentConcContractInex]

        res.status(200).json(updatedConcContract)
        // .json(user.concludingContracts[currentConcContractInex])
    })

    router.get('/reloadConConPage/:id/:caseId',  async (req, res) => {
        
    
       const user = await User.findById(req.params.id)
       const currentConcContractInex = user.concludingContracts.findIndex(i => i._id == req.params.caseId)
        
        
        
        const updatedConcContract = user.concludingContracts[currentConcContractInex]

        res.status(200).json(updatedConcContract)
        // .json(user.concludingContracts[currentConcContractInex])
    })




    router.get("/:id", async(req,res)=>{
        try{
            const user = await User.findById(req.params.id);
            const {password,updatedAt, ...other} = user._doc
            res.status(200).json(other)  
        }catch(err){
            res.status(500).json(err)
        }
    })
    

    
    

    router.get("/getactivecontracts/:id", async(req,res)=>{
        try{
            const user = await User.findById(req.params.id).then( async (user) => {
            const runningContracts =  Promise.all( user.runningContracts.map(async runConId =>{
                const runCon = await OpenedCase.findById(runConId)

                    return runCon
            })).then((runningContracts) => { 
                console.log(runningContracts)
                res.status(200).json(runningContracts) 
            })   
    
        })
            
        }catch(err){
            res.status(500).json(err)
        }
    })



    router.get("/gettickets/:id", async(req,res)=>{
        try{
            const user = await User.findById(req.params.id).then( async (user) => {
          
            const outTickets =  Promise.all( user.tickets.map(async tickId =>{
                const fticket = await Ticket.findById(tickId)
           
                    return fticket
            })).then((outTickets) => { 
                
                res.status(200).json(outTickets) 
            })   
    
        })
            
        }catch(err){
            res.status(500).json(err)
        }
    })



    router.get("/getclosedcontracts/:id", async(req,res)=>{
        try{
            const user = await User.findById(req.params.id).then( async (user) => {
                const finCases =  Promise.all( user.finishedContracts.map(async tickId =>{
                    const fcase = await OpenedCase.findById(tickId)
               
                        return fcase
            })).then((finCases) => { 
                
                res.status(200).json(finCases) 
            })   
    
        })
            
        }catch(err){
            res.status(500).json(err)
        }
    })





router.get("/getconclcontracts/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).then( async (user) => {
        const conContracts = user.concludingContracts
        const conOutContracts =  Promise.all( user.conContractOut.map(async outCon =>{
            const CCOwner =await User.findById(outCon.caseOwner)
            const outConId = outCon.idInOwner
           
            const ccindex = CCOwner.concludingContracts.findIndex( i => {
                return i._id == outConId;
              }) 
            
            
            const OwnerContract = CCOwner.concludingContracts[ccindex]
            
            
                return OwnerContract
        })).then((conOutContracts) => { 
            

            const conContrs = conContracts.concat(conOutContracts)
            res.status(200).json(conContrs) 
        })   

    })
        
    }catch(err){
        res.status(500).json(err)
    }
})


router.put("/acceptTermByOwner/:termId/:ConContractId/:ownerId/:contractorId", async (req, res) => {
    try {
        console.log("HELLO 1")
        const user = await User.findById(req.params.ownerId);
      
        console.log("HELLO 2")
        console.log(user)


        const ConContr = user.concludingContracts.find(i => {
            return i._id == req.params.ConContractId
        })

        console.log("HELLO 3")
        console.log(req.params.contractorId)

        const newTerms = ConContr.terms.map(i=>{
            if(i._doc._id == req.params.termId) {
                console.log(i)
                return {...i._doc, acceptedByOwner: req.params.ownerId }
            } else
            return i
        })

        console.log("HELLO 4")
        console.log(newTerms)
        
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "concludingContracts._id": req.params.ConContractId,
        },
        {
            $set: { "concludingContracts.$.terms": newTerms} 
        });

        console.log("HELLO 5")
        console.log(updateTicketOwner)
        res.status(200).json({owner: req.params.ownerId, contractor: req.params.contractorId})

    } catch (err) {
      res.status(500).json(err);
    }
  });

router.put("/acceptTermByContractor/:termId/:ConContractId/:ownerId/:contractorId", async (req, res) => {
    try {
        console.log("HELLO 6")
        const user = await User.findById(req.params.ownerId);
      
        console.log("HELLO 7")
        console.log(req.params.contractorId)


        const ConContr = user.concludingContracts.find(i => {
            return i._id == req.params.ConContractId
        })

        console.log("HELLO 8")
        console.log(ConContr)

        const newTerms = ConContr.terms.map(i=>{
            if(i._doc._id == req.params.termId) {
                console.log(i)
                return {...i._doc, acceptedByContractor: req.params.contractorId }
            } else
            return i
        })

        console.log("HELLO 9")
        console.log(newTerms)
        
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "concludingContracts._id": req.params.ConContractId,
        },
        {
            $set: { "concludingContracts.$.terms": newTerms} 
        });

        console.log("HELLO 10")
        console.log(updateTicketOwner)
        res.status(200).json({owner: req.params.ownerId, contractor: req.params.contractorId})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.put("/patchterm/:ConContractId/:ownerId/:contractorId", async (req, res) => {
    try {
        console.log("HELLO 11")
        console.log(req.body)
        const user = await User.findById(req.params.ownerId);
      
        console.log("HELLO 12")


        const ConContr = user.concludingContracts.find(i => {
            return i._id == req.params.ConContractId
        })

        console.log("HELLO 13")

        const newTerms = ConContr.terms.map(i=>{
            if(i._doc._id == req.body._id) {
                let termitos = {
                    author: req.body.author,
                    mainTitle: req.body.mainTitle,
                    _id: req.body._id,
                    title: req.body.title,
                    acceptedByContractor: req.body.acceptedByContractor,
                    acceptedByOwner: req.body.acceptedByOwner 
                }
                console.log(termitos)
                return termitos
            } else
            return i
        })

        console.log("HELLO 14")
        console.log(newTerms)
        
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "concludingContracts._id": req.params.ConContractId,
        },
        {
            $set: { "concludingContracts.$.terms": newTerms} 
        });

        console.log("HELLO 15")
        console.log(updateTicketOwner)
        res.status(200).json({owner: req.params.ownerId, contractor: req.params.contractorId})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.put("/deleteterm/:ConContractId/:ownerId/:contractorId", async (req, res) => {
    try {
        console.log("HELLO 16")
        console.log(req.body)
        const user = await User.findById(req.params.ownerId);
      
        console.log("HELLO 17")


        const ConContr = user.concludingContracts.find(i => {
            return i._id == req.params.ConContractId
        })

        console.log("HELLO 18")
        console.log(req.body._id)
        

        const newTerms = ConContr.terms.filter(i => 
            String(i._id) !== req.body._id
        )

        console.log("HELLO 19")

        console.log(newTerms)
        
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "concludingContracts._id": req.params.ConContractId,
        },
        {
            $set: { "concludingContracts.$.terms": newTerms} 
        });

        console.log("HELLO 20")
        res.status(200).json({owner: req.params.ownerId, contractor: req.params.contractorId})

    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.post("/paydeposit/:ConContractId/:ownerId/:caseTicket", async (req, res) => {
    try {
        console.log("HELLO 16")
      
        const {owner, contractor, ...other} = req.body

        console.log("HELLO 12")
        console.log(req.body)
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })

        const newTansaction = await newTrans.save()

        
        console.log(newTansaction)

        
        const updateTicketOwner = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "concludingContracts._id": req.params.ConContractId,
        },
        {
            $set: { "concludingContracts.$.depositCustomer": newTansaction.Summ},
            $push: { "concludingContracts.$.transactions": newTansaction} 
        });


        console.log('HELLO !!$!')
        

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.params.caseTicket
        },
        { 
            $inc: {
                wallet: -newTansaction.Summ,
            },
            $push: { transactions: newTansaction,
             "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: `Подрядчик внес аванс в размере ${newTansaction.Summ} р.`,
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }} 

        });

        const msgtocontractor = await User.updateOne({
            _id: `${req.params.ownerId}`,
            "dialogs.companion": req.params.caseTicket
        },
        { 
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Подрядчик внес аванс в размере ${newTansaction.Summ} р.` ,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }

        });

        console.log("HELLO 15")
        res.status(200).json({owner: req.params.ownerId, contractor: req.body.Sender})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/msgwithdialog", async (req, res) => {
    try {
        console.log("HELLO 18")

        const {senderImg, recieverImg, recieverUserName, ...other} = req.body


        const DialogForSender = {
            companion: req.body.messageReciever ,
            type: req.body.theme,
            avaimage: recieverImg,
            companionName: recieverUserName,
            appliesTo: req.body.belongs,
            messages: [other],
         }

         const updateSender = await User.updateOne({
            _id: `${req.body.messageSender}`,
        },
        {
            $push: { dialogs: DialogForSender} 
        });


        console.log("HELLO 12")

         const DialogForReciever = {
            companion: req.body.messageSender ,
            type: req.body.theme,
            companionName: req.body.messageSenderUsername,
            avaimage: senderImg,
            appliesTo: req.body.belongs,
            messages: [other],
         }

         const updateReciever = await User.updateOne({
            _id: `${req.body.messageReciever}`,
        },
        {
            $push: { dialogs: DialogForReciever} 
        });


        
    

        console.log("HELLO 15")
        res.status(200).json({sender: req.body.messageSender, reciever: req.body.messageReciever})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/newmessage", async (req, res) => {
    try {
        console.log("HELLO 18")

         const updateSender = await User.updateOne({
            _id: `${req.body.messageSender}`,
            "dialogs.companion": req.body.messageReciever,
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });


        console.log("HELLO 12")

         const updateReciever = await User.updateOne({
            _id: `${req.body.messageReciever}`,
            "dialogs.companion": req.body.messageSender,
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });


        console.log("HELLO 15")
        res.status(200).json({sender: req.body.messageSender, reciever: req.body.messageReciever})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/newconcludingmessage", async (req, res) => {
    try {
        console.log("HELLO 18")

        console.log(req.body)

         const updateSender = await User.updateOne({
            _id: `${req.body.messageSender}`,
            "dialogs.companion": req.body.belongs
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });


        console.log("HELLO 12")

         const updateReciever = await User.updateOne({
            _id: `${req.body.messageReciever}`,
            "dialogs.companion": req.body.belongs
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });

        console.log(updateSender)
        console.log(updateReciever)

        console.log("HELLO 15")
        res.status(200).json({sender: req.body.messageSender, reciever: req.body.messageReciever})

    } catch (err) {
      res.status(500).json(err);
    }
  });


router.post("/newrunningconmessage", async (req, res) => {
    try {
        console.log("HELLO 18")

        console.log(req.body)

         const updateSender = await User.updateOne({
            _id: `${req.body.messageSender}`,
            "dialogs.companion": req.body.belongs
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });


        console.log("HELLO 12")

         const updateReciever = await User.updateOne({
            _id: `${req.body.messageReciever}`,
            "dialogs.companion": req.body.belongs
        },
        {
            $push: { "dialogs.$.messages": req.body} 
        });


        console.log("HELLO 15")
        res.status(200).json({sender: req.body.messageSender, reciever: req.body.messageReciever})

    } catch (err) {
      res.status(500).json(err);
    }
});


router.post("/seendialog/:user/:dialog/:companion", async (req, res) => {
    try {

            
            if(req.params.companion != "BUILDER") {
            console.log(req.params.user)
            console.log(req.params.dialog)
            console.log(req.params.companion)

            const user = await User.findById(req.params.user)


            const currdia = user.dialogs.find(i => {
                return i._id == req.params.dialog
            })

            const nmsgforse = currdia.messages.map(i => {
                if(i.messageSender != req.params.user){
                    return {
                        ...i._doc, 
                        unseen: "NO",
                        seen: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664937045/SeekPng.com_whatsapp-png_71379_z9lwux.png'
                    }
                }

                return i._doc
            })

            const nmsgforre = currdia.messages.map(i => {
                
                if(i.messageSender == req.params.companion) {
                    return {
                        ...i._doc, 
                        unseen: "NO",
                        seen: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664937045/SeekPng.com_whatsapp-png_71379_z9lwux.png'
                    }
                }
                    return i._doc
                
            })


        

            const updateSender = await User.updateOne({
                _id: `${req.params.user}`,
                "dialogs._id": req.params.dialog
            },
            {
                $set: { "dialogs.$.messages": nmsgforse} 
            });


            const dicomp = currdia.type === "PERSONAL MESSAGE" ? req.params.user : currdia.companion 

            console.log("HELLO 12")

            const updateReciever = await User.updateOne({
                _id: `${req.params.companion}`,
                "dialogs.companion": `${dicomp}`
            },
            {
                $set: { "dialogs.$.messages": nmsgforre} 
            });


            console.log("HELLO 15")
            res.status(200).json({sender: req.params.user, reciever: req.params.companion})
        } else {
            const user = await User.findById(req.params.user)


            const currdia = user.dialogs.find(i => {
                return i.companion == req.params.companion
            })

            const nmsgforse = currdia.messages.map(i => {
                if(i.messageSender != req.params.user){
                    return {
                        ...i._doc, 
                        unseen: "NO",
                        seen: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664937045/SeekPng.com_whatsapp-png_71379_z9lwux.png'
                    }
                }

                return i._doc
            })

            const updateSender = await User.updateOne({
                _id: `${req.params.user}`,
                "dialogs.companion": req.params.companion
            },
            {
                $set: { "dialogs.$.messages": nmsgforse} 
            });

            console.log(updateSender)
            res.status(200).json({sender: req.params.user, reciever: req.params.companion})

        }

    } catch (err) {
      res.status(500).json(err);
    }
});


router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        const {password,updatedAt, ...other} = user._doc
        res.status(200).json(other)  
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = router