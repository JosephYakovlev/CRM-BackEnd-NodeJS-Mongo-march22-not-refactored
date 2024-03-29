const router = require("express").Router();
const OpenedCase = require ('../models/OpenedCase')
const User = require("../models/User");
const Transaction = require("../models/Transaction")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {check, validationResult} = require('express-validator')

router.post("/registerCase",  async (req,res) => {

    try{

        const s = new Date(req.body.terms[0].mainTitle)
        const e = new Date(req.body.terms[0].title)
        const x = new Date(e) - new Date(s)
        const i = x/(3600000*24)
        console.log(typeof i)

        
        const termDays = i



        const workdays = [...Array(termDays)].map((i, index) => {

            let dayDate = new Date(req.body.terms[0].mainTitle)

            const dateCopy = new Date(dayDate.getTime());

            dateCopy.setDate(dateCopy.getDate() + (index+1))



            return {
                day: index+1,
                date: dateCopy,
                workDone: [],
                materialsWasted: [],
                price: 1,
                workers: [],
                paid: 0
            }
        })

        console.log(workdays)


        const realworkdays = workdays.length > 0 ? workdays : [{
            day: 1,
                  date: req.body.terms[0].mainTitle,
                  workDone: [],
                  materialsWasted: [],
                  price: 1,
                  workers: [],
                  paid: 0
          }]

      
        const newTrans = new Transaction({
            Sender: req.body.caseOwner,
            Reciever: req.body._id,
            Summ: req.body.terms[1].mainTitle,
            Context: "START CASE DEPOSIT",
            BelongsTo: req.body._id,
            PayFor: req.body._id
        })


        const newTansaction = await newTrans.save()

        

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.body.caseTicket
        },
        { 
            $inc: {
                wallet: -newTansaction.Summ,
            },
            $push: { transactions: newTansaction},
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Заказчик внес аванс в размере ${newTansaction.Summ} р.` ,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }

        });

        const msgtocontractor = await User.updateOne({
            _id: `${req.body.caseContractor}`,
            "dialogs.companion": req.body.caseTicket
        },
        { 
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Заказчик внес аванс в размере ${newTansaction.Summ} р.` ,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }

        });

        const updateTicketOwner = await User.updateOne({
            _id: `${req.body.caseOwner}`,
            "concludingContracts._id": req.body._id,
            "dialogs.companion": req.params.caseId,
        },
        {
            $set: { "concludingContracts.$.depositSeller": newTansaction.Summ},
            $push: { "concludingContracts.$.transactions": newTansaction} 
        });
        
            //create new openedCase
        const newOpenedCase = new OpenedCase({
            fromConContr: req.body._id,
            status: req.body.status,
            caseTicket: req.body.caseTicket,
            caseOwner: req.body.caseOwner,
            caseOwnerUserName: req.body.caseOwnerUserName,
            caseOwnerAvatar: req.body.caseOwnerAvatar,
            caseContractor: req.body.caseContractor,
            caseContractorUserName: req.body.caseContractorUserName,
            caseContractorAvatar: req.body.caseContractorAvatar,
            title: req.body.title,
            category: req.body.category,
            adress: req.body.adress,
            desc: req.body.desc,
            price: req.body.price,
            datec: req.body.datec,
            terms: req.body.terms, 
            depositSeller: req.body.depositSeller,
            depositCustomer: req.body.depositCustomer,
            openedCaseimg: req.body.openedCaseimg,
            averageAffirm: req.body.averageAffirm,
            workDays: realworkdays,
            depositOwner: newTansaction.Summ,
            depositContractor: req.body.depositCustomer ,
            transactions: [...req.body.transactions, newTansaction]
        });
            //save openedCase and respond
        const openedCase = await newOpenedCase.save();

       

        const userOwn = await User.findByIdAndUpdate(req.body.caseOwner, {
            $push: {runningContracts: openedCase._id}
        })

        const dialogmessages = userOwn.dialogs.find(i => {
            return i.companion == req.body.caseTicket
        })

        const stels = dialogmessages.messages

        const userCon = await User.findByIdAndUpdate(req.body.caseContractor, {
            $push: {runningContracts: openedCase._id}
        })

        const newmessage = [...stels,{
            messageSender: 'BOT BUILDER',
            messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
            messageSenderUsername: 'BOT BUILDER',
            messageReciever: '',
            title: 'Сделка заключена ! Начат отсчет времени на выполнение работ',
            theme: 'RUNNING CONTRACT',
            belongs: '',
            seen: 'UNSEEN'   
        }]

        console.log(newmessage)
        const DialogForSender = {
            companion: openedCase._id,
            type: 'RUNNING CONTRACT',
            companionName: req.body.title.substring(0,15),
            contractor: req.body.caseContractor,
            contractorUserName: req.body.caseContractorUserName,
            contractorAvatar: req.body.caseContractorAvatar,
            owner: req.body.caseOwner,
            ownerUserName: req.body.caseOwnerUserName,
            ownerAvatar: req.body.caseOwnerAvatar,
            avaimage: req.body.openedCaseimg,
            appliesTo: '',
            messages: newmessage,
        }

         const updateSender = await User.updateOne({
            _id: `${req.body.caseOwner}`,
        },
        {
            $push: { dialogs: DialogForSender},
            $pull: { "concludingContracts": {_id: req.body._id}}, 
        });

        const updateSender2 = await User.updateOne({
            _id: `${req.body.caseOwner}`,
        },
        {
            $pull: {"dialogs": {companion: req.body.caseTicket}}
        });

     


         const DialogForReciever = {
            companion: openedCase._id ,
            type: 'RUNNING CONTRACT',
            companionName: req.body.title.substring(0,15),
            avaimage: req.body.openedCaseimg,
            contractor: req.body.caseContractor,
            contractorUserName: req.body.caseContractorUserName,
            contractorAvatar: req.body.caseContractorAvatar,
            owner: req.body.caseOwner,
            ownerUserName: req.body.caseOwnerUserName,
            ownerAvatar: req.body.caseOwnerAvatar,
            appliesTo: '',
            messages: newmessage,
         }

         const updateReciever = await User.updateOne({
            _id: `${req.body.caseContractor}`,
        },
        {
            $push: { dialogs: DialogForReciever},
            $pull: { "conContractOut": {caseTicket: req.body.caseTicket}}
        });

        const updateReciever2 = await User.updateOne({
            _id: `${req.body.caseContractor}`,
        },
        {
            $pull: {"dialogs": {companion: req.body.caseTicket}}
        });

        
        res.status(200).json(openedCase);
        
    } catch(err){
        res.status(500).json(err);
    }

});


