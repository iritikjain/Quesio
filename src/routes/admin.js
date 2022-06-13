//Library
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import jwt_decode from "jwt-decode" 
require('dotenv').config();

//for sendgrid
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// models
import { AdminModel } from "../models/admin";
import { QuestionModel } from "../models/question";
import { CollegeModel } from '../models/college'
import { UserModel } from '../models/user'
import { SubjectModel } from '../models/subject'

// Authorisation
import isAuth from "../isauth";


const Router = express.Router();
Router.use(cookieParser())



Router.get('/',isAuth, async (req, res) => {
    const total_ques = await QuestionModel.find().count()
    const approved_question = await QuestionModel.find({ isValid: { '$eq': true } }).count()
    const pending_question = await QuestionModel.find({ isValid: { '$eq': false } }).count()
    const total_college = await CollegeModel.find().count()
    const total_faculty = await UserModel.find({ isVarified: { '$eq': 1 } }).count()
    const total_moderator = await UserModel.find({ isExpert: { '$eq': 1 } }).count()
    const total_subject = await SubjectModel.find().count()


    const total_chapter = await SubjectModel.aggregate([{ $project: { chapter: 1 } }])
    const chapters = total_chapter.map(elem => {
        return elem.chapter
    })
    const totalchapter = [... new Set([].concat.apply([], chapters))].length

    const total_branch = await CollegeModel.aggregate([{ $project: { branch: 1 } }])
    const branches = total_branch.map(elem => {
        return elem.branch
    })
    const totalbranch = [... new Set([].concat.apply([], branches))].length

    res.render('admin', {
        total_ques: total_ques, approved_question: approved_question,
        total_college: total_college, total_faculty: total_faculty, total_moderator: total_moderator,
        total_subject: total_subject, totalchapter: totalchapter, totalbranch: totalbranch, pending_question: pending_question
    })
})


Router.get('/college', isAuth,async (req, res) => {
    const collegelistdata = await CollegeModel.find()
   
    // console.log(collegelist)
    const collegedata = await UserModel.aggregate([
        {
            $match: { isVarified: { $eq: 1 } }
        },
        {
            "$group": {
                "_id": "$college",
                "faculty":{$sum:"$isFaculty"},
                "expert":{$sum:"$isExpert"}

            }
        }

    ])
    

    res.render('adminCollege',{collegelistdata,collegedata,isfacultyexist:false,isexpertexist:false})
})




Router.post('/collegedata',async(req,res)=>{
    try {
        
        const { university, college } = req.body;
        await CollegeModel.create({
          university: university,
          college_name: college,
        });
        res.redirect('/admin/college')
      } catch (error) {
    
        res.status(400).json({ error: error.message });
    
      }
})

Router.get('/college/delete:cid',async (req, res) => {
    await CollegeModel.deleteOne({_id: req.params.cid})
    res.redirect('/admin/college');
})


Router.get('/faculty', isAuth,async (req, res) => {
    const facultydata = await UserModel.find({ 'isFaculty': 1 })
    // console.log(facultydata)
    res.render('adminFaculty', { facultydata })
})

Router.get('/faculty/approve:uid',async (req, res) => {
    const data=await UserModel.findByIdAndUpdate(req.params.uid,{isVarified:true});
    await data.save();
    // console.log(data.email_id)
    const msg = {
        from: 'hg7527500@gmail.com',
        to: data.email_id,
        subject: 'Quesio - Account Verified',



        text:`
    
    
    
        Hello, Thanks For Registering On Our Website.
    
    
    
        Your Account Is Now Verified. You Can Now Sign In To Your Account.
    
    
    
        `,
    
    
    
        html : `
    
        <h1>Quesio</h1>
    
        <p>Hello, Thanks For Registering On Our Website.</p>
    
        <p>Your Account Is Now Verified. You Can Now Sign In To Your Account.</p>
    
        `
    
    }

    try{
        await sgMail.send(msg);
         
    }catch(error){
        console.log(error);   
    }

    res.redirect('/admin/faculty');
})

Router.get('/faculty/disapprove:uid',async (req, res) => {
    const data=await UserModel.findByIdAndUpdate(req.params.uid,{isVarified:false});
    await data.save();
    res.redirect('/admin/faculty');
})

Router.get('/faculty/delete:uid',async (req, res) => {
    await UserModel.deleteOne({_id: req.params.uid})
    console.log("in delete")
    res.redirect('/admin/faculty');
})

Router.get('/moderator',isAuth, async (req, res) => {
    const moderatordata = await UserModel.find({ 'isExpert': 1 })

    res.render('adminModerator', { moderatordata })
})

Router.get('/moderator/approve:uid',async (req, res) => {
    const data=await UserModel.findByIdAndUpdate(req.params.uid,{isVarified:true});
    await data.save();
    res.redirect('/admin/moderator');
})

Router.get('/moderator/disapprove:uid',async (req, res) => {
    const data=await UserModel.findByIdAndUpdate(req.params.uid,{isVarified:false});
    await data.save();
    res.redirect('/admin/moderator');
})
Router.get('/moderator/delete:uid',async (req, res) => {
    await UserModel.deleteOne({_id: req.params.uid})
    console.log("in moderator delete")
    res.redirect('/admin/moderator');
})


