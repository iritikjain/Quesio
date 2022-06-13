//Library
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { QuestionModel } from "../models/question";
import { CollegeModel } from "../models/college";

const Router = express.Router();

Router.get('/',async(req, res)=>{
  const total_branch = await CollegeModel.aggregate([{ $project: { branch: 1 } }])
  const branches = total_branch.map(elem => {
      return elem.branch
  })
  const totalbranch = [... new Set([].concat.apply([], branches))]
  // console.log(totalbranch)
  res.render('qbgenerate',{totalbranch})
  
})

Router.post('/',async(req, res)=>{

    const {university,branch,subject,timeduration,marks,date,totalquestions,easyquestions,moderatequestions,hardquestions} = req.body;
    
    const data=await QuestionModel.aggregate([
     {$match:{subject}},
     {$group:{
     "_id":"$difficulty",
     "questiondata": {
       $push: "$$ROOT"
   },count:{$sum:1}
     }
   }])
   
   
   function shuffle(array) {
     let currentIndex = array.length ,  randomIndex;
     // While there remain elements to shuffle...
     while (currentIndex != 0) {
       // Pick a remaining element...
       randomIndex = Math.floor(Math.random() * currentIndex);
       currentIndex--;
       // And swap it with the current element.
       [array[currentIndex], array[randomIndex]] = [
         array[randomIndex], array[currentIndex]];
     }
     return array;
   }
   
   let mydata ={"easy":[],"medium":[],"hard":[]}
   for (let index = 0; index < data.length; index++) {
       if (data[index]._id=='easy'){
        mydata.easy.push(data[index].questiondata)
       }
       if (data[index]._id=='medium'){
        mydata.medium.push(data[index].questiondata)
       }
       if (data[index]._id=='hard'){
        mydata.hard.push(data[index].questiondata)
       }
   }
   
  //  let myeasy=mydata.easy[0].slice(0,ceasy)
  let myeasy=shuffle(mydata.easy[0]).slice(0,easyquestions)
  let mymedium=shuffle(mydata.medium[0]).slice(0,moderatequestions)
  let myhard=shuffle(mydata.hard[0]).slice(0,hardquestions)
   
  res.render('questionpaper',{university,subject,branch,myeasy,mymedium,myhard,timeduration,marks,date,count:1,totalquestions})

   
   });



export default Router;