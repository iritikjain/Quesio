//Library
import express from "express";
import jwt from "jsonwebtoken";
import jwt_decode from 'jwt-decode';
import cookieParser from "cookie-parser";

// models
import { UserModel } from "../models/user";

// Authorisation
import isAuth from "../isauth";

const Router = express.Router();
Router.use(cookieParser())









Router.get('/as', isAuth, (req, res) => {
  // res.json({token: req.mytoken})
  res.send(req.cookies.jwt)
})

// Route: /login
// Description : Rendering login page
// params: none
// Access: Public
// Method : GET
Router.get('/', (req, res) => {
  
  res.render('login',{loginmessage:false});

})

Router.get('/you',(req,res)=>{
  const encrypteduserdata =req.cookies.jwt;
  
  const userdata = jwt_decode(encrypteduserdata);
  
  const usertype = JSON.parse(JSON.stringify(userdata.usertype))
  
  if (usertype == 'admin') { res.redirect('/admin') }
  if (usertype == 'faculty') { res.redirect('/faculty') }
  if (usertype == 'expert') { res.redirect('/moderator') }
  
} )

// Route: /login
// Description : Loging in user
// params: none
// Access: Public
// Method : POST
Router.post('/', async (req, res) => {
  try {
    const user = await UserModel.findByEmailAndPassword(req.body.password, req.body.email);
    if(user.isuser==null){
      return res.render('login',{loginmessage:user});
    }
    if (user.isuser) {
      // generate jwt token
      const token = user.user.generateJwtToken();
      // console.log(token)
      // res.redirect('/')
      res.cookie('jwt', token)
      // res.json({
      //   token:token
      // })
   
    } else {
     
      const token = user.admin.generateJwtTokenadmin();
      res.cookie('jwt', token)
      
    }
    
    res.redirect('/login/you')
   

  } catch (error) {
    console.log(`You got a error ${error.message}`);
    res.json({ "error": error.message });
  }
})

Router.get('/forgetpassword', (req, res) => {
  
  res.render('password-reset');

})


export default Router;