Router.get('/questions',isAuth, async (req, res) => {
    const questiondata = await QuestionModel.find({isValid:true})
    res.render('adminQuestions', { questiondata: questiondata })
})
Router.get("/delete:qid",async(req,res)=> {
    const userid= jwt_decode(req.cookies.jwt).user
    const {qid} = req.params;
    console.log(qid)
    await QuestionModel.deleteOne({_id: qid})
    // await UserModel.findByIdAndUpdate(userid,{$pull:{question_submited:qid,question_validated:qid}})
    res.redirect('/admin/questions')
  })



Router.get('/branchs',isAuth, async (req, res) => {
    const branchdata = await UserModel.aggregate([
        {
            $match: { isVarified: { $eq: 1 } }
        },
        {
            "$group": {
                "_id": "$branch",
                "faculty":{$sum:"$isFaculty"},
                "expert":{$sum:"$isExpert"},
                "data": { $push: "$$ROOT.question_submited" }

            }
        }

    ])

    const all_college = await CollegeModel.aggregate([{ $project: { college_name: 1 } }])
    const collegeslist=all_college.map(elem => {
        return elem.college_name
    })
    const total_branch = await CollegeModel.aggregate([{ $project: { branch: 1 } }])
    const branches = total_branch.map(elem => {
        return elem.branch
    })
    const totalbranch = [... new Set([].concat.apply([], branches))] 
    const colleges = [... new Set([].concat.apply([], collegeslist))] 
    // console.log(branchdata)
    // console.log(total_branch)
    // res.send(branchdata)

// console.log(colleges);

    res.render('adminBranch',{branchdata,totalbranch,colleges })
    
})



Router.post('/addbranch',async(req,res)=>{
        const collegename=req.body.college;
        const branchname=req.body.branch;
        const collegeid= await CollegeModel.findOneAndUpdate({college_name:collegename},{$push:{branch:branchname}})
         
    res.redirect('/admin/branchs')
    
})

Router.get('/branchdelete:bid',async(req,res)=>{
   
    await CollegeModel.updateMany({},{$pull:{branch:req.params.bid}});
    res.redirect('/admin/branchs')

})

Router.get('/subjects',isAuth, async(req, res) => {
    const subjects=await SubjectModel.aggregate([{$project:{_id:0,subject_name:1,branch:1}}])
    const all_college = await CollegeModel.aggregate([{ $project: { college_name: 1 } }])
    const collegeslist=all_college.map(elem => {
        return elem.college_name
    })
    const colleges = [... new Set([].concat.apply([], collegeslist))] 
    const data = await UserModel.aggregate([
        {
            $match: { isVarified: { $eq: 1 } }

        },
        {
            "$group": {
                "_id": "$subject.subject_name",
                "faculty":{$sum:"$isFaculty"},
                "expert":{$sum:"$isExpert"},
                "questions": { $push: "$$ROOT.question_submited" }

            }
        }

    ])
    let subject_detail=[]
    subjects.forEach(subject=>{
        let facultycount=0
        let expertcount=0
        let questioncount=0
        data.forEach(data=>{
            if(data._id.includes(subject.subject_name)){
                facultycount=facultycount+data.faculty;
                expertcount=expertcount+data.expert;
                questioncount=questioncount+data.questions[0].length
            }
        })
    subject_detail.push({'subject':subject.subject_name,'branch':subject.branch,"faculty":facultycount,"expert":expertcount,'questioncount':questioncount})
    })

//    res.send(subject_detail)

  
    res.render('adminSubject',{subject_detail,colleges})
})

Router.get('/branchdata:collegename',async(req,res)=>{
   
    const branchesforcollege=await CollegeModel.findOne({college_name:req.params.collegename}) 
    res.send(branchesforcollege.branch)
})

Router.post('/addsubject',async(req,res)=>{
    const { university,college,branch,subject}=req.body;
    await SubjectModel.create({subject_name:subject,branch:branch});
    res.redirect('/admin/subjects')
     
})

Router.get('/subjectdelete:sname',async(req,res)=>{
   
    await SubjectModel.deleteOne({subject_name:req.params.sname})
    res.redirect('/admin/subjects')

})
Router.get('/getsubjectlist:branchname',async(req,res)=>{
   
    const branchesforcollege=await SubjectModel.aggregate([{$match:{branch:req.params.branchname}},{$project:{subject_name:1}}])
    // const branchesforcollege=await SubjectModel.find() 
    res.send(branchesforcollege)
})

Router.get('/getquestiondata:subjectname',async(req,res)=>{
   
    try {
        const questiondata=await QuestionModel.aggregate([
            {$match:{subject:req.params.subjectname}},
            {$group:
                {"_id":"$difficulty",
                "count":{$sum:1}
            },
            }
        ])
        
        res.send(questiondata)
    } catch (error) {
        res.send(error)
    }
})


export default Router;