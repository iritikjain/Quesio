//Library
import express from "express";
import jwt from "jsonwebtoken";
import jwt_decode from 'jwt-decode';
import cookieParser from "cookie-parser";
import {isAuth,isFaculty} from "../isauth";

// models
import { UserModel } from "../models/user";

const Router = express.Router();
Router.use(cookieParser())

// Route: /faculty
// Description : Rendering faculty page
// params: none
// Access: Public
// Method : GET


Router.get('/', async(req, res)=>{
  const userid= jwt_decode(req.cookies.jwt).user
  const facultydetail = await UserModel.findById(userid).populate('question_submited')
  
  const subjects = facultydetail.subject.map(elem=>{
    return elem.subject_name
  })

  // res.send(facultydetail.question_submited);
  res.render('facultyDashboard',{usertype:"faculty",facultydetail,subjects}); 

})

Router.get('/profile',async(req, res)=>{
  try {
    const userid= jwt_decode(req.cookies.jwt).user
  const profile = await UserModel.findById(userid)
  res.render('profile',{usertype:"faculty",profile});
  } catch (error) {
    
  } 
})


Router.post('/profile', async (req, res) => {
  try {
    const userid = jwt_decode(req.cookies.jwt).user
    const totalsubandyoe=req.body.totalsubandyoe;
    const data = []
    for (let i = 0; i < totalsubandyoe; i++) {
      var num = `${i + 1}`
      const sub = req.body['subject' + num];
      var yoe = req.body['yoe' + num];
      data.push( {
         "subject_name": sub,
         "yearofexp": yoe
      } )
   }
    const profile = await UserModel.findByIdAndUpdate(userid, {

      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      email_id: req.body.email,
      university: req.body.university,
      college: req.body.college,
      phone: req.body.phone,
      branch: req.body.branch,
      $set:{subject:data}
    });

    console.log("profile")

    res.redirect('/faculty/profile')
  } catch (error) {

  }
})


export default Router;