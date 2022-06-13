import express, { json } from "express";
import { QuestionModel } from "../models/question";
import isAuth from "../isauth";
import jwt from "jsonwebtoken";
import jwt_decode from 'jwt-decode';
import cookieParser from "cookie-parser";
import { UserModel } from "../models/user";
import { SubjectModel } from "../models/subject";

const Router = express.Router();
Router.use(cookieParser())
 

// Route: /questions
// Description : Rendering questions page
// params: none
// Access: Public
// Method : GET
Router.get('/',async(req, res)=>{
try {
  const encrypteduserdata= req.cookies.jwt;
  const userdata=jwt_decode(encrypteduserdata)
  const userid = JSON.parse(JSON.stringify(userdata.user))
  const fromdatabase = await UserModel.findById(userid)

  const subjects = fromdatabase.subject.map(elem=>{
    return elem.subject_name
  })
  res.render('questions',{subjects:subjects}); 
} catch (error) {
  res.send(error)
}

})

// Route: /questions
// Description : Questions Input
// params: none
// Access: Public
// Method : POST

Router.get('/update:qid',async(req, res)=>{
  const {qid} = req.params;
  const questionData=await QuestionModel.findById(qid)
  res.render('questionUpdate',{questionData:questionData,qid:qid}); 
})

Router.get('/show:qid',async(req,res)=>{
  const {qid} = req.params;
  const questionData=await QuestionModel.findById(qid)
  res.json({question:questionData})

})



Router.post('/', async(req, res)=>{
  try {
    console.log("in /question ")
     const {subject,chapter,diff,question,option1,option2,option3,option4,correct} = req.body;
     await QuestionModel.findQuestion(question);
     const questions = new QuestionModel({
      question:question,
      options:[option1,option2,option3,option4],
      correct_options:[correct],
      difficulty:diff,
      subject:subject,
      chapter:chapter,
      university:"Mumbai",
      branch:"INFT",
     })
    //  console.log(questions)
     await questions.save();
     console.log("question added")
    const getid = questions.getId()
    // console.log(getid)
    const userid= jwt_decode(req.cookies.jwt).user

    const updated = await UserModel.findByIdAndUpdate(userid,{
    $push:{
    question_submited:getid
    }
    })
    await updated.save()
     res.json({message:"Data added to the database"})
    }
    catch (error) {
     console.log(`you got a error ${error.message}`);
     res.json({"error":error.message});
  }
})


// Route: /question/update:qid
// Description : Update Questions
// params: qid
// Access: Public
// Method : POST

Router.post('/update:qid', async(req, res)=>{
  try {
    console.log('in update question')
     const qid = req.params.qid;
     const {subject,chapter,diff,question,option1,option2,option3,option4,correct} = req.body;
     const questions = await QuestionModel.findByIdAndUpdate(qid,{
      $set:{
      question:question,
      options:[option1,option2,option3,option4],
      correct_options:[correct],
      difficulty:diff,
      subject:subject,
      chapter:chapter,
      university:"Mumbai",
      branch:"INFT",
     }})
    //  console.log(questions)
     await questions.save();
    //  res.json({message:"Data added to the database"})
    res.redirect('/faculty')
    }
    catch (error) {
     console.log(`you got a error ${error.message}`);
     res.json({"error":error.message});
  }
})

// Route: /questions/chapter:subject_name
// Description : Update Questions
// params: subject_name
// Access: Public
// Method : GET
Router.get("/chapter:subject_name",async(req,res)=> {
  const {subject_name} = req.params;
  const subject_data = await SubjectModel.find({subject_name});
  res.json(subject_data)
})

Router.get("/delete:qid",async(req,res)=> {
  const userid= jwt_decode(req.cookies.jwt).user
  const {qid} = req.params;
  // console.log(qid)
  await QuestionModel.deleteOne({_id: qid})
  await UserModel.findByIdAndUpdate(userid,{$pull:{question_submited:qid,question_validated:qid}})
  res.redirect('/moderator')
})


Router.get("/approve:qid",async(req,res)=> {
  const userid= jwt_decode(req.cookies.jwt).user
  const {qid} = req.params;
  console.log(qid)
  await QuestionModel.findByIdAndUpdate(qid,{isValid:true})
  await UserModel.findByIdAndUpdate(userid,{$push:{question_validated:qid}})
  res.redirect('/moderator')
})

Router.get("/validate:qid",async(req,res)=> {
  const userid= jwt_decode(req.cookies.jwt).user
  const {qid} = req.params;
  console.log(qid)
  await QuestionModel.findByIdAndUpdate(qid,{isValid:true})
  await UserModel.findByIdAndUpdate(userid,{$push:{question_validated:qid}})
  res.redirect('/moderator/moderatorquestions')
})

Router.get("/disapprove:qid",async(req,res)=> {
  const userid= jwt_decode(req.cookies.jwt).user
  const {qid} = req.params;
  console.log(qid)
  await QuestionModel.findByIdAndUpdate(qid,{isValid:false})
  await UserModel.findByIdAndUpdate(userid,{$pull:{question_validated:qid}})
  res.redirect('/moderator')
})

Router.get("/disvalidate:qid",async(req,res)=> {
  const userid= jwt_decode(req.cookies.jwt).user
  const {qid} = req.params;
  console.log(qid)
  await QuestionModel.findByIdAndUpdate(qid,{isValid:false})
  await UserModel.findByIdAndUpdate(userid,{$pull:{question_validated:qid}})
  res.redirect('/moderator/moderatorquestionsvalidated')
})

export default Router;