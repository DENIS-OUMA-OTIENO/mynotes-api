require('dotenv').config();
const express = require('express');
const app = express();
const  { logger } = require("./middleware/logger")
const cookies = require("cookie-parser")
const cors = require("cors")
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConn")
const mongoose = require("mongoose")
const { logEvents } = require("./middleware/logger")

connectDB()
app.use(logger)

app.use(cookies())

app.use(cors(corsOptions))
app.options('*', cors())


//middleware to process json
app.use(express.json())

//telling express wher to find static files css or image used on  a server
app.use('/', express.static(path.join(__dirname, '/public'))); 
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes.js'))
app.use('/users', require('./routes/userRoutes.js'))
app.use('/notes', require('./routes/notesRoutes.js'))

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')){
        res.json({message: '404 not found'})
    } else {
        res.type('txt').send('404 not found')
    }
})

app.use(errorHandler)

// emit connection event when connected
mongoose.connection.once("open", () => {
    console.log("connected to mongoDB")
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
})


// emit error event when connection is failing
mongoose.connection.on("error", (error) => {
    logEvents(`${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`, "mongoDBErrLog.log")
})