router.get("/getopenedCaseid/:userId", async(req,res)=>{
    try{

        const userId = req.params.userId

        const openedCase = await OpenedCase.findOne({ owners: [userId] })
     
        const {_id,...other} = openedCase._doc
        res.status(200).json(_id)  
    }catch(err){
        res.status(500).json(err)
    }
})










router.post("/addDoneWork/:caseId/:dayId", upload.single('image') , async (req, res) => {
    try { 


        const fileStr = req.body.img;

        const result = fileStr ? await cloudinary.uploader.upload(`data:image/jpeg;base64,${fileStr}`) : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'
        const realresult = fileStr ? result.url : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'
 
        const {owner, contractor, img, ...other} = req.body

        const addedWorkDone = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $push: { "workDays.$.workDone": {...other, img: realresult}} 
        });
        
        const msgforowner = await User.updateOne({
            _id: owner,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'На оплату выставлена новая работа.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });

        const msgforcontractor = await User.updateOne({
            _id: contractor,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'На оплату выставлена новая работа.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/addWorker/:caseId/:dayId" , upload.single('image') , async (req, res) => {
    try {


        const fileStr = req.body.img;
        const result = fileStr ? await cloudinary.uploader.upload(`data:image/jpeg;base64,${fileStr}`) : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'
        const realresult = fileStr ? result.url : 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664758091/placeholder_ypo85v.png'


        const {owner, contractor, img, ...other} = req.body


        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $push: { "workDays.$.workers": {...other, img: realresult}} 
        });

        const msgforowner = await User.updateOne({
            _id: owner,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'Новый рабочий добавлен на оплату.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });

        const msgforcontractor = await User.updateOne({
            _id: contractor,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'Новый рабочий добавлен на оплату.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });
       
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.post("/deleteWorker/:caseId/:dayId", async (req, res) => {
    try {
      

        const {owner, contractor, ...other} = req.body



        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $pull: { "workDays.$.workers": {_id: other._id}} 
        });
    
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/deleteDoneWork/:caseId/:dayId", async (req, res) => {
    try {


        const {owner, contractor, ...other} = req.body

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $pull: { "workDays.$.workDone": {_id: other._id}} 
        });
        

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/approveDoneWork/:caseId/:dayId", async (req, res) => {
    try {
        const {owner, contractor, ...other} = req.body


         
        const RngCon = await OpenedCase.findById(req.params.caseId)

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })

        

        const newDoneWork = currWrkDay.workDone.map(i => {
            if(i._id == req.body._id) {
                return {...i._doc, approved: 'YES'}
            } else {
                return i
            }

        })


        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $set: { "workDays.$.workDone": newDoneWork} 
        });

        const msgforowner = await User.updateOne({
            _id: owner,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'Работа принята',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });

        const msgforcontractor = await User.updateOne({
            _id: contractor,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'Работа принята.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });
        

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/approveWorker/:caseId/:dayId", async (req, res) => {
    try {


        const {owner, contractor, ...other} = req.body


         
        const RngCon = await OpenedCase.findById(req.params.caseId)

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })

        

        const newWorkers = currWrkDay.workers.map(i => {
            if(i._id == req.body._id) {
                return {...i._doc, approved: 'YES'}
            } else {
                return i
            }

        })

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $set: { "workDays.$.workers": newWorkers} 
        });

        const msgforowner = await User.updateOne({
            _id: owner,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { "dialogs.$.messages": {
                  messageSender: 'BOT BUILDER',
                  messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                  messageSenderUsername: 'BOT BUILDER',
                  messageReciever: '',
                  title: 'День работы рабочего принят.',
                  theme: 'PERSONAL MESSAGE',
                  belongs: '',
                  seen: 'UNSEEN' 
                }
            }
        });

        const msgforcontractor = await User.updateOne({
            _id: contractor,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: 'День работы рабочего принят.',
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });
        

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/payforwork/:caseId/:dayId", async (req, res) => {
    try {


        const {owner, contractor, ...other} = req.body

        const RngCon = await OpenedCase.findById(req.params.caseId)

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })


        const newTansaction = await newTrans.save()

        

        
        
        const newWorkDone = currWrkDay.workDone.map(i => {
            if(i._id == newTansaction.PayFor) {
                
                return {...i._doc, paid: newTansaction.Summ}
            } else {
                return i
            }

        })

       

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $set: { "workDays.$.workDone": newWorkDone },
            $push: {transactions: newTansaction}
        });

        

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Reciever}`,
            "dialogs.companion": req.params.caseId,
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
                    title: `Работа #${req.body.PayFor} оплачена с личного счета.`,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        const transToSender = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $inc: {
                wallet: -newTansaction.Summ,
            },
            $push: { transactions: newTansaction ,  
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Работа #${req.body.PayFor} оплачена с личного счета.`,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });
        
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/payforworkdeposit/:caseId/:dayId", async (req, res) => {
    try {
     

        const {owner, contractor, ...other} = req.body

        const RngCon = await OpenedCase.findById(req.params.caseId)
        

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })

        

        const newTansaction = await newTrans.save()

        

        
        
        const newWorkDone = currWrkDay.workDone.map(i => {
            if(i._id == newTansaction.PayFor) {
                
                return {...i._doc, paid: newTansaction.Summ}
            } else {
                return i
            }

        })
        

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $inc: {depositOwner: -newTansaction.Summ},
            $set: { "workDays.$.workDone": newWorkDone },
            $push: {transactions: newTansaction}
        });

        
        

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Reciever}`,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $inc: {
                wallet: newTansaction.Summ
            },
            $push: { transactions: newTansaction, "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Работа #${req.body.PayFor} оплачена с депозита сделки.`,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        const transToSender = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.params.caseId,
        },
        {
            $push: { transactions: newTansaction, "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Работа #${req.body.PayFor} оплачена с депозита сделки.`,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });






  router.post("/payforworker/:caseId/:dayId", async (req, res) => {
    try {

        const {owner, contractor, ...other} = req.body

        const RngCon = await OpenedCase.findById(req.params.caseId)

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })

        

        const newTansaction = await newTrans.save()

        
        
        const newWorkers = currWrkDay.workers.map(i => {
            if(i._id == newTansaction.PayFor) {
                
                return {...i._doc, paid: newTansaction.Summ}
            } else {
                return i
            }

        })

       

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        {
            $set: { "workDays.$.workers": newWorkers },
            $push: {transactions: newTansaction}
        });


        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Reciever}`,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $inc: {
                wallet: newTansaction.Summ,
            },
            $push: { transactions : newTansaction,
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: 'День работы рабочего оплачен с личного счета.',
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        const transToSender = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.params.caseId,
        },
        { 
            $inc: {
                wallet: -newTansaction.Summ,
            },
            $push: { transactions: newTansaction, "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: 'День работы рабочего оплачен с личного счета.',
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/payforworkerdeposit/:caseId/:dayId", async (req, res) => {
    try {

        const {owner, contractor, ...other} = req.body

        const RngCon = await OpenedCase.findById(req.params.caseId)

        const currWrkDay =  RngCon.workDays.find(i => {
            return i._id == req.params.dayId
        })
         
        const newTrans = new Transaction({
            Sender: req.body.Sender,
            Reciever: req.body.Reciever,
            Summ: req.body.Summ,
            Context: req.body.Context,
            BelongsTo: req.body.BelongsTo,
            PayFor: req.body.PayFor
        })

        const newTansaction = await newTrans.save()

        

        
        
        const newWorkers = currWrkDay.workers.map(i => {
            if(i._id == newTansaction.PayFor) {
                
                return {...i._doc, paid: newTansaction.Summ}
            } else {
                return i
            }

        })


       

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
            "workDays._id": req.params.dayId,
        },
        { 
            $inc: {
                depositOwner: -newTansaction.Summ,
            },
            $set: { "workDays.$.workers": newWorkers},

            $push: {transactions: newTansaction}
        });

        

        const transToReciever = await User.updateOne({
            _id: `${newTansaction.Reciever}`,
            "dialogs.companion": req.params.caseId,
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
                    title: 'День работы рабочего плачен с депозита сделки.',
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });


        const transToSender = await User.updateOne({
            _id: `${newTansaction.Sender}`,
            "dialogs.companion": req.params.caseId,
        },
        {
            $push: { transactions: newTansaction, "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: 'День работы рабочего оплачен с депозита сделки.',
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            }
        });

        
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });











router.get('/', async (req,res)=>{

try {
    const openedCases = await OpenedCase.find({owners:null})
    res.json(openedCases)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'}) 
}

})

router.get('/:id', async (req,res)=>{

try {
    const openedCase = await OpenedCase.findById(req.params.id)
    res.json(openedCase)
} catch (e) {
    res.status(500).json({message: 'Что-то пошло не так'})
}

})



router.post("/voteowner/:caseId", async (req, res) => {
    try {

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
        },
        {
            $set: { "voteEndOwner": true} 
        });
        
        const owner = req.body.owner
        const contractor = req.body.contractor

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/unvoteowner/:caseId", async (req, res) => {
    try {

        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`,
        },
        {
            $set: { "voteEndOwner": false} 
        });
        
        const owner = req.body.owner
        const contractor = req.body.contractor

        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.post("/votecontractor/:caseId", async (req, res) => {
    try {

    
        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`
        },
        {
            $set: { "voteEndContractor": true} 
        });
        
        const owner = req.body.owner
        const contractor = req.body.contractor
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.post("/unvotecontractor/:caseId", async (req, res) => {
    try {

    
        const addedWorker = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`
        },
        {
            $set: { "voteEndContractor": false} 
        });
        
        const owner = req.body.owner
        const contractor = req.body.contractor
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });



  router.post("/finalcaseclose/:caseId", async (req, res) => {
    try {

    
        const caseClosed = await OpenedCase.updateOne({
            _id: `${req.params.caseId}`
        },
        {
            $set: { "caseClosed": true, voteEndOwner: true, voteEndContractor: true} 
        })
        
        const caseClosedOwner = await User.updateOne({
            _id: `${req.body.owner}`
        },
        {
            $pull: { "runningContracts": req.params.caseId},
            $push: { "finishedContracts": req.params.caseId} 
        })


        const transToSender = await User.updateOne({
            _id: `${req.body.owner}`,
            "dialogs.companion": req.params.caseId,
        },
        {
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Сделка #${req.params.caseId} закрыта.` ,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                }
            },
            $set: {
                "dialogs.$.type" : "CLOSED CONTRACT"
            }
        })

        const caseClosedContractor = await User.updateOne({
            _id: `${req.body.contractor}`
        },
        {
            $pull: { "runningContracts": req.params.caseId},
            $push: { "finishedContracts": req.params.caseId}  
        })


        const transToReciever = await User.updateOne({
            _id: `${req.body.contractor}`,
            "dialogs.companion": req.params.caseId,
        },
        {
            $push: { 
                "dialogs.$.messages": {
                    messageSender: 'BOT BUILDER',
                    messageSenderAvatar: 'https://res.cloudinary.com/stroyka-ru/image/upload/v1664024876/logo_a2yphv.png',
                    messageSenderUsername: 'BOT BUILDER',
                    messageReciever: '',
                    title: `Сделка # ${req.params.caseId} закрыта.`,
                    theme: 'PERSONAL MESSAGE',
                    belongs: '',
                    seen: 'UNSEEN' 
                },
            },
            $set: {
                "dialogs.$.type" : "CLOSED CONTRACT"
            }
        })

      
        
        const owner = req.body.owner
        const contractor = req.body.contractor
        res.status(200).json({owner, contractor})

    } catch (err) {
      res.status(500).json(err);
    }
  });




module.exports = router