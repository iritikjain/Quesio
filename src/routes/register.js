//Library
import express from "express";
 

// models
import { UserModel } from "../models/user";
import { CollegeModel } from "../models/college";
import { SubjectModel } from "../models/subject";

const Router = express.Router();
 
// cloudinary
import  cloudinary from "../../utils/cloudinary"
import upload from "../../utils/multer";


Router.get('/branchdata:collegename', async (req, res) => {
   // console.log("in register branchdata")
   const branchesforcollege = await CollegeModel.findOne({ college_name: req.params.collegename })
   res.send(branchesforcollege.branch)
})

Router.get('/subjectdata:branchname', async (req, res) => {
   const data = await SubjectModel.find({branch:req.params.branchname}).select('subject_name')
   res.send(data )
})




// Route: /register
// Description : Rendering register page
// params: none
// Access: Public
// Method : GET
Router.get('/', async (req, res) => {
   const all_college = await CollegeModel.aggregate([{ $project: { college_name: 1 } }])
   const collegeslist = all_college.map(elem => {
      return elem.college_name
   })
   const colleges = [... new Set([].concat.apply([], collegeslist))]
   res.render('register', { colleges });
})

// Route: /register
// Description : Registering a new  user
// params: none
// Access: Public
// Method : POST
Router.post('/',upload.single("ugc"), async (req, res) => {
   try {
      const { name, email, phoneno, university, college, branch, password,  designation, nosubject } = req.body
       
      // await UserModel.findByEmail(req.body.email);

      //save to db
      const newUser = new UserModel({
         name: name,
         password: password,
         email_id: email,
         university: university,
         college: college,
         phone: phoneno,
         branch: branch
      });

      if (designation == 'faculty') {
         newUser.isFaculty = true;
         const data = []
         for (let i = 0; i < nosubject; i++) {
            var num = `${i + 1}`
            const sub = req.body['subject' + num];
            var yoe = req.body['yoe' + num];
            data.push({
               "subject_name": sub,
               "yearofexp": yoe
            })
         }
         // console.log(data)
         newUser.subject = data
      } else {
         newUser.isExpert = true;
         const data = []
         for (let i = 0; i < nosubject; i++) {
            var num = `${i + 1}`
            const sub = req.body['subject' + num];
            var yoe = req.body['yoe' + num];
            data.push({
               "subject_name": sub,
               "yearofexp": yoe
            })
         }
         // console.log(data)
         newUser.expertsubject = data
        
      }
       
      const result = await cloudinary.uploader.upload(req.file.path);
      // console.log(result)
      newUser.document=result.secure_url;
      await newUser.save()
      console.log(newUser);
      res.redirect('/login')


   } catch (error) {
      console.log(`you got a error ${error.message}`);
      res.json({ "error": error.message });
   }
})

export default Router;