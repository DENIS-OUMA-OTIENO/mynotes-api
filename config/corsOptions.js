const allowedOrigins = require("./allowedOrigin")

const corsOptions = {
    origin: (callback) => {
        if(allowedOrigins){
            callback(null, true) //error obj, allowed 
        } else {
            callback(new Error("Not allowed by cors"))
        }

    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions