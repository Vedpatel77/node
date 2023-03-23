require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bcrypt = require('bcryptjs');
const hbs = require('hbs');
const cookieparser = require('cookie-parser');
const auth = require('./middleware/auth');

const port = process.env.PORT || 3000 ;
require('./db/conn');
const User = require('./model/schema');

static_path=path.join(__dirname,'../public');
views_path=path.join(__dirname,'../templates/views');
partials_path=path.join(__dirname,'../templates/partials');

app.use(cookieparser());
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",views_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/secret",auth,(req,res)=>{
    res.render("secret");
    // console.log(`this is cookie:${req.cookies.jwt}`);
})

app.get("/logout",auth,async(req,res)=>{
    try {
        console.log(req.user);

        req.user.tokens=req.user.tokens.filter((currentele)=>{
            return currentele.token!==Request.token;
        })
        res.clearCookie("jwt");
        console.log("logout successfuly");


        await req.user.save();
        res.render("login");

    } catch (error) {
        res.status(400).send(error);
    }
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.post("/register",async(req,res)=>{
    try {
        // console.log(req.body.firstName);
        // res.send(req.body.firstName);
        const registerUser = new User({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            password:req.body.password
        })

        const token = await registerUser.createtoken();

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true
        });

        const registeredUser = await registerUser.save();
        res.status(201).render("index");
    } catch (error) {
        res.status(400).send(error);
    }
    // res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
       
        const user = await User.findOne({email:email});
        
        const isMatch = await bcrypt.compare(password,user.password);

        const token = await user.createtoken();

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true
        });
        
        console.log(isMatch);

        if (isMatch) {
            res.status(200).render("index");
        } else {
            res.send("incorrect password");
        }
       
    } catch (error) {
        // alert("invalid login")
        res.status(400).render("invalid");
    }
})

app.listen(port,()=>{
    console.log(`server is listen on ${port}`);
})

