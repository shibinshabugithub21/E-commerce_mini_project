const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan=require('morgan')
const nocache = require("nocache");
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const app = express();
const path = require('path');
require('dotenv').config()
// Body parsing middleware (for handling form data)
app.use(express.urlencoded({ extended: true }));
app.use(nocache()); // use destroy cache 
app.use(flash());
app.use('/productImages', express.static(path.resolve(__dirname, 'productImages')));

app.use(morgan('dev'));
app.use(express.json()) 
// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


// connecting moongodb

    mongoose.connect(`mongodb://${process.env.DATABASE}`).then(()=>{
        console.log('mongodb had connected');
    }).catch(()=>{
        console.log('mongodb has not connected');
    })


// requiring routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');



app.use(express.static('public')); // In here, use the public folder as static.
app.set('views', path.join(__dirname, 'views')); // Setting up path.
app.set('view engine', 'ejs'); // Setting EJS as the view engine.


app.use((req, res, next) =>{
    console.log(req.url, "=> this is the request url"); 
    next();
})
// Setting the routers.
app.use('/', userRouter); // To user
app.use('/admin', adminRouter);// To admin
// middelware for erroe handle
app.get("*",(req,res)=>{
    res.render("error")
})


app.listen(process.env.PORT, () => {
    console.log(`Server is running at port number${process.env.PORT}`);
});
