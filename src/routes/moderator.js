//Library
import express from "express";
import jwt from "jsonwebtoken";
import jwt_decode from 'jwt-decode';
import cookieParser from "cookie-parser";

// models
import { UserModel } from "../models/user";
import { QuestionModel } from "../models/question";

const Router = express.Router();
Router.use(cookieParser())

// Route: /moderator
// Description : Rendering moderator page
// params: none
// Access: Public
// Method : GET
Router.get('/', async (req, res) => {
  const userid = jwt_decode(req.cookies.jwt).user
  const moderatordetail = await UserModel.findById(userid).populate('question_submited')
  const subjects = moderatordetail.subject.map(elem => {
    return elem.subject_name
  })

  // res.send(moderatordetail.question_submited);
  res.render('moderatorDashboard', { usertype: "moderator", moderatordetail, subjects });

})


Router.get('/moderatorquestions', async (req, res) => {
  const pendingquestions = await QuestionModel.find({ isValid: false })

  res.render('moderate-questions', { usertype: "moderator", pendingquestions });
})

Router.get('/moderatorquestionsvalidated', async (req, res) => {
  const userid = jwt_decode(req.cookies.jwt).user
  const validatedquestions = await UserModel.find({ _id: userid }).populate('question_validated').select('question_validated');
  // res.send(validatedquestions[0].question_validated)
  res.render('moderate-questions-validated', { usertype: "moderator", validatedquestions });
})

Router.get('/getsubjectandyoe:subname', async (req, res) => {
  try {
    // console.log("in get sub yoe")
    const userid = jwt_decode(req.cookies.jwt).user;
    const data = await UserModel.findById(userid);
    const sub = req.params.subname;
    res.send(typedata.subject )
  } catch (error) {

  }
})



Router.get('/profile', async (req, res) => {
  const userid = jwt_decode(req.cookies.jwt).user
  const profile = await UserModel.findById(userid)
  res.render('profile', { usertype: "moderator", profile });
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

    res.redirect('/moderator/profile')
  } catch (error) {

  }
})

export default Router;