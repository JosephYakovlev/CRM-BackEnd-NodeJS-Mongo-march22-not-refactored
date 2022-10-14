const express = require  ("express");
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const jwt = require('jsonwebtoken')
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const ticketRoute = require("./routes/tickets")
const openedCaseRoute = require ("./routes/openedCases")
const closedCaseRoute = require ("./routes/closedCases")
const socket = require("socket.io");
const cors = require("cors");
const io = require('socket.io')(3000,{
    cors:{
        origin: ['http://192.168.0.105:8800']
    }
})

dotenv.config();


mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log("Connected to MongoDB")
});

//middleware

app.use(bodyParser.json({limit: '150mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '150mb', extended: true}))
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(express.json({ extended: true}))

app.use("/api/users",userRoute)
app.use("/api/auth",authRoute)
app.use("/api/ticket",ticketRoute)
app.use("/api/openedCases",openedCaseRoute)
app.use("/api/closedCases",closedCaseRoute)

app.listen(process.env.PORT, () => {
    console.log(`Backend server is running on port: ${process.env.PORT}`)
})



  io.on('connection', socket => {
        console.log(socket.id)
    
      console.log(`User connected to socket with id #${socket.id}`);
    


    socket.on('first-connection', rooms => {
        
    })

    socket.on("join-room", room => {

        socket.join(room)

        socket.to(room).emit("hey", room)
    })

    socket.on("reload", (room) => {

        socket.to(room).emit("reload", room)
    })

    socket.on('send-message', (message,room)=> {
        socket.to(room).emit("hey", message)
    })

});
